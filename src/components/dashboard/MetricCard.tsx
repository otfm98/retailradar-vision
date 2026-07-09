import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  accent: "success" | "warning" | "primary";
  trailingIcon?: LucideIcon;
}

const accentMap = {
  success: {
    chip: "bg-success/10 text-success ring-1 ring-success/30",
    glow: "from-success/20",
  },
  warning: {
    chip: "bg-warning/10 text-warning ring-1 ring-warning/30",
    glow: "from-warning/20",
  },
  primary: {
    chip: "bg-primary/10 text-primary ring-1 ring-primary/30",
    glow: "from-primary/20",
  },
};

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  trailingIcon: Trailing,
}: MetricCardProps) {
  const a = accentMap[accent];
  return (
    <Card className="card-glow relative overflow-hidden border-border/60 bg-card p-6">
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-radial ${a.glow} to-transparent opacity-70 blur-2xl`}
      />
      <div className="relative flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.chip}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-5 flex items-baseline gap-2">
        <div className="text-4xl font-semibold tracking-tight">{value}</div>
        {Trailing && <Trailing className={`h-5 w-5 ${accent === "warning" ? "text-warning" : accent === "success" ? "text-success" : "text-primary"}`} />}
      </div>
      <div className="relative mt-2 text-sm text-muted-foreground">{hint}</div>
    </Card>
  );
}
