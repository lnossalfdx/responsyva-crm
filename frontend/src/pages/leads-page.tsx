import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SectionHeader } from "@/components/shared/section-header";
import { pipelineStages, type Lead, type PipelineStageId } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";
import { canViewOwnedRecord, isCommercialUser, loadCurrentUser } from "@/services/access-control";
import { useCrmStore } from "@/stores/use-crm-store";

export function LeadsPage() {
  const currentUser = loadCurrentUser();
  const restrictedToOwnLeads = isCommercialUser(currentUser);
  const leadItems = useCrmStore((state) => state.leads);
  const addLead = useCrmStore((state) => state.addLead);
  const loadLeads = useCrmStore((state) => state.loadLeads);
  const [query, setQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    segment: "",
    origin: "",
    estimatedValue: "",
    owner: "",
    stage: "novo-lead" as PipelineStageId,
    notes: "",
  });

  const filteredLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const visibleLeads = leadItems.filter((lead) => canViewOwnedRecord(currentUser, lead.owner));

    if (!normalized) {
      return visibleLeads;
    }

    return visibleLeads.filter((lead) =>
      [lead.name, lead.company, lead.origin, lead.owner, lead.segment, lead.email]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [currentUser, leadItems, query]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function createLead() {
    if (!form.name.trim() || !form.company.trim()) {
      return;
    }

    const newLead = await addLead({
      id: `lead-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      segment: form.segment.trim() || "Geral",
      origin: form.origin.trim() || "Manual",
      estimatedValue: Number(form.estimatedValue || 0),
      setupValue: 0,
      monthlyValue: 0,
      priority: "Media",
      score: 70,
      ownerId: currentUser.id,
      notes: form.notes.trim(),
      tags: ["Novo"],
      stage: form.stage,
      closedAt: form.stage === "fechado" ? new Date().toISOString().slice(0, 10) : undefined,
    } as Lead & { ownerId: string });
    setCreateOpen(false);
    setSelectedLead(newLead);
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      segment: "",
      origin: "",
      estimatedValue: "",
      owner: "",
      stage: "novo-lead",
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Growth engine"
        title="Gestão de leads"
        description="Pipeline de captação, qualificação e acompanhamento com contexto, score, tags, timeline e sinalização de prioridade."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Novo lead
          </Button>
        }
      />
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Search className="size-4 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            placeholder="Buscar por nome, empresa, origem ou responsável"
          />
        </div>
        <Button variant="secondary" className="gap-2">
          <SlidersHorizontal className="size-4" />
          Filtros avançados
        </Button>
      </div>
      <DataTable
        data={filteredLeads}
        getRowKey={(lead) => lead.id}
        onRowClick={(lead) => setSelectedLead(lead)}
        columns={[
          {
            key: "lead",
            header: "Lead",
            render: (lead) => (
              <div>
                <p className="font-medium text-white">{lead.name}</p>
                <p className="text-zinc-500">{lead.company}</p>
              </div>
            ),
          },
          { key: "segment", header: "Segmento", render: (lead) => lead.segment },
          { key: "origin", header: "Origem", render: (lead) => lead.origin },
          { key: "value", header: "Valor estimado", render: (lead) => formatCurrency(lead.estimatedValue) },
          { key: "priority", header: "Prioridade", render: (lead) => <Badge tone={lead.priority === "Alta" ? "emerald" : lead.priority === "Media" ? "amber" : "slate"}>{lead.priority}</Badge> },
          { key: "score", header: "Score", render: (lead) => `${lead.score}/100` },
          { key: "owner", header: "Responsável", render: (lead) => lead.owner },
          {
            key: "tags",
            header: "Tags",
            render: (lead) => (
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            ),
          },
        ]}
      />

      <Dialog.Root open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 outline-none">
            {selectedLead ? (
              <Card className="border-emerald-400/20">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-white">{selectedLead.name}</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-400">{selectedLead.company}</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Valor estimado</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(selectedLead.estimatedValue)}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Score</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedLead.score}/100</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Prioridade</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedLead.priority}</p>
                  </Card>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="text-sm font-medium text-white">Dados do lead</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500">Email</p>
                        <p className="mt-1 text-zinc-100">{selectedLead.email}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Telefone</p>
                        <p className="mt-1 text-zinc-100">{selectedLead.phone}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Segmento</p>
                        <p className="mt-1 text-zinc-100">{selectedLead.segment}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Origem</p>
                        <p className="mt-1 text-zinc-100">{selectedLead.origin}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Responsável</p>
                        <p className="mt-1 text-zinc-100">{selectedLead.owner}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Etapa</p>
                        <p className="mt-1 text-zinc-100">{selectedLead.stage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="text-sm font-medium text-white">Notas e tags</p>
                    <p className="text-sm text-zinc-300">{selectedLead.notes || "Sem observações internas."}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="border-emerald-400/20">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-white">Novo lead</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-zinc-400">Cadastre uma nova oportunidade comercial.</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Nome", "name"],
                  ["Empresa", "company"],
                  ["Email", "email"],
                  ["Telefone", "phone"],
                  ["Segmento", "segment"],
                  ["Origem", "origin"],
                  ["Valor estimado", "estimatedValue"],
                  ...(restrictedToOwnLeads ? [] : [["Responsável", "owner"] as const]),
                ].map(([label, key]) => (
                  <label key={key} className="space-y-2">
                    <span className="text-sm text-zinc-300">{label}</span>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                    />
                  </label>
                ))}
                <label className="space-y-2">
                  <span className="text-sm text-zinc-300">Etapa no pipeline</span>
                  <select
                    value={form.stage}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stage: event.target.value as PipelineStageId,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    {pipelineStages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-300">Observações</span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createLead}>Salvar lead</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
