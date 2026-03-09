import type { ZodTypeAny } from "zod";
import {
  activityCreateSchema,
  activityUpdateSchema,
  clientCreateSchema,
  clientUpdateSchema,
  contractCreateSchema,
  contractUpdateSchema,
  financeCreateSchema,
  financeUpdateSchema,
  leadCreateSchema,
  leadUpdateSchema,
  pipelineCreateSchema,
  pipelineUpdateSchema,
  projectCreateSchema,
  projectCredentialCreateSchema,
  projectCredentialUpdateSchema,
  projectFileCreateSchema,
  projectFileUpdateSchema,
  projectUpdateSchema,
  scheduleCreateSchema,
  scheduleUpdateSchema,
  proposalCreateSchema,
  proposalItemCreateSchema,
  proposalItemUpdateSchema,
  proposalUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
} from "./schemas/resource-schemas.js";

export type ResourceName =
  | "users"
  | "leads"
  | "clientes"
  | "pipeline"
  | "projetos"
  | "agendamentos"
  | "project_credentials"
  | "project_files"
  | "propostas"
  | "proposta_itens"
  | "contratos"
  | "financeiro"
  | "activities";

type ResourceConfig = {
  table: ResourceName;
  idField?: string;
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  defaultOrderBy?: string;
  defaultSelect?: string;
};

export const resourceConfigs: Record<ResourceName, ResourceConfig> = {
  users: {
    table: "users",
    createSchema: userCreateSchema,
    updateSchema: userUpdateSchema,
    defaultOrderBy: "created_at",
    defaultSelect: "id,full_name,email,role,avatar_url,status,department,created_at",
  },
  leads: {
    table: "leads",
    createSchema: leadCreateSchema,
    updateSchema: leadUpdateSchema,
    defaultOrderBy: "created_at",
  },
  clientes: {
    table: "clientes",
    createSchema: clientCreateSchema,
    updateSchema: clientUpdateSchema,
    defaultOrderBy: "created_at",
  },
  pipeline: {
    table: "pipeline",
    createSchema: pipelineCreateSchema,
    updateSchema: pipelineUpdateSchema,
    defaultOrderBy: "moved_at",
  },
  projetos: {
    table: "projetos",
    createSchema: projectCreateSchema,
    updateSchema: projectUpdateSchema,
    defaultOrderBy: "created_at",
  },
  project_credentials: {
    table: "project_credentials",
    createSchema: projectCredentialCreateSchema,
    updateSchema: projectCredentialUpdateSchema,
    defaultOrderBy: "created_at",
  },
  agendamentos: {
    table: "agendamentos",
    createSchema: scheduleCreateSchema,
    updateSchema: scheduleUpdateSchema,
    defaultOrderBy: "schedule_date",
  },
  project_files: {
    table: "project_files",
    createSchema: projectFileCreateSchema,
    updateSchema: projectFileUpdateSchema,
    defaultOrderBy: "created_at",
  },
  propostas: {
    table: "propostas",
    createSchema: proposalCreateSchema,
    updateSchema: proposalUpdateSchema,
    defaultOrderBy: "created_at",
  },
  proposta_itens: {
    table: "proposta_itens",
    createSchema: proposalItemCreateSchema,
    updateSchema: proposalItemUpdateSchema,
    defaultOrderBy: "created_at",
  },
  contratos: {
    table: "contratos",
    createSchema: contractCreateSchema,
    updateSchema: contractUpdateSchema,
    defaultOrderBy: "created_at",
  },
  financeiro: {
    table: "financeiro",
    createSchema: financeCreateSchema,
    updateSchema: financeUpdateSchema,
    defaultOrderBy: "due_date",
  },
  activities: {
    table: "activities",
    createSchema: activityCreateSchema,
    updateSchema: activityUpdateSchema,
    defaultOrderBy: "created_at",
  },
};
