import type { QldDatasetResult } from "./liveData";

const QLD_RETAIL_SEARCH_URL =
  "https://www.data.qld.gov.au/api/3/action/package_search?q=gold+coast+retail&rows=5";

/**
 * Server-side QLD Open Data (CKAN) fetch and parse.
 * https://www.data.qld.gov.au/api/3/action/package_search
 */
export async function fetchQldRetailDatasetsFromUpstream(): Promise<QldDatasetResult> {
  const res = await fetch(QLD_RETAIL_SEARCH_URL);
  if (!res.ok) throw new Error(`QLD Open Data responded ${res.status}`);
  const json = await res.json();
  if (!json?.success) throw new Error("QLD Open Data returned unsuccessful response");
  const results = json.result?.results ?? [];
  return {
    count: json.result?.count ?? results.length,
    topTitles: results.slice(0, 3).map((r: { title: string }) => r.title),
  };
}
