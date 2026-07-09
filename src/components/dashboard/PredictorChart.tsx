import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";

// Next 6 months of forecast furniture sales revenue (AUD, thousands).
// Gold Coast seasonality: pre-summer outdoor + Christmas dining surge Nov-Dec,
// Boxing Day / January sales carry-over, then a March cool-down.
const BASE = [
  { month: "Aug", value: 380 },
  { month: "Sep", value: 445 },
  { month: "Oct", value: 610 },
  { month: "Nov", value: 1180 },
  { month: "Dec", value: 1520 },
  { month: "Jan", value: 1340 },
];

export function PredictorChart() {
  const [optimism, setOptimism] = useState<number[]>([6]);
  const factor = 0.7 + optimism[0] * 0.06; // 0.76 → 1.3

  const data = useMemo(
    () =>
      BASE.map((d) => ({
        ...d,
        predicted: Math.round(d.value * factor),
        baseline: d.value,
      })),
    [factor],
  );

  const peak = Math.max(...data.map((d) => d.predicted));

  return (
    <Card className="border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Predictor Engine
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Predicted Furniture Sales · Gold Coast
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Forecast horizon: next 6 months · Revenue in AUD · Confidence 94%
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
            <TrendingUp className="mr-1 h-3 w-3" />
            Peak ${peak.toLocaleString()}K in Dec
          </Badge>
        </div>
      </div>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="predictedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--color-muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(v) => `${v}K`}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
              formatter={(v: number, name) => [`${v.toLocaleString()}K shoppers`, name === "predicted" ? "Predicted" : "Baseline"]}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="var(--color-chart-2)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#baselineFill)"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              fill="url(#predictedFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-secondary/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Economic Optimism Index</div>
            <div className="text-xs text-muted-foreground">
              Adjust market sentiment to reforecast in real time
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-gradient">{optimism[0]}</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
        </div>
        <Slider
          value={optimism}
          onValueChange={setOptimism}
          min={1}
          max={10}
          step={1}
          className="mt-5"
        />
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
      </div>
    </Card>
  );
}
