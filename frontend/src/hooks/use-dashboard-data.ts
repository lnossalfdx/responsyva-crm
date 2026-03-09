import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/services/api";
import { activities, clients, financeEntries, kpis, leads, pipelineValueSeries, projects, proposals, revenueSeries } from "@/data/mock-data";

type DashboardPayload = {
  kpis: typeof kpis;
  activities: typeof activities;
  revenueSeries: typeof revenueSeries;
  pipelineValueSeries: typeof pipelineValueSeries;
  totals: {
    leads: number;
    clients: number;
    projects: number;
    proposals: number;
    finance: number;
  };
};

async function loadDashboard() {
  try {
    return await fetcher<DashboardPayload>("/dashboard");
  } catch {
    return {
      kpis,
      activities,
      revenueSeries,
      pipelineValueSeries,
      totals: {
        leads: leads.length,
        clients: clients.length,
        projects: projects.length,
        proposals: proposals.length,
        finance: financeEntries.length,
      },
    };
  }
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: loadDashboard,
  });
}

