import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { type Client } from "@/data/mock-data";
import { createClient, listClients } from "@/services/crm-api";
import { formatCurrency } from "@/lib/utils";
import { canViewOwnedRecord, isCommercialUser, loadCurrentUser } from "@/services/access-control";

export function ClientsPage() {
  const currentUser = loadCurrentUser();
  const restrictedToOwnClients = isCommercialUser(currentUser);
  const [clientItems, setClientItems] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    company: "",
    contact: "",
    phone: "",
    email: "",
    cnpj: "",
    website: "",
    segment: "",
    owner: "",
    notes: "",
    mrr: "",
  });

  useEffect(() => {
    listClients()
      .then(setClientItems)
      .catch((error) => console.error("Failed to load clients", error));
  }, []);

  async function handleCreateClient() {
    if (!form.company.trim() || !form.contact.trim()) {
      return;
    }

    const newClient = await createClient({
      company: form.company.trim(),
      contact: form.contact.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      cnpj: form.cnpj.trim(),
      website: form.website.trim(),
      segment: form.segment.trim() || "Geral",
      notes: form.notes.trim() || "Cliente recém-cadastrado.",
      ownerId: currentUser.id,
      status: "Onboarding",
    });

    setClientItems((current) => [newClient, ...current]);
    setCreateOpen(false);
    setSelectedClient(newClient);
    setForm({
      company: "",
      contact: "",
      phone: "",
      email: "",
      cnpj: "",
      website: "",
      segment: "",
      owner: "",
      notes: "",
      mrr: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Accounts"
        title="Clientes"
        description="Visão 360° de contas, contratos, propostas, projetos vinculados, arquivos, notas internas e histórico completo."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Novo cliente
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {clientItems.filter((client) => canViewOwnedRecord(currentUser, client.owner)).map((client) => (
          <button key={client.id} className="text-left" onClick={() => setSelectedClient(client)}>
            <Card className="space-y-4 transition hover:border-emerald-300/20 hover:bg-white/6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{client.company}</p>
                  <p className="text-sm text-zinc-400">{client.contact}</p>
                </div>
                <Badge tone={client.status === "Ativo" ? "emerald" : client.status === "Onboarding" ? "amber" : "violet"}>
                  {client.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-zinc-300">
                <div>
                  <p className="text-zinc-500">Responsável</p>
                  <p>{client.owner}</p>
                </div>
                <div>
                  <p className="text-zinc-500">MRR</p>
                  <p>{formatCurrency(client.mrr)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Segmento</p>
                  <p>{client.segment}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Site</p>
                  <p>{client.website}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.24em] text-zinc-500">Timeline recente</p>
                <p className="text-sm text-zinc-300">{client.notes}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Dialog.Root open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 outline-none">
            {selectedClient ? (
              <Card className="border-emerald-400/20">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-white">{selectedClient.company}</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-400">{selectedClient.contact}</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">MRR</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(selectedClient.mrr)}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Status</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedClient.status}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Segmento</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedClient.segment}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Responsável</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedClient.owner}</p>
                  </Card>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="text-sm font-medium text-white">Dados do cliente</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500">Contato</p>
                        <p className="mt-1 text-zinc-100">{selectedClient.contact}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Telefone</p>
                        <p className="mt-1 text-zinc-100">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Email</p>
                        <p className="mt-1 text-zinc-100">{selectedClient.email}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">CNPJ</p>
                        <p className="mt-1 text-zinc-100">{selectedClient.cnpj}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-zinc-500">Site</p>
                        <p className="mt-1 text-zinc-100">{selectedClient.website}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="text-sm font-medium text-white">Visão 360°</p>
                    <p className="text-sm text-zinc-300">{selectedClient.notes}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Propostas</p>
                        <p className="mt-2 text-lg font-semibold text-white">2 enviadas</p>
                      </div>
                      <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Projetos</p>
                        <p className="mt-2 text-lg font-semibold text-white">1 ativo</p>
                      </div>
                      <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Contratos</p>
                        <p className="mt-2 text-lg font-semibold text-white">1 assinado</p>
                      </div>
                      <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Arquivos</p>
                        <p className="mt-2 text-lg font-semibold text-white">6 itens</p>
                      </div>
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
                  <Dialog.Title className="text-2xl font-semibold text-white">Novo cliente</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-zinc-400">Cadastre uma nova conta na base do CRM.</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Empresa", "company"],
                  ["Contato", "contact"],
                  ["Telefone", "phone"],
                  ["Email", "email"],
                  ["CNPJ", "cnpj"],
                  ["Site", "website"],
                  ["Segmento", "segment"],
                  ...(restrictedToOwnClients ? [] : [["Responsável", "owner"] as const]),
                  ["MRR", "mrr"],
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
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                ))}
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-300">Observações</span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateClient}>Salvar cliente</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
