import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Database, MapPin, TrendingUp, TrendingDown, Loader2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchAbsCpi,
  fetchQldRetailDatasets,
  fetchGoldCoastDatasets,
} from "@/lib/liveData";

function SourceShell({
  title,
  source,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  source: string;
  icon: typeof Database;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="card-glow relative overflow-hidden border-border/60 bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {source}
          </div>
          <div className="mt-1 text-sm font-semibold">{title}</div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label={`Open ${source}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Fetching live data…
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <div>
        <div className="font-medium">Source unavailable</div>
        <div className="mt-0.5 text-destructive/80">{message}</div>
      </div>
    </div>
  );
}

function AbsCard() {
  const q = useQuery({
    queryKey: ["abs-cpi"],
    queryFn: fetchAbsCpi,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  return (
    <SourceShell
      title="Consumer Price Index · All Groups (national)"
      source="ABS Data API"
      icon={Database}
      href="https://data.api.abs.gov.au/"
    >
      {q.isLoading ? (
        <LoadingBlock />
      ) : q.isError ? (
        <ErrorBlock message={(q.error as Error)?.message ?? "Unknown error"} />
      ) : q.data ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              {q.data.latestValue.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">index · {q.data.latestPeriod}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Badge
              variant="outline"
              className={
                q.data.changePct >= 0
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }
            >
              {q.data.changePct >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {q.data.changePct >= 0 ? "+" : ""}
              {q.data.changePct.toFixed(2)}% QoQ
            </Badge>
            <span className="text-muted-foreground">
              vs {q.data.previousValue.toFixed(1)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Purchasing-power signal for discretionary spend on furniture.
          </p>
        </div>
      ) : null}
    </SourceShell>
  );
}

function QldCard() {
  const q = useQuery({
    queryKey: ["qld-datasets"],
    queryFn: fetchQldRetailDatasets,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return (
    <SourceShell
      title="Gold Coast retail-adjacent datasets"
      source="QLD Open Data (CKAN)"
      icon={Database}
      href="https://www.data.qld.gov.au/"
    >
      {q.isLoading ? (
        <LoadingBlock />
      ) : q.isError ? (
        <ErrorBlock message={(q.error as Error)?.message ?? "Unknown error"} />
      ) : q.data ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">{q.data.count}</span>
            <span className="text-xs text-muted-foreground">matching datasets</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {q.data.topTitles.map((t) => (
              <li key={t} className="line-clamp-1">
                · {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SourceShell>
  );
}

function GoldCoastCard() {
  const q = useQuery({
    queryKey: ["gc-datasets"],
    queryFn: fetchGoldCoastDatasets,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return (
    <SourceShell
      title="Local infrastructure & demographic layers"
      source="City of Gold Coast · ArcGIS"
      icon={MapPin}
      href="https://data.goldcoast.qld.gov.au/"
    >
      {q.isLoading ? (
        <LoadingBlock />
      ) : q.isError ? (
        <ErrorBlock message={(q.error as Error)?.message ?? "Unknown error"} />
      ) : q.data ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">{q.data.count}</span>
            <span className="text-xs text-muted-foreground">published datasets</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {q.data.sampleTitles.map((t) => (
              <li key={t} className="line-clamp-1">
                · {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SourceShell>
  );
}

export function LiveDataPanel() {
  return (
    <section aria-labelledby="live-data-heading">
      <div className="flex items-end justify-between">
        <div>
          <h2 id="live-data-heading" className="text-lg font-semibold tracking-tight">
            Live Data Feeds
          </h2>
          <p className="text-xs text-muted-foreground">
            Streaming from public government &amp; open-data APIs. Cached client-side.
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </Badge>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <AbsCard />
        <QldCard />
        <GoldCoastCard />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Commercial sources (Tourism Research Australia, economy.id/NIEIR, CBRE, NAB) are
        gated / subscription-only and are not wired into this dashboard.
      </p>
    </section>
  );
}
