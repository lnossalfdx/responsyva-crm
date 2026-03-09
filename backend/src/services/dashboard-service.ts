import { supabaseAdmin } from "../lib/supabase.js";
import { HttpError } from "../lib/http-error.js";

type Trend = "up" | "down" | "neutral";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function subMonths(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() - amount);
  return copy;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardPayload() {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const revenueWindowStart = subMonths(monthStart, 5);

  const [
    leadsResult,
    clientsResult,
    projectsResult,
    financeResult,
    activitiesResult,
  ] = await Promise.all([
    supabaseAdmin.from("leads").select("id, stage, estimated_value, updated_at, created_at"),
    supabaseAdmin.from("clientes").select("id"),
    supabaseAdmin.from("projetos").select("id"),
    supabaseAdmin
      .from("financeiro")
      .select("id, title, type, amount, due_date, paid_at, status, created_at")
      .gte("due_date", toIsoDate(revenueWindowStart)),
    supabaseAdmin
      .from("activities")
      .select("id, action, description, entity_type, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  for (const result of [leadsResult, clientsResult, projectsResult, financeResult, activitiesResult]) {
    if (result.error) {
      throw new HttpError(400, "Failed to build dashboard", result.error);
    }
  }

  const leads = leadsResult.data ?? [];
  const clients = clientsResult.data ?? [];
  const projects = projectsResult.data ?? [];
  const finance = financeResult.data ?? [];
  const activities = activitiesResult.data ?? [];

  const activeLeads = leads.filter((lead) => !["fechado", "perdido"].includes(lead.stage));
  const closedThisMonth = leads.filter((lead) => {
    if (lead.stage !== "fechado") {
      return false;
    }

    const updatedAt = new Date(lead.updated_at ?? lead.created_at);
    return updatedAt >= monthStart;
  });
  const previousClosed = leads.filter((lead) => {
    if (lead.stage !== "fechado") {
      return false;
    }

    const updatedAt = new Date(lead.updated_at ?? lead.created_at);
    return updatedAt >= previousMonthStart && updatedAt <= previousMonthEnd;
  });

  const forecastRevenue = finance
    .filter((entry) => entry.type === "Receber" && entry.status !== "Cancelado")
    .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
  const receivedRevenue = finance
    .filter((entry) => entry.type === "Receber" && entry.status === "Pago")
    .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
  const mrr = finance
    .filter((entry) => entry.type === "Receber" && entry.title.toLowerCase().includes("mrr"))
    .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);

  const sixMonthSeries = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(monthStart, 5 - index);
    const key = monthKey(date);

    const monthForecast = finance
      .filter((entry) => monthKey(new Date(entry.due_date)) === key && entry.type === "Receber")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
    const monthReceived = finance
      .filter((entry) => entry.paid_at && monthKey(new Date(entry.paid_at)) === key && entry.type === "Receber")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);

    return {
      month: monthLabel(date),
      revenue: monthReceived,
      forecast: monthForecast,
    };
  });

  const pipelineValueMap = new Map<string, number>();
  for (const lead of activeLeads) {
    const current = pipelineValueMap.get(lead.stage) ?? 0;
    pipelineValueMap.set(lead.stage, current + Number(lead.estimated_value ?? 0));
  }

  const activityPayload = activities.map((activity) => ({
    id: activity.id,
    title: String(activity.action ?? "Atualização"),
    description: String(activity.description ?? "Atividade registrada no CRM."),
    timestamp: new Date(activity.created_at).toLocaleString("pt-BR"),
    type: String(activity.entity_type ?? "activity"),
  }));

  const closedDelta = closedThisMonth.length - previousClosed.length;
  const closedTrend: Trend = closedDelta > 0 ? "up" : closedDelta < 0 ? "down" : "neutral";

  return {
    kpis: [
      {
        label: "Total de leads",
        value: String(leads.length),
        delta: leads.length ? "Base comercial carregada" : "Sem dados",
        trend: "neutral" as Trend,
      },
      {
        label: "Clientes ativos",
        value: String(clients.length),
        delta: clients.length ? "Contas sincronizadas" : "Sem dados",
        trend: "neutral" as Trend,
      },
      {
        label: "Negócios em andamento",
        value: String(activeLeads.length),
        delta: activeLeads.length ? `${formatCurrency(activeLeads.reduce((sum, lead) => sum + Number(lead.estimated_value ?? 0), 0))} em pipeline` : "Sem dados",
        trend: "neutral" as Trend,
      },
      {
        label: "Fechados no mês",
        value: String(closedThisMonth.length),
        delta: closedDelta === 0 ? "Sem variação mensal" : `${closedDelta > 0 ? "+" : ""}${closedDelta} em relação ao mês anterior`,
        trend: closedTrend,
      },
      {
        label: "Receita prevista",
        value: formatCurrency(forecastRevenue),
        delta: forecastRevenue ? "Financeiro sincronizado" : "Sem dados",
        trend: "neutral" as Trend,
      },
      {
        label: "Receita recebida",
        value: formatCurrency(receivedRevenue),
        delta: receivedRevenue ? "Recebimentos confirmados" : "Sem dados",
        trend: "neutral" as Trend,
      },
      {
        label: "MRR",
        value: formatCurrency(mrr),
        delta: mrr ? "Receitas recorrentes ativas" : "Sem dados",
        trend: "neutral" as Trend,
      },
      {
        label: "Projetos ativos",
        value: String(projects.length),
        delta: projects.length ? "Projetos sincronizados" : "Sem dados",
        trend: "neutral" as Trend,
      },
    ],
    activities: activityPayload,
    revenueSeries: sixMonthSeries,
    pipelineValueSeries: Array.from(pipelineValueMap.entries()).map(([stage, value]) => ({
      stage,
      value,
    })),
    totals: {
      leads: leads.length,
      clients: clients.length,
      projects: projects.length,
      proposals: 0,
      finance: finance.length,
    },
  };
}
