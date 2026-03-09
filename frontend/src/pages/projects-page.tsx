import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { type Project } from "@/data/mock-data";
import { createProject, listClients, listProjects, type ProjectRecord } from "@/services/crm-api";
import { canViewOwnedRecord, isCommercialUser, loadCurrentUser } from "@/services/access-control";

function getProjectStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("atras")) {
    return "rose" as const;
  }

  if (normalized.includes("exec") || normalized.includes("andamento") || normalized.includes("ativo")) {
    return "emerald" as const;
  }

  if (normalized.includes("concl") || normalized.includes("final")) {
    return "amber" as const;
  }

  return "violet" as const;
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const currentUser = loadCurrentUser();
  const restrictedToOwnProjects = isCommercialUser(currentUser);
  const [projectItems, setProjectItems] = useState<ProjectRecord[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; company: string }>>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    clientId: "",
    status: "Kickoff",
    priority: "Media" as Project["priority"],
    scope: "",
    objectives: "",
    notes: "",
    startDate: "",
    endDate: "",
    progress: "0",
    checklist: "",
    integrations: "",
    credentials: "",
  });

  useEffect(() => {
    listProjects()
      .then(setProjectItems)
      .catch((error) => console.error("Failed to load projects", error));
    listClients()
      .then((items) => setClients(items.map((item) => ({ id: item.id, company: item.company }))))
      .catch((error) => console.error("Failed to load clients", error));
  }, []);

  async function createProjectRecord() {
    if (!form.name.trim() || !form.clientId) {
      return;
    }

    const created = await createProject({
      clientId: form.clientId,
      name: form.name.trim(),
      status: form.status,
      ownerId: currentUser.id,
      priority: form.priority,
      scope: form.scope.trim(),
      objectives: form.objectives.trim(),
      notes: form.notes.trim(),
      goals: "Definir metas do projeto.",
      briefingItems: [
        {
          id: `briefing-${Date.now()}-1`,
          question: "Qual o objetivo principal do projeto?",
          answer: "",
        },
        {
          id: `briefing-${Date.now()}-2`,
          question: "Quais gargalos o cliente quer resolver?",
          answer: "",
        },
      ],
      requestedDeliverables: form.checklist.trim(),
      communicationStyle: form.integrations.trim(),
      contractNotes: "Anexar contrato principal.",
      startDate: form.startDate || new Date().toISOString().slice(0, 10),
      endDate: form.endDate || new Date().toISOString().slice(0, 10),
      leadId: undefined,
    });

    setProjectItems((current) => [created, ...current]);
    setCreateOpen(false);
    setForm({
      name: "",
      clientId: "",
      status: "Kickoff",
      priority: "Media",
      scope: "",
      objectives: "",
      notes: "",
      startDate: "",
      endDate: "",
      progress: "0",
      checklist: "",
      integrations: "",
      credentials: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Delivery OS"
        title="Projetos"
        description="Projetos criados a partir do fechamento comercial, com overview, tarefas, checklist, timeline, comentários, arquivos, credenciais e integrações."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Novo projeto
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {projectItems.filter((project) => canViewOwnedRecord(currentUser, project.owner)).map((project) => (
          <button key={project.id} className="text-left" onClick={() => navigate(`/projetos/${project.id}`)}>
          <Card className="space-y-5 transition hover:border-emerald-300/20 hover:bg-white/6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{project.name}</p>
                <p className="text-sm text-zinc-400">{project.client}</p>
              </div>
              <Badge tone={getProjectStatusTone(project.status)}>{project.status}</Badge>
            </div>
            <p className="text-sm text-zinc-300">{project.scope}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Progresso</span>
                <span>{project.progress}%</span>
              </div>
              <Progress.Root value={project.progress} className="relative h-3 overflow-hidden rounded-full bg-white/10">
                <Progress.Indicator
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </Progress.Root>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400">
              <div>
                <p className="text-zinc-500">Responsável</p>
                <p className="text-zinc-100">{project.owner}</p>
              </div>
              <div>
                <p className="text-zinc-500">Prioridade</p>
                <p className="text-zinc-100">{project.priority}</p>
              </div>
              <div>
                <p className="text-zinc-500">Início</p>
                <p className="text-zinc-100">{project.startDate}</p>
              </div>
              <div>
                <p className="text-zinc-500">Prazo final</p>
                <p className="text-zinc-100">{project.endDate}</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-zinc-500">Credenciais seguras</p>
              <p className="text-sm text-zinc-300">Meta Ads, Google Ads, DNS, VPS, Supabase, n8n, Chatwoot e WhatsApp API preparados para armazenamento seguro por projeto.</p>
            </div>
          </Card>
          </button>
        ))}
      </div>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[88vh] w-[calc(100vw-2rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="flex h-full flex-col border-emerald-400/20 p-0">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6">
                <div>
                  <Dialog.Title className="text-3xl font-semibold text-white">Novo projeto</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-zinc-400">
                    Cadastre o projeto completo com escopo, objetivos, responsáveis, prazos, integrações e credenciais iniciais.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                      <p className="mb-4 text-sm font-medium text-white">Dados principais</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {[
                          ["Nome do projeto", "name"],
                          ["Cliente", "clientId"],
                          ["Progresso inicial (%)", "progress"],
                        ].map(([label, key]) => (
                          <label key={key} className="space-y-2">
                            <span className="text-sm text-zinc-300">{label}</span>
                            {key === "clientId" ? (
                              <select
                                value={form.clientId}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    clientId: event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                              >
                                <option value="">Selecione um cliente</option>
                                {clients.map((client) => (
                                  <option key={client.id} value={client.id}>
                                    {client.company}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={form[key as keyof typeof form]}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    [key]: event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                              />
                            )}
                          </label>
                        ))}
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Status do projeto</span>
                          <input
                            value={form.status}
                            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                            placeholder="Ex.: Em execucao, Kickoff, Validacao"
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Prioridade</span>
                          <select
                            value={form.priority}
                            onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as Project["priority"] }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baixa">Baixa</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Início</span>
                          <input
                            type="date"
                            value={form.startDate}
                            onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Prazo final</span>
                          <input
                            type="date"
                            value={form.endDate}
                            onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                      <p className="mb-4 text-sm font-medium text-white">Escopo e objetivos</p>
                      <div className="space-y-4">
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Escopo</span>
                          <textarea
                            value={form.scope}
                            onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value }))}
                            className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Objetivos</span>
                          <textarea
                            value={form.objectives}
                            onChange={(event) => setForm((current) => ({ ...current, objectives: event.target.value }))}
                            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Observações internas</span>
                          <textarea
                            value={form.notes}
                            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                      <p className="mb-4 text-sm font-medium text-white">Operação inicial</p>
                      <div className="space-y-4">
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Checklist inicial</span>
                          <textarea
                            value={form.checklist}
                            onChange={(event) => setForm((current) => ({ ...current, checklist: event.target.value }))}
                            placeholder="Ex.: kickoff, acessos, setup do ambiente, backlog..."
                            className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Integrações previstas</span>
                          <textarea
                            value={form.integrations}
                            onChange={(event) => setForm((current) => ({ ...current, integrations: event.target.value }))}
                            placeholder="Ex.: Supabase, n8n, Meta Ads, Google Ads, WhatsApp API..."
                            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Credenciais / acessos iniciais</span>
                          <textarea
                            value={form.credentials}
                            onChange={(event) => setForm((current) => ({ ...current, credentials: event.target.value }))}
                            placeholder="Ex.: DNS, VPS, login Meta, Google Ads, tokens..."
                            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                      <p className="mb-3 text-sm font-medium text-white">Resumo do cadastro</p>
                      <div className="space-y-2 text-sm text-zinc-300">
                        <p><span className="text-zinc-500">Projeto:</span> {form.name || "Nao informado"}</p>
                        <p><span className="text-zinc-500">Cliente:</span> {clients.find((item) => item.id === form.clientId)?.company || "Nao informado"}</p>
                        <p><span className="text-zinc-500">Status:</span> {form.status}</p>
                        <p><span className="text-zinc-500">Prioridade:</span> {form.priority}</p>
                        <p><span className="text-zinc-500">Responsável:</span> {currentUser.ownerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 px-8 py-5">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createProjectRecord}>Criar projeto</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
