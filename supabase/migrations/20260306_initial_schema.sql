create extension if not exists "pgcrypto";

create type lead_priority as enum ('Alta', 'Media', 'Baixa');
create type pipeline_stage as enum (
  'novo_lead',
  'contato_iniciado',
  'qualificacao',
  'diagnostico',
  'proposta_enviada',
  'negociacao',
  'fechado',
  'perdido'
);
create type client_status as enum ('Ativo', 'Onboarding', 'Renovacao', 'Inativo');
create type project_status as enum ('Kickoff', 'Em execucao', 'Atrasado', 'Concluido', 'Pausado');
create type payment_status as enum ('Pendente', 'Pago', 'Atrasado', 'Cancelado');
create type proposal_status as enum ('Rascunho', 'Enviada', 'Aprovada', 'Reprovada', 'Ajuste solicitado');
create type contract_status as enum ('Rascunho', 'Enviado', 'Assinado', 'Cancelado');

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null default 'admin',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  segment text,
  origin text,
  estimated_value numeric(12,2) not null default 0,
  priority lead_priority not null default 'Media',
  score integer not null default 0,
  owner_id uuid references users(id),
  notes text,
  stage pipeline_stage not null default 'novo_lead',
  loss_reason text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact text,
  phone text,
  email text,
  cnpj text,
  website text,
  segment text,
  status client_status not null default 'Onboarding',
  owner_id uuid references users(id),
  notes text,
  lead_id uuid references leads(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pipeline (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  stage pipeline_stage not null,
  moved_by uuid references users(id),
  moved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists projetos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clientes(id) on delete cascade,
  lead_id uuid references leads(id),
  name text not null,
  status project_status not null default 'Kickoff',
  owner_id uuid references users(id),
  priority lead_priority not null default 'Media',
  scope text,
  objectives text,
  notes text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_credentials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projetos(id) on delete cascade,
  label text not null,
  provider text not null,
  login text,
  password_encrypted text,
  url text,
  token_encrypted text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projetos(id) on delete cascade,
  client_id uuid references clientes(id) on delete cascade,
  proposal_id uuid,
  storage_path text not null,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists propostas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clientes(id),
  lead_id uuid references leads(id),
  public_id text not null unique,
  title text not null,
  setup_amount numeric(12,2) not null default 0,
  monthly_amount numeric(12,2) not null default 0,
  description text,
  conditions text,
  status proposal_status not null default 'Rascunho',
  valid_until date,
  approved_at timestamptz,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists proposta_itens (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid not null references propostas(id) on delete cascade,
  item_name text not null,
  description text,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contratos (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references propostas(id),
  client_id uuid not null references clientes(id) on delete cascade,
  title text not null,
  status contract_status not null default 'Rascunho',
  signed_at timestamptz,
  signer_name text,
  signer_email text,
  pdf_storage_path text,
  public_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists financeiro (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clientes(id),
  project_id uuid references projetos(id),
  proposal_id uuid references propostas(id),
  contract_id uuid references contratos(id),
  title text not null,
  type text not null check (type in ('Receber', 'Pagar')),
  installment_number integer,
  amount numeric(12,2) not null,
  due_date date not null,
  paid_at timestamptz,
  status payment_status not null default 'Pendente',
  receipt_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  actor_id uuid references users(id),
  action text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_stage on leads(stage);
create index if not exists idx_pipeline_lead_id on pipeline(lead_id);
create index if not exists idx_projetos_client_id on projetos(client_id);
create index if not exists idx_propostas_public_id on propostas(public_id);
create index if not exists idx_contratos_public_id on contratos(public_id);
create index if not exists idx_financeiro_due_date on financeiro(due_date);
create index if not exists idx_activities_entity on activities(entity_type, entity_id);
