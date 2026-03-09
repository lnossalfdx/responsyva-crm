import type { FinanceEntry, Lead } from "@/data/mock-data";

export const SALES_COMMISSION_RATE = 0.3;

export function getClosedLeads(leads: Lead[]) {
  return leads.filter((lead) => lead.stage === "fechado");
}

export function getOpenLeads(leads: Lead[]) {
  return leads.filter((lead) => lead.stage !== "fechado" && lead.stage !== "perdido");
}

export function getFinanceSummaryFromLeads(leads: Lead[]) {
  const closedLeads = getClosedLeads(leads);
  const openLeads = getOpenLeads(leads);

  const closedRevenue = closedLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const projectedRevenue = openLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const recurringRevenue = closedLeads.reduce((sum, lead) => sum + lead.monthlyValue, 0);
  const commissionTotal = closedLeads.reduce(
    (sum, lead) => sum + lead.estimatedValue * SALES_COMMISSION_RATE,
    0,
  );
  const valuation = recurringRevenue > 0
    ? recurringRevenue * 12 * 6
    : closedRevenue > 0
      ? closedRevenue * 6
      : 0;

  return {
    closedLeads,
    openLeads,
    closedRevenue,
    projectedRevenue,
    mrr: commissionTotal,
    recurringRevenue,
    commissionTotal,
    valuation,
  };
}

export function buildCommissionEntries(leads: Lead[]): FinanceEntry[] {
  return getClosedLeads(leads).map((lead) => ({
    id: `commission-${lead.id}`,
    title: `Comissão comercial · ${lead.company}`,
    type: "Pagar",
    amount: Math.round(lead.estimatedValue * SALES_COMMISSION_RATE),
    dueDate: lead.closedAt || new Date().toISOString().slice(0, 10),
    status: "Pendente",
  }));
}
