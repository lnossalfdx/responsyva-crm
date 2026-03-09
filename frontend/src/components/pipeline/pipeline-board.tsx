import { DndContext, DragOverlay, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useMemo, useState } from "react";
import { pipelineStages, type Lead, type PipelineStageId } from "@/data/mock-data";
import { useCrmStore } from "@/stores/use-crm-store";
import { PipelineColumn } from "@/components/pipeline/pipeline-column";
import { PipelineCard } from "@/components/pipeline/pipeline-card";

function getStageFromId(id: string): PipelineStageId | null {
  return pipelineStages.some((stage) => stage.id === id) ? (id as PipelineStageId) : null;
}

export function PipelineBoard({
  visibleLeads,
  onLeadClick,
}: {
  visibleLeads?: Lead[];
  onLeadClick?: (lead: Lead) => void;
}) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const leads = useCrmStore((state) => state.leads);
  const moveLead = useCrmStore((state) => state.moveLead);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));
  const boardLeads = visibleLeads ?? leads;

  const leadsByStage = useMemo(
    () =>
      pipelineStages.reduce(
        (acc, stage) => {
          acc[stage.id] = boardLeads.filter((lead) => lead.stage === stage.id);
          return acc;
        },
        {} as Record<PipelineStageId, Lead[]>,
      ),
    [boardLeads],
  );

  function onDragStart(event: DragStartEvent) {
    const lead = event.active.data.current?.lead as Lead | undefined;

    if (lead) {
      setActiveLead(lead);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;

    if (!over) {
      return;
    }

    const currentLead = active.data.current?.lead as Lead | undefined;
    const overLead = over.data.current?.lead as Lead | undefined;
    const nextStage = getStageFromId(String(over.id)) ?? overLead?.stage;

    if (currentLead && nextStage && currentLead.stage !== nextStage) {
      moveLead(currentLead.id, nextStage);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      modifiers={[restrictToFirstScrollableAncestor, restrictToWindowEdges]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="relative max-w-full overflow-hidden rounded-[34px] border border-white/10 bg-black/20 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-4 flex flex-wrap gap-2">
          {pipelineStages.map((stage) => (
            <div
              key={stage.id}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300"
            >
              <span className="size-2 rounded-full bg-emerald-300" />
              <span>{stage.title}</span>
              <span className="font-semibold text-white">{leadsByStage[stage.id].length}</span>
            </div>
          ))}
        </div>
        <div className="max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2">
          <div className="flex w-max gap-4 pr-3">
            {pipelineStages.map((stage) => (
              <PipelineColumn key={stage.id} stageId={stage.id} leads={leadsByStage[stage.id]} onLeadClick={onLeadClick} />
            ))}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeLead ? <PipelineCard lead={activeLead} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
