import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { type Proposal } from "@/data/mock-data";
import { createProposal, listClients, listProposals } from "@/services/crm-api";
import { formatCurrency } from "@/lib/utils";

export function ProposalsPage() {
  const [proposalItems, setProposalItems] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; company: string }>>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    client: "",
    setup: "",
    monthly: "",
    validUntil: "",
    status: "Rascunho" as Proposal["status"],
    items: "",
    description: "",
    conditions: "",
  });

  useEffect(() => {
    listProposals()
      .then(setProposalItems)
      .catch((error) => console.error("Failed to load proposals", error));
    listClients()
      .then((items) => setClients(items.map((item) => ({ id: item.id, company: item.company }))))
      .catch((error) => console.error("Failed to load proposal clients", error));
  }, []);

  async function handleCreateProposal() {
    if (!form.client.trim()) {
      return;
    }

    await createProposal({
      title: form.client.trim(),
      clientId: clients.find((item) => item.company === form.client)?.id,
      setup: Number(form.setup || 0),
      monthly: Number(form.monthly || 0),
      description: form.description,
      conditions: form.conditions,
      status: form.status,
      validUntil: form.validUntil || new Date().toISOString().slice(0, 10),
    });

    const refreshed = await listProposals();
    setProposalItems(refreshed);
    setCreateOpen(false);
    setSelectedProposal(refreshed[0] ?? null);
    setForm({
      client: "",
      setup: "",
      monthly: "",
      validUntil: "",
      status: "Rascunho",
      items: "",
      description: "",
      conditions: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Commercial documents"
        title="Propostas"
        description="Gerador de propostas com setup, mensalidade, itens, condições comerciais e link público para aprovação do cliente."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Nova proposta
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {proposalItems.map((proposal) => (
          <button key={proposal.id} className="text-left" onClick={() => setSelectedProposal(proposal)}>
            <Card className="space-y-4 transition hover:border-emerald-300/20 hover:bg-white/6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{proposal.client}</p>
                  <p className="text-sm text-zinc-400">Validade até {proposal.validUntil}</p>
                </div>
                <Badge tone={proposal.status === "Aprovada" ? "emerald" : proposal.status === "Ajuste solicitado" ? "amber" : "violet"}>
                  {proposal.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Setup</p>
                  <p className="text-zinc-100">{formatCurrency(proposal.setup)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Mensalidade</p>
                  <p className="text-zinc-100">{formatCurrency(proposal.monthly)}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                Link público preparado para aprovação, reprovação, pedido de ajuste, visualização de contrato e download de PDF.
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Dialog.Root open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposal(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 outline-none">
            {selectedProposal ? (
              <Card className="border-emerald-400/20">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-white">{selectedProposal.client}</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-400">Validade até {selectedProposal.validUntil}</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Setup</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(selectedProposal.setup)}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Mensalidade</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(selectedProposal.monthly)}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Status</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedProposal.status}</p>
                  </Card>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-sm font-medium text-white">Estrutura comercial</p>
                    <div className="space-y-3 text-sm text-zinc-300">
                      <p>Itens comerciais, setup, mensalidade, condições e escopo base da proposta.</p>
                      <p>Link público disponível para aprovação, reprovação, pedido de ajuste e geração posterior de contrato.</p>
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-sm font-medium text-white">Ações</p>
                    <div className="grid gap-3">
                      <Button>Abrir link público</Button>
                      <Button variant="secondary">Duplicar proposta</Button>
                      <Button variant="secondary">Gerar PDF</Button>
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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[86vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="flex h-full flex-col border-emerald-400/20 p-0">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6">
                <div>
                  <Dialog.Title className="text-3xl font-semibold text-white">Nova proposta</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-zinc-400">
                    Cadastre setup, mensalidade, itens, descrição, condições comerciais e validade.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                      <p className="mb-4 text-sm font-medium text-white">Dados principais</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Cliente</span>
                          <input
                            value={form.client}
                            onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Status</span>
                          <select
                            value={form.status}
                            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Proposal["status"] }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="Rascunho">Rascunho</option>
                            <option value="Enviada">Enviada</option>
                            <option value="Aprovada">Aprovada</option>
                            <option value="Ajuste solicitado">Ajuste solicitado</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Setup</span>
                          <input
                            value={form.setup}
                            onChange={(event) => setForm((current) => ({ ...current, setup: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Mensalidade</span>
                          <input
                            value={form.monthly}
                            onChange={(event) => setForm((current) => ({ ...current, monthly: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2 md:col-span-2">
                          <span className="text-sm text-zinc-300">Validade</span>
                          <input
                            type="date"
                            value={form.validUntil}
                            onChange={(event) => setForm((current) => ({ ...current, validUntil: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                      <p className="mb-4 text-sm font-medium text-white">Conteúdo da proposta</p>
                      <div className="space-y-4">
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Itens</span>
                          <textarea
                            value={form.items}
                            onChange={(event) => setForm((current) => ({ ...current, items: event.target.value }))}
                            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Descrição</span>
                          <textarea
                            value={form.description}
                            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-zinc-300">Condições comerciais</span>
                          <textarea
                            value={form.conditions}
                            onChange={(event) => setForm((current) => ({ ...current, conditions: event.target.value }))}
                            className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                      <p className="mb-3 text-sm font-medium text-white">Resumo</p>
                      <div className="space-y-2 text-sm text-zinc-300">
                        <p><span className="text-zinc-500">Cliente:</span> {form.client || "Nao informado"}</p>
                        <p><span className="text-zinc-500">Setup:</span> {form.setup || "0"}</p>
                        <p><span className="text-zinc-500">Mensalidade:</span> {form.monthly || "0"}</p>
                        <p><span className="text-zinc-500">Status:</span> {form.status}</p>
                        <p><span className="text-zinc-500">Validade:</span> {form.validUntil || "Nao informada"}</p>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                      <p className="mb-3 text-sm font-medium text-white">Fluxo posterior</p>
                      <p className="text-sm text-zinc-300">
                        A proposta podera gerar link publico, aprovação do cliente, mudança de status comercial e criação posterior de contrato e financeiro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 px-8 py-5">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProposal}>Salvar proposta</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
