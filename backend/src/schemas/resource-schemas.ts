import { z } from "zod";

const optionalString = z.string().trim().optional().nullable();
const optionalNumber = z.coerce.number().optional().nullable();
const optionalDate = z.string().trim().optional().nullable();

export const userCreateSchema = z.object({
  full_name: z.string().trim().min(1),
  email: z.email(),
  role: z.string().trim().min(1).default("admin"),
  avatar_url: optionalString,
  status: z.string().trim().min(1).default("Ativo"),
  department: optionalString,
});

export const userUpdateSchema = userCreateSchema.partial();

export const leadCreateSchema = z.object({
  name: z.string().trim().min(1),
  company: optionalString,
  phone: optionalString,
  email: optionalString,
  segment: optionalString,
  origin: optionalString,
  estimated_value: z.coerce.number().default(0),
  setup_value: z.coerce.number().default(0),
  monthly_value: z.coerce.number().default(0),
  priority: z.enum(["Alta", "Media", "Baixa"]).default("Media"),
  score: z.coerce.number().int().min(0).max(100).default(0),
  owner_id: optionalString,
  notes: optionalString,
  stage: z
    .enum([
      "novo_lead",
      "contato_iniciado",
      "qualificacao",
      "diagnostico",
      "proposta_enviada",
      "negociacao",
      "fechado",
      "perdido",
    ])
    .default("novo_lead"),
  loss_reason: optionalString,
  tags: z.array(z.string()).default([]),
});

export const leadUpdateSchema = leadCreateSchema.partial();

export const clientCreateSchema = z.object({
  company: z.string().trim().min(1),
  contact: optionalString,
  phone: optionalString,
  email: optionalString,
  cnpj: optionalString,
  website: optionalString,
  segment: optionalString,
  status: z.enum(["Ativo", "Onboarding", "Renovacao", "Inativo"]).default("Onboarding"),
  owner_id: optionalString,
  notes: optionalString,
  lead_id: optionalString,
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const pipelineCreateSchema = z.object({
  lead_id: z.string().uuid(),
  stage: z.enum([
    "novo_lead",
    "contato_iniciado",
    "qualificacao",
    "diagnostico",
    "proposta_enviada",
    "negociacao",
    "fechado",
    "perdido",
  ]),
  moved_by: optionalString,
  moved_at: optionalString,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const pipelineUpdateSchema = pipelineCreateSchema.partial();

export const projectCreateSchema = z.object({
  client_id: z.string().uuid(),
  lead_id: optionalString,
  name: z.string().trim().min(1),
  status: z.string().trim().min(1).default("Kickoff"),
  owner_id: optionalString,
  priority: z.enum(["Alta", "Media", "Baixa"]).default("Media"),
  scope: optionalString,
  objectives: optionalString,
  notes: optionalString,
  goals: optionalString,
  briefing_items: z.array(z.object({
    id: z.string().trim().min(1),
    question: z.string().trim().min(1),
    answer: z.string().default(""),
  })).default([]),
  requested_deliverables: optionalString,
  communication_style: optionalString,
  contract_notes: optionalString,
  start_date: optionalDate,
  end_date: optionalDate,
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const projectCredentialCreateSchema = z.object({
  project_id: z.string().uuid(),
  label: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  login: optionalString,
  password_encrypted: optionalString,
  url: optionalString,
  token_encrypted: optionalString,
  notes: optionalString,
});

export const projectCredentialUpdateSchema = projectCredentialCreateSchema.partial();

export const projectFileCreateSchema = z.object({
  project_id: optionalString,
  client_id: optionalString,
  proposal_id: optionalString,
  storage_path: z.string().trim().min(1),
  file_name: z.string().trim().min(1),
  content_type: optionalString,
  size_bytes: optionalNumber,
  uploaded_by: optionalString,
  content_url: optionalString,
});

export const projectFileUpdateSchema = projectFileCreateSchema.partial();

export const scheduleCreateSchema = z.object({
  lead_id: z.string().uuid(),
  owner_id: optionalString,
  title: z.string().trim().min(1),
  schedule_date: z.string().trim().min(1),
  schedule_time: z.string().trim().min(1),
  notes: optionalString,
});

export const scheduleUpdateSchema = scheduleCreateSchema.partial();

export const proposalCreateSchema = z.object({
  client_id: optionalString,
  lead_id: optionalString,
  public_id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  setup_amount: z.coerce.number().default(0),
  monthly_amount: z.coerce.number().default(0),
  description: optionalString,
  conditions: optionalString,
  status: z
    .enum(["Rascunho", "Enviada", "Aprovada", "Reprovada", "Ajuste solicitado"])
    .default("Rascunho"),
  valid_until: optionalDate,
  approved_at: optionalString,
  created_by: optionalString,
});

export const proposalUpdateSchema = proposalCreateSchema.partial();

export const proposalItemCreateSchema = z.object({
  proposta_id: z.string().uuid(),
  item_name: z.string().trim().min(1),
  description: optionalString,
  quantity: z.coerce.number().default(1),
  unit_price: z.coerce.number().default(0),
});

export const proposalItemUpdateSchema = proposalItemCreateSchema.partial();

export const contractCreateSchema = z.object({
  proposta_id: optionalString,
  client_id: z.string().uuid(),
  title: z.string().trim().min(1),
  status: z.enum(["Rascunho", "Enviado", "Assinado", "Cancelado"]).default("Rascunho"),
  signed_at: optionalString,
  signer_name: optionalString,
  signer_email: optionalString,
  pdf_storage_path: optionalString,
  public_id: z.string().trim().min(1),
});

export const contractUpdateSchema = contractCreateSchema.partial();

export const financeCreateSchema = z.object({
  client_id: optionalString,
  project_id: optionalString,
  proposal_id: optionalString,
  contract_id: optionalString,
  title: z.string().trim().min(1),
  type: z.enum(["Receber", "Pagar"]),
  installment_number: optionalNumber,
  amount: z.coerce.number(),
  due_date: z.string().trim().min(1),
  paid_at: optionalString,
  status: z.enum(["Pendente", "Pago", "Atrasado", "Cancelado"]).default("Pendente"),
  receipt_storage_path: optionalString,
});

export const financeUpdateSchema = financeCreateSchema.partial();

export const activityCreateSchema = z.object({
  entity_type: z.string().trim().min(1),
  entity_id: z.string().uuid(),
  actor_id: optionalString,
  action: z.string().trim().min(1),
  description: optionalString,
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const activityUpdateSchema = activityCreateSchema.partial();
