export type DashboardResponse = {
  kpis: Array<{ label: string; value: string; delta: string; trend: "up" | "down" | "neutral" }>;
  activities: Array<{ id: string; title: string; description: string; timestamp: string; type: string }>;
  revenueSeries: Array<{ month: string; revenue: number; forecast: number }>;
  pipelineValueSeries: Array<{ stage: string; value: number }>;
  totals: {
    leads: number;
    clients: number;
    projects: number;
    proposals: number;
    finance: number;
  };
};

