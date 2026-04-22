"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeviceMode = "desktop" | "tablet" | "mobile";

const OPTS: Array<{ v: DeviceMode; label: string; icon: typeof Monitor }> = [
  { v: "desktop", label: "Desktop", icon: Monitor },
  { v: "tablet", label: "Tablet", icon: Tablet },
  { v: "mobile", label: "Mobile", icon: Smartphone },
];

export function DeviceToggle({
  value,
  onChange,
}: {
  value: DeviceMode;
  onChange: (v: DeviceMode) => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-white p-0.5">
      {OPTS.map((o) => {
        const Icon = o.icon;
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            aria-label={o.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function deviceWidth(m: DeviceMode): number | "100%" {
  if (m === "desktop") return "100%";
  if (m === "tablet") return 768;
  return 375;
}
