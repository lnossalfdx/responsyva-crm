import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { createContract, listClients, listContracts, type ContractListItem as ContractItem } from "@/services/crm-api";

export function ContractsPage() {
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; company: string }>>([]);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    client: "",
    status: "Rascunho" as ContractItem["status"],
    signatureDate: "",
    value: "",
    signerName: "",
    signerEmail: "",
  });

  useEffect(() => {
    listContracts()
      .then(setContractItems)
      .catch((error) => console.error("Failed to load contracts", error));
    listClients()
      .then((items) => setClients(items.map((item) => ({ id: item.id, company: item.company }))))
      .catch((error) => console.error("Failed to load contract clients", error));
  }, []);

  async function handleCreateContract() {
    if (!form.client.trim()) {
      return;
    }

    const clientId = clients.find((item) => item.company === form.client)?.id;

    if (!clientId) {
      return;
    }

    await createContract({
      clientId,
      title: form.client.trim(),
      status:
        form.status === "Assinado"
          ? "Assinado"
          : form.status === "Aguardando assinatura"
            ? "Enviado"
            : "Rascunho",
      signatureDate: form.signatureDate || new Date().toISOString().slice(0, 10),
      signerName: form.signerName.trim() || "Não informado",
      signerEmail: form.signerEmail.trim() || "nao-informado@responsyva.ai",
    });

    const refreshed = await listContracts();
    setContractItems(refreshed);
    setCreateOpen(false);
    setSelectedContract(refreshed[0] ?? null);
    setForm({
      client: "",
      status: "Rascunho",
      signatureDate: "",
      value: "",
      signerName: "",
      signerEmail: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Legal automation"
        title="Contratos"
        description="Gestão de contratos com assinatura digital, histórico de aprovação e sincronização com propostas e portal do cliente."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Novo contrato
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {contractItems.map((contract) => (
          <button key={contract.id} className="text-left" onClick={() => setSelectedContract(contract)}>
            <Card className="space-y-4 transition hover:border-emerald-300/20 hover:bg-white/6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{contract.client}</p>
                  <p className="text-sm text-zinc-400">Assinatura prevista em {contract.signatureDate}</p>
                </div>
                <Badge tone={contract.status === "Assinado" ? "emerald" : "amber"}>{contract.status}</Badge>
              </div>
              <p className="text-sm text-zinc-300">{contract.value}</p>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                Timeline de envio, visualização, aceite, assinatura digital e download do PDF jurídico.
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Dialog.Root open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 outline-none">
            {selectedContract ? (
              <Card className="border-emerald-400/20">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-white">{selectedContract.client}</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-400">Assinatura prevista em {selectedContract.signatureDate}</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Status</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedContract.status}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Valor</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedContract.value}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Assinatura</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedContract.signatureDate}</p>
                  </Card>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-sm font-medium text-white">Assinante</p>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p><span className="text-zinc-500">Nome:</span> {selectedContract.signerName}</p>
                      <p><span className="text-zinc-500">Email:</span> {selectedContract.signerEmail}</p>
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-sm font-medium text-white">Ações</p>
                    <div className="grid gap-3">
                      <Button>Ver contrato</Button>
                      <Button variant="secondary">Enviar para assinatura</Button>
                      <Button variant="secondary">Baixar PDF</Button>
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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[82vh] w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="flex h-full flex-col border-emerald-400/20 p-0">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6">
                <div>
                  <Dialog.Title className="text-3xl font-semibold text-white">Novo contrato</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-zinc-400">
                    Cadastre o contrato com cliente, valor, assinante e status jurídico.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="grid gap-6 md:grid-cols-2">
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
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ContractItem["status"] }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="Rascunho">Rascunho</option>
                      <option value="Aguardando assinatura">Aguardando assinatura</option>
                      <option value="Assinado">Assinado</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Data de assinatura</span>
                    <input
                      type="date"
                      value={form.signatureDate}
                      onChange={(event) => setForm((current) => ({ ...current, signatureDate: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Valor</span>
                    <input
                      value={form.value}
                      onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Nome do assinante</span>
                    <input
                      value={form.signerName}
                      onChange={(event) => setForm((current) => ({ ...current, signerName: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Email do assinante</span>
                    <input
                      value={form.signerEmail}
                      onChange={(event) => setForm((current) => ({ ...current, signerEmail: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 px-8 py-5">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateContract}>Salvar contrato</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
