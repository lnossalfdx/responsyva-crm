import type { Client, FinanceEntry, KPI, Lead, PipelineStageId, Project, Proposal } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";
import { createResource, deleteResource, getResource, listResource, updateResource } from "@/services/api";
import { getOwnerNameFromFullName, type AppUserRole, type CurrentUser } from "@/services/access-control";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  status: string;
  department: string;
  ownerName: string;
};

export type ProjectCredentialRecord = {
  id: string;
  label: string;
  provider: string;
  url: string;
  username: string;
  password: string;
  notes: string;
};

export type ProjectFileRecord = {
  id: string;
  name: string;
  type: "Contrato" | "Briefing" | "Escopo" | "Outro";
  mimeType: string;
  size: number;
  contentUrl: string;
};

export type ProjectBriefingItem = {
  id: string;
  question: string;
  answer: string;
};

export type ProjectRecord = Project & {
  clientId: string;
  leadId?: string;
  goals: string;
  objectives: string;
  notes: string;
  briefingItems: ProjectBriefingItem[];
  requestedDeliverables: string;
  communicationStyle: string;
  contractNotes: string;
  credentials: ProjectCredentialRecord[];
  files: ProjectFileRecord[];
};

export type ScheduleItem = {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  owner: string;
  title: string;
  date: string;
  time: string;
  notes: string;
};

export type ContractListItem = {
  id: string;
  client: string;
  status: "Assinado" | "Aguardando assinatura" | "Rascunho";
  signatureDate: string;
  value: string;
  signerName: string;
  signerEmail: string;
};

type ApiUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status?: string | null;
  department?: string | null;
};

type ApiLead = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  segment?: string | null;
  origin?: string | null;
  estimated_value?: number | null;
  setup_value?: number | null;
  monthly_value?: number | null;
  priority: Lead["priority"];
  score: number;
  notes?: string | null;
  tags?: string[] | null;
  stage: string;
  updated_at?: string | null;
  owner?: ApiUser | null;
  owner_id?: string | null;
};

type ApiClient = {
  id: string;
  company: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  cnpj?: string | null;
  website?: string | null;
  segment?: string | null;
  status: Client["status"] | "Inativo";
  notes?: string | null;
  owner?: ApiUser | null;
  owner_id?: string | null;
};

type ApiProject = {
  id: string;
  name: string;
  client_id: string;
  lead_id?: string | null;
  status: string;
  priority: Project["priority"];
  scope?: string | null;
  objectives?: string | null;
  notes?: string | null;
  goals?: string | null;
  briefing_items?: ProjectBriefingItem[] | null;
  requested_deliverables?: string | null;
  communication_style?: string | null;
  contract_notes?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  client_ref?: { id: string; company: string } | null;
  owner?: ApiUser | null;
};

type ApiProjectCredential = {
  id: string;
  label: string;
  provider: string;
  login?: string | null;
  password_encrypted?: string | null;
  url?: string | null;
  notes?: string | null;
};

type ApiProjectFile = {
  id: string;
  file_name: string;
  storage_path: string;
  content_type?: string | null;
  size_bytes?: number | null;
  content_url?: string | null;
};

type ApiSchedule = {
  id: string;
  title: string;
  schedule_date: string;
  schedule_time: string;
  notes?: string | null;
  lead?: ApiLead | null;
  owner?: ApiUser | null;
};

type ApiFinance = {
  id: string;
  title: string;
  type: FinanceEntry["type"];
  amount: number;
  due_date: string;
  status: FinanceEntry["status"] | "Cancelado";
};

type ApiProposal = {
  id: string;
  title: string;
  setup_amount: number;
  monthly_amount: number;
  status: Proposal["status"] | "Reprovada";
  valid_until?: string | null;
  client?: { company: string } | null;
};

type ApiContract = {
  id: string;
  title: string;
  status: string;
  signed_at?: string | null;
  signer_name?: string | null;
  signer_email?: string | null;
  client?: { company: string } | null;
};

type DashboardPayload = {
  kpis: KPI[];
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

function stageFromApi(stage: string): PipelineStageId {
  return stage.replaceAll("_", "-") as PipelineStageId;
}

export function stageToApi(stage: PipelineStageId) {
  return stage.replaceAll("-", "_");
}

function roleFromApi(role: string): AppUserRole {
  if (role === "Super Admin" || role === "Admin" || role === "Operacional" || role === "Financeiro" || role === "Comercial") {
    return role;
  }

  const normalized = role.trim().toLowerCase();

  if (normalized === "super admin" || normalized === "super_admin") {
    return "Super Admin";
  }

  if (normalized === "admin") {
    return "Admin";
  }

  if (normalized === "financeiro") {
    return "Financeiro";
  }

  if (normalized === "comercial") {
    return "Comercial";
  }

  return "Operacional";
}

function mapUser(user: ApiUser): UserRecord {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: roleFromApi(user.role),
    status: user.status || "Ativo",
    department: user.department || "Não definido",
    ownerName: getOwnerNameFromFullName(user.full_name),
  };
}

function mapLead(lead: ApiLead): Lead {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company || "",
    email: lead.email || "",
    phone: lead.phone || "",
    segment: lead.segment || "",
    origin: lead.origin || "",
    estimatedValue: Number(lead.estimated_value ?? 0),
    setupValue: Number(lead.setup_value ?? 0),
    monthlyValue: Number(lead.monthly_value ?? 0),
    priority: lead.priority,
    score: Number(lead.score ?? 0),
    owner: lead.owner ? getOwnerNameFromFullName(lead.owner.full_name) : "Sem responsável",
    notes: lead.notes || "",
    tags: lead.tags ?? [],
    stage: stageFromApi(lead.stage),
    closedAt: stageFromApi(lead.stage) === "fechado" ? lead.updated_at?.slice(0, 10) : undefined,
  };
}

function mapClient(client: ApiClient): Client {
  return {
    id: client.id,
    company: client.company,
    contact: client.contact || "",
    phone: client.phone || "",
    email: client.email || "",
    cnpj: client.cnpj || "",
    website: client.website || "",
    segment: client.segment || "",
    status: client.status === "Inativo" ? "Onboarding" : client.status,
    owner: client.owner ? getOwnerNameFromFullName(client.owner.full_name) : "Sem responsável",
    notes: client.notes || "",
    mrr: 0,
  };
}

function mapProject(project: ApiProject, credentials: ApiProjectCredential[] = [], files: ApiProjectFile[] = []): ProjectRecord {
  return {
    id: project.id,
    clientId: project.client_id,
    leadId: project.lead_id || undefined,
    name: project.name,
    client: project.client_ref?.company || "Cliente não vinculado",
    status: project.status,
    owner: project.owner ? getOwnerNameFromFullName(project.owner.full_name) : "Sem responsável",
    priority: project.priority,
    scope: project.scope || "",
    startDate: project.start_date || "",
    endDate: project.end_date || "",
    progress: 0,
    goals: project.goals || "",
    objectives: project.objectives || "",
    notes: project.notes || "",
    briefingItems: project.briefing_items || [],
    requestedDeliverables: project.requested_deliverables || "",
    communicationStyle: project.communication_style || "",
    contractNotes: project.contract_notes || "",
    credentials: credentials.map((item) => ({
      id: item.id,
      label: item.label,
      provider: item.provider,
      url: item.url || "",
      username: item.login || "",
      password: item.password_encrypted || "",
      notes: item.notes || "",
    })),
    files: files.map((file) => ({
      id: file.id,
      name: file.file_name,
      type: inferFileType(file.storage_path),
      mimeType: file.content_type || "application/octet-stream",
      size: Number(file.size_bytes ?? 0),
      contentUrl: file.content_url || "",
    })),
  };
}

function inferFileType(value: string): ProjectFileRecord["type"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("briefing")) return "Briefing";
  if (normalized.includes("escopo")) return "Escopo";
  if (normalized.includes("contrato")) return "Contrato";
  return "Outro";
}

function mapSchedule(item: ApiSchedule): ScheduleItem {
  return {
    id: item.id,
    leadId: item.lead?.id || "",
    leadName: item.lead?.name || "Lead não encontrado",
    company: item.lead?.company || "",
    owner: item.owner ? getOwnerNameFromFullName(item.owner.full_name) : "Sem responsável",
    title: item.title,
    date: item.schedule_date,
    time: item.schedule_time.slice(0, 5),
    notes: item.notes || "",
  };
}

function mapFinance(item: ApiFinance): FinanceEntry {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    amount: Number(item.amount ?? 0),
    dueDate: item.due_date,
    status: item.status === "Cancelado" ? "Pendente" : item.status,
  };
}

function mapProposal(item: ApiProposal): Proposal {
  return {
    id: item.id,
    client: item.client?.company || item.title,
    setup: Number(item.setup_amount ?? 0),
    monthly: Number(item.monthly_amount ?? 0),
    status: item.status === "Reprovada" ? "Ajuste solicitado" : item.status,
    validUntil: item.valid_until || "",
  };
}

export async function listUsers() {
  const response = await listResource<ApiUser>("users", { orderBy: "created_at", ascending: false });
  return response.data.map(mapUser);
}

export async function signInWithApiProfile(email: string): Promise<CurrentUser> {
  const response = await listResource<ApiUser>("users", {
    email: email.trim().toLowerCase(),
    limit: 1,
  });

  const user = response.data[0];

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const mapped = mapUser(user);

  return {
    id: mapped.id,
    name: mapped.name,
    email: mapped.email,
    role: mapped.role,
    ownerName: mapped.ownerName,
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  role: AppUserRole;
  status: string;
  department: string;
}) {
  const created = await createResource<ApiUser>("users", {
    full_name: input.name,
    email: input.email,
    role: input.role,
    status: input.status,
    department: input.department,
  });

  return mapUser(created);
}

export async function listLeads() {
  const response = await listResource<ApiLead>("leads", {
    select: "*,owner:users!owner_id(id,full_name,email,role)",
    orderBy: "created_at",
    ascending: false,
    limit: 500,
  });

  return response.data.map(mapLead);
}

export async function createLead(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string;
  origin: string;
  estimatedValue: number;
  setupValue: number;
  monthlyValue: number;
  priority: Lead["priority"];
  score: number;
  ownerId: string;
  notes: string;
  tags: string[];
  stage: PipelineStageId;
}) {
  const created = await createResource<ApiLead>("leads", {
    name: input.name,
    company: input.company || null,
    email: input.email || null,
    phone: input.phone || null,
    segment: input.segment || null,
    origin: input.origin || null,
    estimated_value: input.estimatedValue,
    setup_value: input.setupValue,
    monthly_value: input.monthlyValue,
    priority: input.priority,
    score: input.score,
    owner_id: input.ownerId,
    notes: input.notes || null,
    tags: input.tags,
    stage: stageToApi(input.stage),
  });

  const owner = await getResource<ApiUser>("users", input.ownerId);
  return mapLead({ ...created, owner });
}

export async function updateLeadRecord(leadId: string, input: Partial<{
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string;
  origin: string;
  estimatedValue: number;
  setupValue: number;
  monthlyValue: number;
  priority: Lead["priority"];
  score: number;
  notes: string;
  tags: string[];
  stage: PipelineStageId;
}>) {
  const updated = await updateResource<ApiLead>("leads", leadId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.company !== undefined ? { company: input.company || null } : {}),
    ...(input.email !== undefined ? { email: input.email || null } : {}),
    ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
    ...(input.segment !== undefined ? { segment: input.segment || null } : {}),
    ...(input.origin !== undefined ? { origin: input.origin || null } : {}),
    ...(input.estimatedValue !== undefined ? { estimated_value: input.estimatedValue } : {}),
    ...(input.setupValue !== undefined ? { setup_value: input.setupValue } : {}),
    ...(input.monthlyValue !== undefined ? { monthly_value: input.monthlyValue } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.score !== undefined ? { score: input.score } : {}),
    ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.stage !== undefined ? { stage: stageToApi(input.stage) } : {}),
  });

  if (updated.owner_id) {
    const owner = await getResource<ApiUser>("users", updated.owner_id);
    return mapLead({ ...updated, owner });
  }

  return mapLead(updated);
}

export async function listClients() {
  const response = await listResource<ApiClient>("clientes", {
    select: "*,owner:users!owner_id(id,full_name,email,role)",
    orderBy: "created_at",
    ascending: false,
    limit: 500,
  });

  return response.data.map(mapClient);
}

export async function createClient(input: {
  company: string;
  contact: string;
  phone: string;
  email: string;
  cnpj: string;
  website: string;
  segment: string;
  notes: string;
  ownerId: string;
  status?: Client["status"];
}) {
  const created = await createResource<ApiClient>("clientes", {
    company: input.company,
    contact: input.contact || null,
    phone: input.phone || null,
    email: input.email || null,
    cnpj: input.cnpj || null,
    website: input.website || null,
    segment: input.segment || null,
    notes: input.notes || null,
    owner_id: input.ownerId,
    status: input.status || "Onboarding",
  });
  const owner = await getResource<ApiUser>("users", input.ownerId);
  return mapClient({ ...created, owner });
}

export async function listProjects() {
  const response = await listResource<ApiProject>("projetos", {
    select: "*,owner:users!owner_id(id,full_name,email,role),client_ref:clientes!client_id(id,company)",
    orderBy: "created_at",
    ascending: false,
    limit: 500,
  });

  return response.data.map((item) => mapProject(item));
}

export async function getProjectRecord(projectId: string) {
  const [project, credentials, files] = await Promise.all([
    getResource<ApiProject>("projetos", projectId, {
      select: "*,owner:users!owner_id(id,full_name,email,role),client_ref:clientes!client_id(id,company)",
    }),
    listResource<ApiProjectCredential>("project_credentials", {
      project_id: projectId,
      orderBy: "created_at",
      ascending: false,
      limit: 200,
    }),
    listResource<ApiProjectFile>("project_files", {
      project_id: projectId,
      orderBy: "created_at",
      ascending: false,
      limit: 200,
    }),
  ]);

  return mapProject(project, credentials.data, files.data);
}

export async function createProject(input: {
  clientId: string;
  leadId?: string;
  name: string;
  status: string;
  ownerId: string;
  priority: Project["priority"];
  scope: string;
  objectives: string;
  notes: string;
  goals: string;
  briefingItems: ProjectBriefingItem[];
  requestedDeliverables: string;
  communicationStyle: string;
  contractNotes: string;
  startDate: string;
  endDate: string;
}) {
  const created = await createResource<ApiProject>("projetos", {
    client_id: input.clientId,
    lead_id: input.leadId || null,
    name: input.name,
    status: input.status,
    owner_id: input.ownerId,
    priority: input.priority,
    scope: input.scope || null,
    objectives: input.objectives || null,
    notes: input.notes || null,
    goals: input.goals || null,
    briefing_items: input.briefingItems,
    requested_deliverables: input.requestedDeliverables || null,
    communication_style: input.communicationStyle || null,
    contract_notes: input.contractNotes || null,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
  });

  return getProjectRecord(created.id);
}

export async function updateProjectRecord(projectId: string, input: Partial<{
  name: string;
  status: string;
  priority: Project["priority"];
  scope: string;
  objectives: string;
  notes: string;
  goals: string;
  briefingItems: ProjectBriefingItem[];
  requestedDeliverables: string;
  communicationStyle: string;
  contractNotes: string;
  startDate: string;
  endDate: string;
}>) {
  await updateResource<ApiProject>("projetos", projectId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.scope !== undefined ? { scope: input.scope || null } : {}),
    ...(input.objectives !== undefined ? { objectives: input.objectives || null } : {}),
    ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
    ...(input.goals !== undefined ? { goals: input.goals || null } : {}),
    ...(input.briefingItems !== undefined ? { briefing_items: input.briefingItems } : {}),
    ...(input.requestedDeliverables !== undefined ? { requested_deliverables: input.requestedDeliverables || null } : {}),
    ...(input.communicationStyle !== undefined ? { communication_style: input.communicationStyle || null } : {}),
    ...(input.contractNotes !== undefined ? { contract_notes: input.contractNotes || null } : {}),
    ...(input.startDate !== undefined ? { start_date: input.startDate || null } : {}),
    ...(input.endDate !== undefined ? { end_date: input.endDate || null } : {}),
  });

  return getProjectRecord(projectId);
}

export async function createProjectCredentialRecord(projectId: string, input: {
  label: string;
  provider: string;
  url: string;
  username: string;
  password: string;
  notes: string;
}) {
  return createResource<ApiProjectCredential>("project_credentials", {
    project_id: projectId,
    label: input.label,
    provider: input.provider,
    url: input.url || null,
    login: input.username || null,
    password_encrypted: input.password || null,
    notes: input.notes || null,
  });
}

export async function deleteProjectCredentialRecord(id: string) {
  return deleteResource("project_credentials", id);
}

export async function createProjectFileRecord(projectId: string, input: {
  type: ProjectFileRecord["type"];
  name: string;
  mimeType: string;
  size: number;
  contentUrl: string;
  uploadedBy: string;
}) {
  return createResource<ApiProjectFile>("project_files", {
    project_id: projectId,
    storage_path: `${input.type.toLowerCase()}/${input.name}`,
    file_name: input.name,
    content_type: input.mimeType,
    size_bytes: input.size,
    content_url: input.contentUrl,
    uploaded_by: input.uploadedBy,
  });
}

export async function deleteProjectFileRecord(id: string) {
  return deleteResource("project_files", id);
}

export async function listSchedules() {
  const response = await listResource<ApiSchedule>("agendamentos", {
    select: "*,lead:leads!lead_id(id,name,company),owner:users!owner_id(id,full_name,email,role)",
    orderBy: "schedule_date",
    ascending: true,
    limit: 500,
  });

  return response.data.map(mapSchedule);
}

export async function createSchedule(input: {
  leadId: string;
  ownerId: string;
  title: string;
  date: string;
  time: string;
  notes: string;
}) {
  await createResource<ApiSchedule>("agendamentos", {
    lead_id: input.leadId,
    owner_id: input.ownerId,
    title: input.title,
    schedule_date: input.date,
    schedule_time: input.time,
    notes: input.notes || null,
  });
}

export async function listFinanceEntries() {
  const response = await listResource<ApiFinance>("financeiro", {
    orderBy: "due_date",
    ascending: true,
    limit: 500,
  });
  return response.data.map(mapFinance);
}

export async function createFinanceEntry(input: {
  title: string;
  type: FinanceEntry["type"];
  amount: number;
  dueDate: string;
  status: FinanceEntry["status"];
  clientId?: string;
  projectId?: string;
  proposalId?: string;
  contractId?: string;
}) {
  return createResource("financeiro", {
    title: input.title,
    type: input.type,
    amount: input.amount,
    due_date: input.dueDate,
    status: input.status,
    client_id: input.clientId || null,
    project_id: input.projectId || null,
    proposal_id: input.proposalId || null,
    contract_id: input.contractId || null,
  });
}

export async function listProposals() {
  const response = await listResource<ApiProposal>("propostas", {
    select: "*,client:clientes!client_id(company)",
    orderBy: "created_at",
    ascending: false,
    limit: 500,
  });
  return response.data.map(mapProposal);
}

export async function createProposal(input: {
  title: string;
  clientId?: string;
  leadId?: string;
  setup: number;
  monthly: number;
  description: string;
  conditions: string;
  status: Proposal["status"];
  validUntil: string;
  createdBy?: string;
}) {
  return createResource("propostas", {
    title: input.title,
    client_id: input.clientId || null,
    lead_id: input.leadId || null,
    public_id: `prop-${Date.now()}`,
    setup_amount: input.setup,
    monthly_amount: input.monthly,
    description: input.description || null,
    conditions: input.conditions || null,
    status: input.status,
    valid_until: input.validUntil || null,
    created_by: input.createdBy || null,
  });
}

export async function listContracts() {
  const response = await listResource<ApiContract>("contratos", {
    select: "*,client:clientes!client_id(company)",
    orderBy: "created_at",
    ascending: false,
    limit: 500,
  });

  return response.data.map((item) => ({
    id: item.id,
    client: item.client?.company || item.title,
    status:
      item.status === "Assinado"
        ? "Assinado"
        : item.status === "Enviado"
          ? "Aguardando assinatura"
          : "Rascunho",
    signatureDate: item.signed_at?.slice(0, 10) || "",
    value: formatCurrency(0),
    signerName: item.signer_name || "",
    signerEmail: item.signer_email || "",
  })) satisfies ContractListItem[];
}

export async function createContract(input: {
  clientId: string;
  title: string;
  status: "Rascunho" | "Enviado" | "Assinado" | "Cancelado";
  signatureDate: string;
  signerName: string;
  signerEmail: string;
}) {
  return createResource("contratos", {
    client_id: input.clientId,
    title: input.title,
    status: input.status,
    signed_at: input.signatureDate ? `${input.signatureDate}T00:00:00.000Z` : null,
    signer_name: input.signerName || null,
    signer_email: input.signerEmail || null,
    public_id: `contract-${Date.now()}`,
  });
}

export async function getDashboard() {
  return getResource<DashboardPayload>("dashboard", "");
}
