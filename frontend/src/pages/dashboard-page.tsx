import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BrainCircuit, CalendarDays, CircleCheckBig, Clock3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import type { KPI } from "@/data/mock-data";
import { canViewOwnedRecord, loadCurrentUser } from "@/services/access-control";
import { listProjects, listSchedules, type ProjectRecord, type ScheduleItem } from "@/services/crm-api";
import { loadKpiOrder, saveKpiOrder, sortKpisBySavedOrder } from "@/services/dashboard-layout";
import { getFinanceSummaryFromLeads } from "@/services/crm-finance";
import { formatCurrency } from "@/lib/utils";
import { useCrmStore } from "@/stores/use-crm-store";
export function DashboardPage() {
  const currentUser = loadCurrentUser();
  const leads = useCrmStore((state) => state.leads);
  const loadLeads = useCrmStore((state) => state.loadLeads);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [orderedKpis, setOrderedKpis] = useState<KPI[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const todaysDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    loadLeads();
    listProjects()
      .then(setProjects)
      .catch((error) => console.error("Failed to load projects", error));
    listSchedules()
      .then(setSchedules)
      .catch((error) => console.error("Failed to load schedules", error));
  }, [loadLeads]);

  const visibleLeads = useMemo(
    () => leads.filter((lead) => canViewOwnedRecord(currentUser, lead.owner)),
    [currentUser, leads],
  );
  const financeSummary = useMemo(() => getFinanceSummaryFromLeads(visibleLeads), [visibleLeads]);
  const visibleProjects = useMemo(
    () => projects.filter((project) => canViewOwnedRecord(currentUser, project.owner)),
    [currentUser, projects],
  );
  const activeClients = useMemo(
    () => new Set(financeSummary.closedLeads.map((lead) => lead.company)).size,
    [financeSummary.closedLeads],
  );
  const baseKpis = useMemo<KPI[]>(
    () => [
      {
        label: "Total de leads",
        value: String(visibleLeads.length),
        delta: visibleLeads.length ? "Base comercial ativa" : "Sem dados",
        trend: "neutral",
      },
      {
        label: "Clientes ativos",
        value: String(activeClients),
        delta: activeClients ? "Contas originadas de fechamentos" : "Sem dados",
        trend: "neutral",
      },
      {
        label: "Negócios em andamento",
        value: String(financeSummary.openLeads.length),
        delta: financeSummary.openLeads.length
          ? `${formatCurrency(financeSummary.projectedRevenue)} em pipeline`
          : "Sem dados",
        trend: "neutral",
      },
      {
        label: "Fechados no mês",
        value: String(financeSummary.closedLeads.length),
        delta: financeSummary.closedLeads.length ? "Negócios ganhos" : "Sem dados",
        trend: "neutral",
      },
      {
        label: "Receita prevista",
        value: formatCurrency(financeSummary.projectedRevenue),
        delta: financeSummary.projectedRevenue ? "Base aberta do pipeline" : "Sem dados",
        trend: "neutral",
      },
      {
        label: "Receita recebida",
        value: formatCurrency(financeSummary.closedRevenue),
        delta: financeSummary.closedRevenue ? "Negócios fechados" : "Sem dados",
        trend: "neutral",
      },
      {
        label: "MRR",
        value: formatCurrency(financeSummary.mrr),
        delta: financeSummary.closedRevenue
          ? `Valor total fechado: ${formatCurrency(financeSummary.closedRevenue)}`
          : "Sem dados",
        trend: "neutral",
      },
      {
        label: "Projetos ativos",
        value: String(visibleProjects.length),
        delta: visibleProjects.length ? "Projetos na sua carteira" : "Sem dados",
        trend: "neutral",
      },
    ],
    [activeClients, financeSummary.closedLeads.length, financeSummary.closedRevenue, financeSummary.mrr, financeSummary.openLeads.length, financeSummary.projectedRevenue, visibleLeads.length, visibleProjects.length],
  );
  const todaysSchedules = useMemo(
    () =>
      schedules
        .filter((item) => item.date === todaysDate)
        .filter((item) => canViewOwnedRecord(currentUser, item.owner))
        .sort((left, right) => left.time.localeCompare(right.time))
        .slice(0, 4),
    [currentUser, schedules, todaysDate],
  );

  useEffect(() => {
    const savedOrder = loadKpiOrder(currentUser.id);
    setOrderedKpis(sortKpisBySavedOrder(baseKpis, savedOrder));
  }, [baseKpis, currentUser.id]);

  function handleKpiDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedKpis((current) => {
      const oldIndex = current.findIndex((item) => item.label === active.id);
      const newIndex = current.findIndex((item) => item.label === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const next = arrayMove(current, oldIndex, newIndex);
      saveKpiOrder(currentUser.id, next.map((item) => item.label));
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow=""
        title=""
        description=""
      />

      <Card className="mx-auto max-w-3xl overflow-hidden border-emerald-400/15 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-8 py-7 text-center">
        <p className="text-[11px] uppercase tracking-[0.42em] text-emerald-300/70">Valuation</p>
        <div className="mt-4 space-y-3">
          <p className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
            {formatCurrency(financeSummary.valuation)}
          </p>
          <p className="text-sm text-zinc-400">
            {financeSummary.valuation
              ? `Baseado na recorrência fechada de ${formatCurrency(financeSummary.recurringRevenue)} por mês.`
              : "Valuation aguardando negócios fechados e recorrência mensal."}
          </p>
        </div>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleKpiDragEnd}>
        <SortableContext items={orderedKpis.map((kpi) => kpi.label)} strategy={rectSortingStrategy}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orderedKpis.map((kpi) => (
              <StatCard key={kpi.label} {...kpi} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Compromissos de hoje</h3>
            <p className="text-sm text-zinc-400">Agenda vinculada aos leads do CRM para o dia atual.</p>
          </div>
          <CalendarDays className="size-5 text-emerald-300" />
        </div>
        <div className="grid gap-3 xl:grid-cols-4">
          {todaysSchedules.length ? (
            todaysSchedules.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-emerald-200">
                  <Clock3 className="size-4" />
                  {item.time}
                </div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {item.leadName} · {item.company}
                </p>
                {item.notes ? <p className="mt-3 text-sm text-zinc-500">{item.notes}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-500 xl:col-span-4">
              Nenhum compromisso agendado para hoje.
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <RevenueChart />
        <Card className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Alertas e próximas ações</h3>
              <p className="text-sm text-zinc-400">Decisões táticas priorizadas por IA</p>
            </div>
            <BrainCircuit className="size-5 text-emerald-300" />
          </div>
          <div className="mt-4 flex flex-1 flex-col gap-3">
            <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-rose-200">
                <AlertTriangle className="size-4" />
                Sem alertas
              </div>
              <p className="text-sm text-zinc-300">Nenhum dado financeiro carregado para gerar alertas.</p>
            </div>
            <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-200">
                <CircleCheckBig className="size-4" />
                Próxima ação
              </div>
              <p className="text-sm text-zinc-300">Cadastre leads, projetos e compromissos para gerar recomendações automáticas.</p>
            </div>
            <button className="mt-auto flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-zinc-200 transition hover:bg-white/10">
              Ver rotina diária sugerida
              <ArrowRight className="size-4 text-zinc-500" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
