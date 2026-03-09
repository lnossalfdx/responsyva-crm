import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { pipelineStageMap } from "@/stores/use-crm-store";
import { PipelineCard } from "@/components/pipeline/pipeline-card";
import { type Lead, type PipelineStageId } from "@/data/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

type PipelineColumnProps = {
  stageId: PipelineStageId;
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
};

export function PipelineColumn({ stageId, leads, onLeadClick }: PipelineColumnProps) {
  const stage = pipelineStageMap[stageId];
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[560px] w-[258px] min-w-[258px] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-3 transition-all",
        isOver && "border-emerald-300/35 bg-emerald-400/5",
      )}
    >
      <div className={cn("mb-3 rounded-[20px] border border-white/10 bg-gradient-to-r p-3.5", stage.accent)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-semibold leading-none tracking-tight text-white">{stage.title}</h3>
            <p className="mt-1.5 text-sm text-zinc-200">{leads.length} oportunidades</p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-zinc-100">
            {formatCurrency(leads.reduce((acc, lead) => acc + lead.estimatedValue, 0))}
          </div>
        </div>
      </div>

      <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {leads.map((lead) => (
            <PipelineCard key={lead.id} lead={lead} onClick={onLeadClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
