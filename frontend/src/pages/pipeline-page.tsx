import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import type { Lead } from "@/data/mock-data";
import { useCrmStore } from "@/stores/use-crm-store";
import { canViewOwnedRecord, loadCurrentUser } from "@/services/access-control";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCurrencyInput(value: string) {
  const digits = digitsOnly(value);

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function PipelinePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = loadCurrentUser();
  const addLead = useCrmStore((state) => state.addLead);
  const leads = useCrmStore((state) => state.leads);
  const loadLeads = useCrmStore((state) => state.loadLeads);
  const updateLead = useCrmStore((state) => state.updateLead);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    segment: "",
    origin: "",
    setupValue: "",
    monthlyValue: "",
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    segment: "",
    origin: "",
    setupValue: "",
    monthlyValue: "",
    priority: "Media" as Lead["priority"],
    score: "0",
    stage: "novo-lead" as Lead["stage"],
    notes: "",
    tags: "",
  });

  const visibleLeads = leads.filter((lead) => canViewOwnedRecord(currentUser, lead.owner));

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const leadId = searchParams.get("leadId");

    if (!leadId || selectedLead) {
      return;
    }

    const lead = visibleLeads.find((item) => item.id === leadId);

    if (!lead) {
      return;
    }

    openLeadSettings(lead);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("leadId");
      return next;
    }, { replace: true });
  }, [searchParams, selectedLead, setSearchParams, visibleLeads]);

  function openLeadSettings(lead: Lead) {
    setSelectedLead(lead);
    setEditForm({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      segment: lead.segment,
      origin: lead.origin,
      setupValue: formatCurrencyInput(String(Math.round(lead.setupValue * 100))),
      monthlyValue: formatCurrencyInput(String(Math.round(lead.monthlyValue * 100))),
      priority: lead.priority,
      score: String(lead.score),
      stage: lead.stage,
      notes: lead.notes,
      tags: lead.tags.join(", "),
    });
  }

  async function saveLeadSettings() {
    if (!selectedLead) {
      return;
    }

    await updateLead(selectedLead.id, {
      name: editForm.name.trim() || selectedLead.name,
      company: editForm.company.trim() || selectedLead.company,
      email: editForm.email.trim(),
      phone: formatPhone(editForm.phone),
      segment: editForm.segment.trim() || "Geral",
      origin: editForm.origin.trim() || "Manual",
      setupValue: Number(digitsOnly(editForm.setupValue) || 0) / 100,
      monthlyValue: Number(digitsOnly(editForm.monthlyValue) || 0) / 100,
      estimatedValue:
        Number(digitsOnly(editForm.setupValue) || 0) / 100 +
        Number(digitsOnly(editForm.monthlyValue) || 0) / 100,
      priority: editForm.priority,
      score: Number(editForm.score || 0),
      stage: editForm.stage,
      notes: editForm.notes.trim(),
      tags: editForm.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setSelectedLead(null);
  }

  async function createBusiness() {
    if (!form.name.trim() || !form.company.trim()) {
      return;
    }

    const setupValue = Number(digitsOnly(form.setupValue) || 0) / 100;
    const monthlyValue = Number(digitsOnly(form.monthlyValue) || 0) / 100;
    const notes = [
      setupValue > 0 ? `Setup: R$ ${setupValue.toLocaleString("pt-BR")}` : "",
      monthlyValue > 0 ? `Mensalidade: R$ ${monthlyValue.toLocaleString("pt-BR")}` : "",
      form.notes.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    await addLead({
      id: `lead-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: formatPhone(form.phone),
      segment: form.segment.trim() || "Geral",
      origin: form.origin.trim() || "Manual",
      estimatedValue: setupValue + monthlyValue,
      setupValue,
      monthlyValue,
      priority: "Media",
      score: 72,
      ownerId: currentUser.id,
      notes,
      tags: ["Novo"],
      stage: "novo-lead",
      closedAt: undefined,
    } as Lead & { ownerId: string });
    setCreateOpen(false);
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      segment: "",
      origin: "",
      setupValue: "",
      monthlyValue: "",
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Sales orchestration"
        title="Pipeline Kanban"
        description=""
        action={
          <div className="flex gap-3">
            <Badge tone="emerald">Auto-create cliente/projeto em fechado</Badge>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Novo negócio
            </Button>
          </div>
        }
      />
      <div className="max-w-full">
        <PipelineBoard visibleLeads={visibleLeads} onLeadClick={openLeadSettings} />
      </div>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="border-emerald-400/20">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-white">Novo negócio</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-zinc-400">Crie uma nova oportunidade direto no pipeline.</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-6">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="mb-4 pl-1 text-xs uppercase tracking-[0.22em] text-zinc-500">Contato</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["Nome", "name"],
                      ["Empresa", "company"],
                      ["Email", "email"],
                      ["Telefone", "phone"],
                      ["Segmento", "segment"],
                      ["Origem", "origin"],
                    ].map(([label, key]) => (
                      <label key={key} className="space-y-2">
                        <span className="pl-1 text-sm font-medium text-zinc-300">{label}</span>
                        <input
                          value={form[key as keyof typeof form]}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [key]:
                                key === "phone"
                                  ? formatPhone(event.target.value)
                                  : event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="mb-4 pl-1 text-xs uppercase tracking-[0.22em] text-zinc-500">Comercial</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["Valor de setup", "setupValue"],
                      ["Valor de mensalidade", "monthlyValue"],
                    ].map(([label, key]) => (
                      <label key={key} className="space-y-2">
                        <span className="pl-1 text-sm font-medium text-zinc-300">{label}</span>
                        <input
                          value={form[key as keyof typeof form]}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [key]: formatCurrencyInput(event.target.value),
                            }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                        />
                      </label>
                    ))}
                    <label className="space-y-2 md:col-span-2">
                      <span className="pl-1 text-sm font-medium text-zinc-300">Observações</span>
                      <textarea
                        value={form.notes}
                        onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                        className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createBusiness}>Salvar negócio</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[86vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 outline-none">
            {selectedLead ? (
              <Card className="flex h-full flex-col border-emerald-400/20 p-0">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6">
                  <div>
                    <Dialog.Title className="text-3xl font-semibold text-white">Configurações do negócio</Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-zinc-400">
                      Edite dados comerciais, descrição, etapa do pipeline e contexto da oportunidade.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                      <X className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                        <p className="mb-4 text-sm font-medium text-white">Dados principais</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            ["Nome", "name"],
                            ["Empresa", "company"],
                            ["Email", "email"],
                            ["Telefone", "phone"],
                            ["Segmento", "segment"],
                            ["Origem", "origin"],
                          ].map(([label, key]) => (
                            <label key={key} className="space-y-2">
                              <span className="text-sm text-zinc-300">{label}</span>
                              <input
                                value={editForm[key as keyof typeof editForm] as string}
                                onChange={(event) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    [key]: key === "phone" ? formatPhone(event.target.value) : event.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                        <p className="mb-4 text-sm font-medium text-white">Descrição e contexto</p>
                        <div className="grid gap-4">
                          <label className="space-y-2">
                            <span className="text-sm text-zinc-300">Descrição / observações</span>
                            <textarea
                              value={editForm.notes}
                              onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                              className="min-h-36 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-zinc-300">Tags</span>
                            <input
                              value={editForm.tags}
                              onChange={(event) => setEditForm((current) => ({ ...current, tags: event.target.value }))}
                              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                              placeholder="IA, WhatsApp, Enterprise"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                        <p className="mb-4 text-sm font-medium text-white">Configuração comercial</p>
                        <div className="grid gap-4">
                          <label className="space-y-2">
                            <span className="text-sm text-zinc-300">Valor de setup</span>
                            <input
                              value={editForm.setupValue}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  setupValue: formatCurrencyInput(event.target.value),
                                }))
                              }
                              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm text-zinc-300">Valor de mensalidade</span>
                            <input
                              value={editForm.monthlyValue}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  monthlyValue: formatCurrencyInput(event.target.value),
                                }))
                              }
                              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                            />
                          </label>
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm text-zinc-300">Prioridade</span>
                              <select
                                value={editForm.priority}
                                onChange={(event) =>
                                  setEditForm((current) => ({ ...current, priority: event.target.value as Lead["priority"] }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                              >
                                <option value="Alta">Alta</option>
                                <option value="Media">Média</option>
                                <option value="Baixa">Baixa</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm text-zinc-300">Score</span>
                              <input
                                value={editForm.score}
                                onChange={(event) =>
                                  setEditForm((current) => ({
                                    ...current,
                                    score: digitsOnly(event.target.value).slice(0, 3),
                                  }))
                                }
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                              />
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-sm text-zinc-300">Etapa no pipeline</span>
                            <select
                              value={editForm.stage}
                              onChange={(event) =>
                                setEditForm((current) => ({ ...current, stage: event.target.value as Lead["stage"] }))
                              }
                              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                            >
                              <option value="novo-lead">Novo lead</option>
                              <option value="contato-iniciado">Contato iniciado</option>
                              <option value="qualificacao">Qualificação</option>
                              <option value="diagnostico">Diagnóstico</option>
                              <option value="proposta-enviada">Proposta enviada</option>
                              <option value="negociacao">Negociação</option>
                              <option value="fechado">Fechado</option>
                              <option value="perdido">Perdido</option>
                            </select>
                          </label>
                          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                            <p className="font-medium text-white">Responsável atual</p>
                            <p className="mt-1">{selectedLead.owner}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 px-8 py-5">
                  <Button variant="secondary" onClick={() => setSelectedLead(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveLeadSettings}>Salvar alterações</Button>
                </div>
              </Card>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
