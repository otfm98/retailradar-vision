import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, AlertTriangle, TrendingUp, Sofa, Package, LineChart } from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PredictorChart } from "@/components/dashboard/PredictorChart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RetailRadar — Gold Coast Furniture Sales Forecasting" },
      {
        name: "description",
        content:
          "Predictive analytics for Gold Coast furniture retailers. Forecast sales of couches, dining settings, outdoor furniture and more across the coming season.",
      },
      { property: "og:title", content: "RetailRadar — Gold Coast Furniture Sales Forecasting" },
      {
        property: "og:description",
        content:
          "Predictive analytics for Gold Coast furniture retailers. Forecast sales of couches, dining settings, outdoor furniture and more across the coming season.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [sector, setSector] = useState("Apparel");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sector={sector} onSectorChange={setSector} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {sector} · Q4 Outlook
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Good morning. Here's what's <span className="text-gradient">coming next.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Live predictive signals across foot traffic, inventory demand, and consumer sentiment
              — refreshed 2 minutes ago.
            </p>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Expected Foot Traffic"
            value="+12%"
            hint="vs. prior 30 days · 1.42M projected visits"
            icon={Users}
            accent="success"
            trailingIcon={ArrowUpRight}
          />
          <MetricCard
            label="Inventory Demand"
            value="High"
            hint="Restock apparel & seasonal SKUs within 7 days"
            icon={Package}
            accent="warning"
            trailingIcon={AlertTriangle}
          />
          <MetricCard
            label="Consumer Spending Index"
            value="Rising"
            hint="Sentiment up 8.4 pts week-over-week"
            icon={LineChart}
            accent="primary"
            trailingIcon={TrendingUp}
          />
        </section>

        <section className="mt-6">
          <PredictorChart />
        </section>

        <footer className="mt-10 flex items-center justify-between border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <span>RetailRadar · Predictive intelligence for modern retail</span>
          <span>Model v4.2 · Updated 2 min ago</span>
        </footer>
      </main>
    </div>
  );
}
