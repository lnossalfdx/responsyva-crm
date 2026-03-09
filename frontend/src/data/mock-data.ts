export type NavItem = {
  label: string;
  path: string;
  badge?: string;
};

export type KPI = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string;
  origin: string;
  estimatedValue: number;
  setupValue: number;
  monthlyValue: number;
  priority: "Alta" | "Media" | "Baixa";
  score: number;
  owner: string;
  notes: string;
  tags: string[];
  stage: PipelineStageId;
  closedAt?: string;
};

export type Client = {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  cnpj: string;
  website: string;
  segment: string;
  status: "Ativo" | "Onboarding" | "Renovacao";
  owner: string;
  notes: string;
  mrr: number;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  status: string;
  owner: string;
  priority: "Alta" | "Media" | "Baixa";
  scope: string;
  startDate: string;
  endDate: string;
  progress: number;
};

export type Proposal = {
  id: string;
  client: string;
  setup: number;
  monthly: number;
  status: "Rascunho" | "Enviada" | "Aprovada" | "Ajuste solicitado";
  validUntil: string;
};

export type FinanceEntry = {
  id: string;
  title: string;
  type: "Receber" | "Pagar";
  amount: number;
  dueDate: string;
  status: "Pendente" | "Pago" | "Atrasado";
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "lead" | "pipeline" | "proposal" | "contract" | "project" | "finance";
};

export type PipelineStageId =
  | "novo-lead"
  | "contato-iniciado"
  | "qualificacao"
  | "diagnostico"
  | "proposta-enviada"
  | "negociacao"
  | "fechado"
  | "perdido";

export type PipelineStage = {
  id: PipelineStageId;
  title: string;
  accent: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Leads", path: "/leads" },
  { label: "Agendamentos", path: "/agendamentos" },
  { label: "Pipeline", path: "/pipeline" },
  { label: "Projetos", path: "/projetos" },
  { label: "Financeiro", path: "/financeiro" },
  { label: "Automações", path: "/automacoes", badge: "Soon" },
  { label: "Central de IA", path: "/ia" },
  { label: "Configurações", path: "/configuracoes" },
];

export const kpis: KPI[] = [
  { label: "Total de leads", value: "0", delta: "Sem dados", trend: "neutral" },
  { label: "Clientes ativos", value: "0", delta: "Sem dados", trend: "neutral" },
  { label: "Negócios em andamento", value: "0", delta: "Sem dados", trend: "neutral" },
  { label: "Fechados no mês", value: "0", delta: "Sem dados", trend: "neutral" },
  { label: "Receita prevista", value: "R$ 0", delta: "Sem dados", trend: "neutral" },
  { label: "Receita recebida", value: "R$ 0", delta: "Sem dados", trend: "neutral" },
  { label: "MRR", value: "R$ 0", delta: "Sem dados", trend: "neutral" },
  { label: "Projetos ativos", value: "0", delta: "Sem dados", trend: "neutral" },
];

export const revenueSeries = [
  { month: "Out", revenue: 0, forecast: 0 },
  { month: "Nov", revenue: 0, forecast: 0 },
  { month: "Dez", revenue: 0, forecast: 0 },
  { month: "Jan", revenue: 0, forecast: 0 },
  { month: "Fev", revenue: 0, forecast: 0 },
  { month: "Mar", revenue: 0, forecast: 0 },
];

export const conversionSeries = [
  { name: "Novo lead", value: 0 },
  { name: "Qualificação", value: 0 },
  { name: "Diagnóstico", value: 0 },
  { name: "Proposta", value: 0 },
  { name: "Fechado", value: 0 },
];

export const pipelineValueSeries = [
  { stage: "Qualificação", value: 0 },
  { stage: "Diagnóstico", value: 0 },
  { stage: "Proposta", value: 0 },
  { stage: "Negociação", value: 0 },
];

export const pipelineStages: PipelineStage[] = [
  { id: "novo-lead", title: "Novo lead", accent: "from-emerald-400/55 to-transparent" },
  { id: "contato-iniciado", title: "Contato iniciado", accent: "from-cyan-400/55 to-transparent" },
  { id: "qualificacao", title: "Qualificação", accent: "from-violet-400/55 to-transparent" },
  { id: "diagnostico", title: "Diagnóstico", accent: "from-fuchsia-400/55 to-transparent" },
  { id: "proposta-enviada", title: "Proposta enviada", accent: "from-amber-400/55 to-transparent" },
  { id: "negociacao", title: "Negociação", accent: "from-orange-400/55 to-transparent" },
  { id: "fechado", title: "Fechado", accent: "from-emerald-300/55 to-transparent" },
  { id: "perdido", title: "Perdido", accent: "from-rose-400/55 to-transparent" },
];

export const leads: Lead[] = [];

export const clients: Client[] = [];

export const projects: Project[] = [];

export const proposals: Proposal[] = [];

export const financeEntries: FinanceEntry[] = [];

export const activities: Activity[] = [];

export const aiInsights: string[] = [];
