# Responsyva CRM AI

CRM SaaS premium para operacao comercial, projetos, contratos, financeiro e copiloto de IA.

## Estrutura

- `frontend/`: React + TypeScript + Vite + Tailwind + Zustand + React Query + React Router
- `backend/`: Node.js + Express + TypeScript
- `supabase/`: schema SQL inicial para Postgres/Storage/integracoes

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Ambiente

### Frontend

Crie `frontend/.env`:

```bash
VITE_API_URL=https://api.responsyvya-ai.com.br/api
```

### Backend

Crie `backend/.env` com base em `backend/.env.example`:

```bash
NODE_ENV=production
PORT=3333
CORS_ORIGIN=https://crm.responsyvya-ai.com.br
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=SUA_ANON_KEY
```

## Deploy VPS

### 1. Banco no Supabase

No SQL Editor, execute nesta ordem:

- `supabase/migrations/20260306_initial_schema.sql`
- `supabase/migrations/20260309_crm_runtime_fields.sql`

Depois insira pelo menos um usuário em `users` para conseguir entrar no CRM.

Exemplo:

```sql
insert into users (full_name, email, role, status, department)
values ('Logan Nossal', 'logan@responsyva.ai', 'Super Admin', 'Ativo', 'Diretoria');
```

### 2. Build

```bash
npm install
npm run build
```

### 3. Backend

```bash
cd backend
npm install --omit=dev
npm run build
node dist/index.js
```

Recomendado em produção com PM2:

```bash
cd backend
pm2 start dist/index.js --name responsyva-crm-api
pm2 save
```

### 4. Frontend

```bash
cd frontend
npm install
npm run build
```

Sirva `frontend/dist` com Nginx em `crm.responsyvya-ai.com.br`.

### 5. Nginx

Use duas entradas:

- `crm.responsyvya-ai.com.br` apontando para `frontend/dist`
- `api.responsyvya-ai.com.br` fazendo proxy para `http://127.0.0.1:3333`

Exemplo para a API:

```nginx
server {
    server_name api.responsyvya-ai.com.br;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Exemplo para o frontend:

```nginx
server {
    server_name crm.responsyvya-ai.com.br;
    root /caminho/do/projeto/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

## Modulos iniciais

- Dashboard executivo
- Leads
- Clientes
- Pipeline kanban com drag and drop
- Projetos
- Propostas
- Contratos
- Financeiro
- Automacoes
- Central de IA
- Configuracoes
- Portal publico de proposta/contrato
