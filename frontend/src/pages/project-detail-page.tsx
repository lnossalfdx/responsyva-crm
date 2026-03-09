import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Globe,
  KeyRound,
  Plus,
  Save,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import {
  createProjectCredentialRecord,
  createProjectFileRecord,
  deleteProjectCredentialRecord,
  deleteProjectFileRecord,
  getProjectRecord,
  type ProjectBriefingItem,
  type ProjectCredentialRecord as ProjectCredential,
  type ProjectFileRecord as ProjectFile,
  type ProjectRecord,
  updateProjectRecord,
} from "@/services/crm-api";
import { canViewOwnedRecord, loadCurrentUser } from "@/services/access-control";

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

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const currentUser = loadCurrentUser();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [newCredential, setNewCredential] = useState({
    label: "",
    url: "",
    username: "",
    password: "",
    notes: "",
  });
  const [newBriefingQuestion, setNewBriefingQuestion] = useState("");
  const [selectedFileType, setSelectedFileType] = useState<ProjectFile["type"]>("Contrato");

  useEffect(() => {
    if (!projectId) {
      return;
    }

    getProjectRecord(projectId)
      .then(setProject)
      .catch((error) => console.error("Failed to load project", error));
  }, [projectId]);

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to="/projetos" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="size-4" />
          Voltar para projetos
        </Link>
        <Card className="p-8 text-zinc-300">Projeto não encontrado.</Card>
      </div>
    );
  }

  const currentProject = project;

  if (!canViewOwnedRecord(currentUser, currentProject.owner)) {
    return (
      <div className="space-y-4">
        <Link to="/projetos" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="size-4" />
          Voltar para projetos
        </Link>
        <Card className="p-8 text-zinc-300">Você não tem permissão para acessar este projeto.</Card>
      </div>
    );
  }

  async function updateProject(patch: Partial<ProjectRecord>) {
    const updated = await updateProjectRecord(currentProject.id, {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
      ...(patch.scope !== undefined ? { scope: patch.scope } : {}),
      ...(patch.objectives !== undefined ? { objectives: patch.objectives } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.goals !== undefined ? { goals: patch.goals } : {}),
      ...(patch.briefingItems !== undefined ? { briefingItems: patch.briefingItems } : {}),
      ...(patch.requestedDeliverables !== undefined ? { requestedDeliverables: patch.requestedDeliverables } : {}),
      ...(patch.communicationStyle !== undefined ? { communicationStyle: patch.communicationStyle } : {}),
      ...(patch.contractNotes !== undefined ? { contractNotes: patch.contractNotes } : {}),
      ...(patch.startDate !== undefined ? { startDate: patch.startDate } : {}),
      ...(patch.endDate !== undefined ? { endDate: patch.endDate } : {}),
    });

    setProject(updated);
  }

  async function addCredential() {
    if (!newCredential.label.trim()) {
      return;
    }

    await createProjectCredentialRecord(currentProject.id, {
      label: newCredential.label.trim(),
      provider: newCredential.label.trim(),
      url: newCredential.url.trim(),
      username: newCredential.username.trim(),
      password: newCredential.password.trim(),
      notes: newCredential.notes.trim(),
    });

    const refreshed = await getProjectRecord(currentProject.id);
    setProject(refreshed);
    setNewCredential({ label: "", url: "", username: "", password: "", notes: "" });
  }

  async function addFile(fileType: ProjectFile["type"], fileData: Omit<ProjectFile, "id" | "type">) {
    if (!fileData.name.trim() || !fileData.contentUrl) {
      return;
    }

    await createProjectFileRecord(currentProject.id, {
      type: fileType,
      name: fileData.name.trim(),
      mimeType: fileData.mimeType,
      size: fileData.size,
      contentUrl: fileData.contentUrl,
      uploadedBy: currentUser.id,
    });

    const refreshed = await getProjectRecord(currentProject.id);
    setProject(refreshed);
  }

  function formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (size >= 1024) {
      return `${Math.round(size / 1024)} KB`;
    }

    return `${size} B`;
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const contentUrl = typeof reader.result === "string" ? reader.result : "";

      addFile(selectedFileType, {
        name: selectedFile.name,
        mimeType: selectedFile.type || "application/octet-stream",
        size: selectedFile.size,
        contentUrl,
      });
      event.target.value = "";
    };

    reader.readAsDataURL(selectedFile);
  }

  function openFile(file: ProjectFile) {
    if (!file.contentUrl) {
      return;
    }

    window.open(file.contentUrl, "_blank", "noopener,noreferrer");
  }

  function downloadFile(file: ProjectFile) {
    if (!file.contentUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = file.contentUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function updateBriefingItem(itemId: string, patch: Partial<ProjectBriefingItem>) {
    await updateProject({
      briefingItems: currentProject.briefingItems.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    });
  }

  async function addBriefingItem() {
    if (!newBriefingQuestion.trim()) {
      return;
    }

    await updateProject({
      briefingItems: [
        ...currentProject.briefingItems,
        {
          id: `${currentProject.id}-briefing-${Date.now()}`,
          question: newBriefingQuestion.trim(),
          answer: "",
        },
      ],
    });
    setNewBriefingQuestion("");
  }

  async function removeBriefingItem(itemId: string) {
    await updateProject({
      briefingItems: currentProject.briefingItems.filter((item) => item.id !== itemId),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link to="/projetos" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="size-4" />
            Voltar para projetos
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-white">{currentProject.name}</h1>
          <p className="text-sm text-zinc-400">{currentProject.client}</p>
        </div>
        <div className="flex gap-3">
          <Badge tone={getProjectStatusTone(currentProject.status)}>
            {currentProject.status}
          </Badge>
          <Button variant="secondary" className="gap-2">
            <Save className="size-4" />
            Salvar alterações
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Status do projeto</p>
          <input
            value={currentProject.status}
            onChange={(event) => updateProject({ status: event.target.value })}
            placeholder="Digite o estado do projeto"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          />
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Responsável</p>
          <p className="mt-3 text-xl font-semibold text-white">{currentProject.owner}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Prioridade</p>
          <p className="mt-3 text-xl font-semibold text-white">{currentProject.priority}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Início</p>
          <p className="mt-3 text-xl font-semibold text-white">{currentProject.startDate}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Prazo final</p>
          <p className="mt-3 text-xl font-semibold text-white">{currentProject.endDate}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Target className="size-5 text-emerald-300" />
              <p className="font-semibold text-white">Metas e objetivos do projeto</p>
            </div>
            <textarea
              value={currentProject.goals}
              onChange={(event) => updateProject({ goals: event.target.value })}
              className="min-h-32 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-cyan-300" />
              <p className="font-semibold text-white">Perguntas, briefing e expectativas</p>
            </div>
            <div className="space-y-3">
              {currentProject.briefingItems.map((item, index) => (
                <div key={item.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Pergunta {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeBriefingItem(item.id)}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <input
                    value={item.question}
                    onChange={(event) => updateBriefingItem(item.id, { question: event.target.value })}
                    placeholder="Digite a pergunta do briefing"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(event) => updateBriefingItem(item.id, { answer: event.target.value })}
                    placeholder="Resposta do cliente"
                    className="mt-3 min-h-28 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-500">Adicionar nova pergunta</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={newBriefingQuestion}
                  onChange={(event) => setNewBriefingQuestion(event.target.value)}
                  placeholder="Ex.: Quais acessos e aprovacoes dependem do cliente?"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                />
                <Button onClick={addBriefingItem} className="gap-2">
                  <Plus className="size-4" />
                  Adicionar pergunta
                </Button>
              </div>
            </div>
            <textarea
              value={currentProject.requestedDeliverables}
              onChange={(event) => updateProject({ requestedDeliverables: event.target.value })}
              placeholder="Entregaveis esperados"
              className="min-h-28 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
            <textarea
              value={currentProject.communicationStyle}
              onChange={(event) => updateProject({ communicationStyle: event.target.value })}
              placeholder="Como o cliente quer a comunicação"
              className="min-h-24 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <KeyRound className="size-5 text-violet-300" />
              <p className="font-semibold text-white">Logins, senhas e acessos</p>
            </div>
            <div className="grid gap-3">
              {currentProject.credentials.map((credential) => (
                <div key={credential.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{credential.label}</p>
                      <p className="text-sm text-zinc-400">{credential.url || "Sem URL"}</p>
                    </div>
                    <Badge tone="slate">Credencial</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
                    <div>
                      <p className="text-zinc-500">Login</p>
                      <p className="mt-1 text-zinc-100">{credential.username || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Senha</p>
                      <p className="mt-1 text-zinc-100">{credential.password || "Não informada"}</p>
                    </div>
                  </div>
                  {credential.notes ? <p className="mt-3 text-sm text-zinc-300">{credential.notes}</p> : null}
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={newCredential.label}
                onChange={(event) => setNewCredential((current) => ({ ...current, label: event.target.value }))}
                placeholder="Sistema / conta"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                value={newCredential.url}
                onChange={(event) => setNewCredential((current) => ({ ...current, url: event.target.value }))}
                placeholder="URL"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                value={newCredential.username}
                onChange={(event) => setNewCredential((current) => ({ ...current, username: event.target.value }))}
                placeholder="Login"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              />
              <input
                value={newCredential.password}
                onChange={(event) => setNewCredential((current) => ({ ...current, password: event.target.value }))}
                placeholder="Senha / token"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              />
            </div>
            <textarea
              value={newCredential.notes}
              onChange={(event) => setNewCredential((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Observações da credencial"
              className="min-h-24 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
            <Button onClick={addCredential}>Adicionar credencial</Button>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-amber-300" />
              <p className="font-semibold text-white">Contrato e anexos</p>
            </div>
            <textarea
              value={currentProject.contractNotes}
              onChange={(event) => updateProject({ contractNotes: event.target.value })}
              className="min-h-28 w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
            <div className="grid gap-3">
              {currentProject.files.map((file) => (
                <div key={file.id} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {file.type} {file.size > 0 ? `• ${formatFileSize(file.size)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openFile(file)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                      >
                        <Eye className="size-4" />
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadFile(file)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                      >
                        <Download className="size-4" />
                        Baixar
                      </button>
                      <Badge tone="slate">{file.type}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[0.7fr_0.3fr]">
              <select
                value={selectedFileType}
                onChange={(event) => setSelectedFileType(event.target.value as ProjectFile["type"])}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="Contrato">Contrato</option>
                <option value="Briefing">Briefing</option>
                <option value="Escopo">Escopo</option>
                <option value="Outro">Outro</option>
              </select>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/10">
                <Upload className="size-4" />
                Selecionar arquivo
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              O arquivo anexado fica salvo localmente no navegador e pode ser aberto ou baixado a qualquer momento.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
