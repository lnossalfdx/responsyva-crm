import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ArrowUpRight, GripVertical, Sparkles } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { formatCurrency } from "@/lib/utils";
import type { Lead } from "@/data/mock-data";

type PipelineCardProps = {
  lead: Lead;
  overlay?: boolean;
  onClick?: (lead: Lead) => void;
};

export function PipelineCard({ lead, overlay = false, onClick }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "lead", lead },
    disabled: overlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging && !overlay ? "opacity-35" : ""}>
      <Card
        className="space-y-2.5 rounded-[22px] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3 shadow-[0_16px_32px_rgba(0,0,0,0.22)] transition hover:border-emerald-300/20 hover:bg-white/[0.09]"
        onClick={overlay ? undefined : () => onClick?.(lead)}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                <Sparkles className="size-3" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold leading-tight text-white">{lead.name}</p>
                <p className="truncate text-[12px] text-zinc-400">{lead.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <ArrowUpRight className="size-3 text-emerald-300" />
              {lead.origin}
            </div>
          </div>
          <button
            className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-zinc-400 transition hover:text-white"
            onClick={(event) => event.stopPropagation()}
            {...(!overlay ? attributes : {})}
            {...(!overlay ? listeners : {})}
          >
            <GripVertical className="size-3" />
          </button>
        </div>

        <div className="rounded-[18px] border border-white/8 bg-black/20 p-2.5">
          <div className="mb-2.5 space-y-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.26em] text-zinc-500">Valor estimado</p>
              <p className="mt-1 text-[16px] font-semibold tracking-tight text-white">{formatCurrency(lead.estimatedValue)}</p>
            </div>
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
              Score {lead.score}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="min-w-0 rounded-[16px] border border-white/8 bg-white/5 px-2.5 py-2">
              <p className="truncate text-[8px] uppercase tracking-[0.16em] text-zinc-500">Responsável</p>
              <p className="mt-1 truncate text-[12px] font-medium text-zinc-100">{lead.owner}</p>
            </div>
            <div className="min-w-0 rounded-[16px] border border-white/8 bg-white/5 px-2.5 py-2">
              <p className="truncate text-[8px] uppercase tracking-[0.16em] text-zinc-500">Prioridade</p>
              <p className="mt-1 truncate text-[12px] font-medium text-zinc-100">{lead.priority}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {lead.tags.map((tag) => (
            <Badge key={tag} tone="slate" className="px-2 py-0.5 text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
