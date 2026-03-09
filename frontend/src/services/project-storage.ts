import { projects as seedProjects, type Project } from "@/data/mock-data";

export type ProjectCredential = {
  id: string;
  label: string;
  url: string;
  username: string;
  password: string;
  notes: string;
};

export type ProjectFile = {
  id: string;
  name: string;
  type: "Contrato" | "Briefing" | "Escopo" | "Outro";
  mimeType: string;
  size: number;
  contentUrl: string;
};

export type ProjectBriefingItem = {
  id: string;
  question: string;
  answer: string;
};

export type ProjectRecord = Project & {
  goals: string;
  briefingItems: ProjectBriefingItem[];
  requestedDeliverables: string;
  communicationStyle: string;
  contractNotes: string;
  credentials: ProjectCredential[];
  files: ProjectFile[];
};

const STORAGE_KEY = "responsyva-project-records";

function createDefaultBriefingItems(project: Project, legacyText?: string): ProjectBriefingItem[] {
  const baseItems: ProjectBriefingItem[] = [
    {
      id: `${project.id}-briefing-objective`,
      question: "Qual o objetivo principal do projeto?",
      answer: legacyText?.trim() || "",
    },
    {
      id: `${project.id}-briefing-pain`,
      question: "Quais gargalos e dificuldades o cliente quer resolver agora?",
      answer: "",
    },
    {
      id: `${project.id}-briefing-expectation`,
      question: "Como o cliente espera operar depois da entrega?",
      answer: "",
    },
    {
      id: `${project.id}-briefing-restrictions`,
      question: "Existe alguma restricao tecnica, prazo ou dependencia de equipe?",
      answer: "",
    },
  ];

  return baseItems;
}

function buildSeedRecords(): ProjectRecord[] {
  return seedProjects.map((project) => ({
    ...project,
    goals: "",
    briefingItems: createDefaultBriefingItems(project),
    requestedDeliverables: "",
    communicationStyle: "",
    contractNotes: "",
    credentials: [],
    files: [],
  }));
}

function isLegacySeedRecord(record: ProjectRecord) {
  return /^(project-[123]|demo-)/.test(record.id);
}

export function loadProjectRecords() {
  if (typeof window === "undefined") {
    return buildSeedRecords();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seed = buildSeedRecords();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Array<ProjectRecord & { briefingAnswers?: string }>;

    if (parsed.some((record) => isLegacySeedRecord(record as ProjectRecord))) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    return parsed.map((record) => ({
      ...record,
      briefingItems:
        Array.isArray(record.briefingItems) && record.briefingItems.length > 0
          ? record.briefingItems
          : createDefaultBriefingItems(record, record.briefingAnswers),
      files: Array.isArray(record.files)
        ? record.files.map((file, index) => ({
            ...file,
            mimeType: file.mimeType || "application/octet-stream",
            size: typeof file.size === "number" ? file.size : 0,
            contentUrl: file.contentUrl || "",
            id: file.id || `${record.id}-file-${index + 1}`,
          }))
        : [],
    }));
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

export function saveProjectRecords(records: ProjectRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
