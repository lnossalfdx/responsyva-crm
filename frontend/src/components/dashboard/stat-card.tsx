import { ArrowDownRight, ArrowUpRight, GripVertical, Minus } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/shared/card";
import { cn, expandCompactNumbersInText } from "@/lib/utils";
import type { KPI } from "@/data/mock-data";

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export function StatCard({ label, value, delta, trend }: KPI) {
  const normalizedValue = expandCompactNumbersInText(value);
  const normalizedDelta = expandCompactNumbersInText(delta);
  const Icon = trendIcon[trend];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: label });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "relative overflow-hidden touch-none select-none",
        isDragging && "border-emerald-300/25 shadow-[0_24px_80px_rgba(0,0,0,0.46)]",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-zinc-400">{label}</p>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label={`Reordenar ${label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-tight text-white">{normalizedValue}</p>
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-2xl border",
              trend === "up" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
              trend === "down" && "border-rose-400/30 bg-rose-400/10 text-rose-200",
              trend === "neutral" && "border-white/10 bg-white/5 text-zinc-300",
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
        <p className="text-xs text-zinc-500">{normalizedDelta}</p>
      </div>
    </Card>
  );
}
