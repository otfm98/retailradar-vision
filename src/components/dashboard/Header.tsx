import { Radar, ChevronDown, Bell, Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  sector: string;
  onSectorChange: (s: string) => void;
}

const SECTORS = [
  "All Furniture",
  "Couches & Sofas",
  "Dining Settings",
  "Outdoor Furniture",
  "Coffee Tables",
  "Bedroom",
  "Office & Study",
];

export function Header({ sector, onSectorChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_-4px_var(--primary)]">
              <Radar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">RetailRadar</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Predictive Intelligence
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 gap-2 border-border/60 bg-secondary/40 text-sm font-medium transition-all hover:border-primary/40 hover:bg-secondary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                {sector}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Retail Sectors</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SECTORS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onSectorChange(s)}
                  className="cursor-pointer"
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 transition-transform hover:scale-105">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 transition-transform hover:scale-105">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
          </Button>
          <div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-accent to-primary ring-2 ring-border/60" />
        </div>
      </div>
    </header>
  );
}
