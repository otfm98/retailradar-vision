// Live data sources for the Gold Coast furniture dashboard.
// All calls run browser-side. If a source is unreachable (CORS, downtime,
// schema change) the caller shows an error state — no silent fallback data.

export interface AbsCpiResult {
  latestPeriod: string;
  latestValue: number;
  previousValue: number;
  changePct: number;
  series: { period: string; value: number }[];
}

/**
 * ABS Consumer Price Index — All groups, weighted average of 8 capital cities,
 * quarterly index numbers. SDMX-JSON via the public ABS Data API.
 * https://data.api.abs.gov.au/rest/data/ABS,CPI,1.1.0/1.10001.10.50.Q
 */
export async function fetchAbsCpi(): Promise<AbsCpiResult> {
  const url =
    "https://data.api.abs.gov.au/rest/data/ABS,CPI,1.1.0/1.10001.10.50.Q?startPeriod=2022-Q1&format=jsondata";
  const res = await fetch(url, { headers: { Accept: "application/vnd.sdmx.data+json" } });
  if (!res.ok) throw new Error(`ABS API responded ${res.status}`);
  const json = await res.json();

  const dataSets = json?.data?.dataSets?.[0] ?? json?.dataSets?.[0];
  const structure = json?.data?.structure ?? json?.structure;
  const timeDim =
    structure?.dimensions?.observation?.find((d: { id: string }) => d.id === "TIME_PERIOD") ??
    structure?.dimensions?.observation?.[0];
  const periods: { name: string }[] = timeDim?.values ?? [];

  const seriesKey = Object.keys(dataSets?.series ?? {})[0];
  const observations = dataSets?.series?.[seriesKey]?.observations ?? {};

  const series = Object.entries(observations)
    .map(([idx, val]) => ({
      period: periods[Number(idx)]?.name ?? idx,
      value: Number((val as unknown[])[0]),
    }))
    .filter((s) => Number.isFinite(s.value));

  if (series.length < 2) throw new Error("ABS CPI series returned no data");

  const latest = series[series.length - 1];
  const previous = series[series.length - 2];
  return {
    latestPeriod: latest.period,
    latestValue: latest.value,
    previousValue: previous.value,
    changePct: ((latest.value - previous.value) / previous.value) * 100,
    series,
  };
}

export interface QldDatasetResult {
  count: number;
  topTitles: string[];
}

/**
 * Queensland Government Open Data — CKAN search for Gold Coast retail /
 * furniture / consumer datasets. Supports CORS.
 */
export async function fetchQldRetailDatasets(): Promise<QldDatasetResult> {
  const url =
    "https://www.data.qld.gov.au/api/3/action/package_search?q=gold+coast+retail&rows=5";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`QLD Open Data responded ${res.status}`);
  const json = await res.json();
  if (!json?.success) throw new Error("QLD Open Data returned unsuccessful response");
  const results = json.result?.results ?? [];
  return {
    count: json.result?.count ?? results.length,
    topTitles: results.slice(0, 3).map((r: { title: string }) => r.title),
  };
}

export interface GoldCoastDatasetResult {
  count: number;
  sampleTitles: string[];
}

/**
 * City of Gold Coast Open Data — ArcGIS Hub v3 search. Filters datasets
 * published by the City of Gold Coast organisation.
 */
export async function fetchGoldCoastDatasets(): Promise<GoldCoastDatasetResult> {
  const url =
    "https://hub.arcgis.com/api/search/v1/collections/dataset/items?filter=source:%22City%20of%20Gold%20Coast%22&limit=5";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gold Coast Open Data responded ${res.status}`);
  const json = await res.json();
  const features = json?.features ?? [];
  const total = json?.meta?.stats?.totalCount ?? features.length;
  return {
    count: total,
    sampleTitles: features
      .slice(0, 3)
      .map((f: { properties?: { title?: string } }) => f?.properties?.title ?? "Untitled"),
  };
}
