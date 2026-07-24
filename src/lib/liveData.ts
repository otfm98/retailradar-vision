// Live data sources for the Gold Coast furniture dashboard.
// ABS CPI is proxied server-side via /api/abs/cpi. QLD and Gold Coast calls
// still run browser-side. If a source is unreachable (CORS, downtime,
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
 * quarterly index numbers. Proxied through GET /api/abs/cpi (server-side SDMX fetch).
 * https://data.api.abs.gov.au/rest/data/ABS,CPI,1.1.0/1.10001.10.50.Q
 */
export async function fetchAbsCpi(): Promise<AbsCpiResult> {
  const res = await fetch("/api/abs/cpi");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `ABS proxy responded ${res.status}`);
  }
  return res.json();
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
  const url = "https://www.data.qld.gov.au/api/3/action/package_search?q=gold+coast+retail&rows=5";
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
 * City of Gold Coast Open Data — the city publishes through ArcGIS Hub.
 * We hit the ArcGIS Open Data v3 API and search by title for datasets
 * published by City of Gold Coast staff.
 */
export async function fetchGoldCoastDatasets(): Promise<GoldCoastDatasetResult> {
  const url =
    "https://opendata.arcgis.com/api/v3/datasets?q=%22City+of+Gold+Coast%22&page%5Bsize%5D=5";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gold Coast Open Data responded ${res.status}`);
  const json = await res.json();
  const data = json?.data ?? [];
  const total = json?.meta?.stats?.totalCount ?? data.length;
  return {
    count: total,
    sampleTitles: data
      .slice(0, 3)
      .map((d: { attributes?: { name?: string } }) => d?.attributes?.name ?? "Untitled"),
  };
}
