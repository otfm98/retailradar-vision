import type { AbsCpiResult } from "./liveData";

const ABS_CPI_URL =
  "https://data.api.abs.gov.au/rest/data/ABS,CPI,1.1.0/1.10001.10.50.Q?startPeriod=2022-Q1&format=jsondata";

/**
 * Server-side ABS CPI fetch and SDMX-JSON parse.
 * https://data.api.abs.gov.au/rest/data/ABS,CPI,1.1.0/1.10001.10.50.Q
 */
export async function fetchAbsCpiFromUpstream(): Promise<AbsCpiResult> {
  const headers: Record<string, string> = { Accept: "application/vnd.sdmx.data+json" };
  const apiKey = process.env.ABS_API_KEY;
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const res = await fetch(ABS_CPI_URL, { headers });
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
