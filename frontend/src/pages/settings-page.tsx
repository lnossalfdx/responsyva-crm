import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, Sparkles, UserCog, X } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { createUser, listUsers, type UserRecord as SystemUser } from "@/services/crm-api";
import { getOwnerNameFromFullName, loadCurrentUser, saveCurrentUser } from "@/services/access-control";

type UserRole = "Super Admin" | "Admin" | "Operacional" | "Financeiro" | "Comercial";
type UserStatus = "Ativo" | "Convidado" | "Suspenso";

export function SettingsPage() {
  const activeUser = loadCurrentUser();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Operacional" as UserRole,
    status: "Convidado" as UserStatus,
    department: "",
  });

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((error) => console.error("Failed to load users", error));
  }, []);

  async function handleCreateUser() {
    if (!form.name.trim() || !form.email.trim()) {
      return;
    }

    const newUser = await createUser({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
      department: form.department.trim() || "Não definido",
    });

    setUsers((current) => [newUser, ...current]);
    setCreateOpen(false);
    setSelectedUser(newUser);
    setForm({
      name: "",
      email: "",
      role: "Operacional",
      status: "Convidado",
      department: "",
    });
  }

  function assumeUser(user: SystemUser) {
    saveCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ownerName: getOwnerNameFromFullName(user.name),
    });
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="System"
        title="Configurações"
        description="Área de super admin para usuários, permissões, segurança, integrações, templates comerciais e parâmetros da camada de IA."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Novo usuário
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                <UserCog className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Usuários e permissões</p>
                <p className="text-sm text-zinc-400">Gerencie acesso por perfil, área e status.</p>
              </div>
            </div>
            <Badge tone="emerald">Super Admin</Badge>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full rounded-[26px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-300/20 hover:bg-white/7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={user.status === "Ativo" ? "emerald" : user.status === "Convidado" ? "amber" : "rose"}>{user.status}</Badge>
                    <Badge tone={user.role === "Super Admin" ? "violet" : "slate"}>{user.role}</Badge>
                    {activeUser.id === user.id ? <Badge tone="emerald">Conta atual</Badge> : null}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500">Departamento</p>
                    <p className="mt-1 text-zinc-200">{user.department}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Escopo</p>
                    <p className="mt-1 text-zinc-200">
                      {user.role === "Super Admin" ? "Acesso total ao sistema" : "Permissões segmentadas"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200">
                <ShieldCheck className="size-4" />
              </div>
              <p className="font-medium text-white">Segurança e acesso</p>
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Controle de papéis: `Super Admin`, `Admin`, `Operacional`, `Financeiro`, `Comercial`.</p>
              <p>Fluxo de convite de usuários e suspensão de conta preparado na interface.</p>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200">
                <KeyRound className="size-4" />
              </div>
              <p className="font-medium text-white">Integrações e tokens</p>
            </div>
            <div className="grid gap-2 text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Supabase: conectado</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">n8n: pronto para token</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">WhatsApp API: aguardando credenciais</div>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-200">
                <Sparkles className="size-4" />
              </div>
              <p className="font-medium text-white">Templates e automações</p>
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Templates de proposta, contrato e playbooks comerciais centralizados.</p>
              <p>Permissões por perfil podem ser expandidas para editar ou apenas visualizar documentos.</p>
            </div>
          </Card>
        </div>
      </div>

      <Dialog.Root open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 outline-none">
            {selectedUser ? (
              <Card className="border-emerald-400/20">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-semibold text-white">{selectedUser.name}</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-zinc-400">{selectedUser.email}</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Perfil</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedUser.role}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Status</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedUser.status}</p>
                  </Card>
                  <Card className="rounded-[24px] bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Departamento</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{selectedUser.department}</p>
                  </Card>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-sm font-medium text-white">Permissões</p>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>{selectedUser.role === "Super Admin" ? "Acesso total ao CRM, usuários, módulos e integrações." : "Acesso segmentado conforme o papel atribuído."}</p>
                      <p>Pronto para evolução com RBAC real via backend/Supabase.</p>
                    </div>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <p className="mb-3 text-sm font-medium text-white">Ações administrativas</p>
                    <div className="grid gap-3">
                      <Button onClick={() => assumeUser(selectedUser)}>Usar esta conta</Button>
                      <Button variant="secondary">Reenviar convite</Button>
                      <Button variant="secondary">Editar permissões</Button>
                      <Button variant="ghost">Suspender acesso</Button>
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
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[80vh] w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="flex h-full flex-col border-emerald-400/20 p-0">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-8 py-6">
                <div>
                  <Dialog.Title className="text-3xl font-semibold text-white">Novo usuário</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-zinc-400">
                    Como super admin, você pode convidar usuários, definir papel e configurar status inicial de acesso.
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
                    <span className="text-sm text-zinc-300">Nome</span>
                    <input
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Email</span>
                    <input
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Papel</span>
                    <select
                      value={form.role}
                      onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Operacional">Operacional</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Comercial">Comercial</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-zinc-300">Status inicial</span>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as UserStatus }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="Convidado">Convidado</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-zinc-300">Departamento</span>
                    <input
                      value={form.department}
                      onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 px-8 py-5">
                <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>Criar usuário</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
