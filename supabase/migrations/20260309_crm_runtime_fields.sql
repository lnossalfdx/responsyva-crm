alter table users
  add column if not exists status text not null default 'Ativo',
  add column if not exists department text;

alter table leads
  add column if not exists setup_value numeric(12,2) not null default 0,
  add column if not exists monthly_value numeric(12,2) not null default 0;

alter table projetos
  add column if not exists goals text,
  add column if not exists briefing_items jsonb not null default '[]'::jsonb,
  add column if not exists requested_deliverables text,
  add column if not exists communication_style text,
  add column if not exists contract_notes text;

alter table project_files
  add column if not exists content_url text;

create table if not exists agendamentos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  owner_id uuid references users(id),
  title text not null,
  schedule_date date not null,
  schedule_time time not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agendamentos_lead_id on agendamentos(lead_id);
create index if not exists idx_agendamentos_schedule_date on agendamentos(schedule_date);
