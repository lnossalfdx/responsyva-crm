import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  tone?: "emerald" | "violet" | "rose" | "amber" | "slate";
  className?: string;
};

const tones = {
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  slate: "border-white/10 bg-white/5 text-zinc-300",
};

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
