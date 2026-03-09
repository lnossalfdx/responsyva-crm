import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Command, FolderKanban, LogOut, Search, WandSparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/button";
import type { ProjectRecord } from "@/services/crm-api";
import { listProjects } from "@/services/crm-api";
import { useCrmStore } from "@/stores/use-crm-store";
import { canViewOwnedRecord, clearCurrentUser, loadCurrentUser } from "@/services/access-control";

type SearchResult = {
  id: string;
  type: "lead" | "project";
  title: string;
  subtitle: string;
  path: string;
};

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const leads = useCrmStore((state) => state.leads);
  const currentUser = loadCurrentUser();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((error) => console.error("Failed to load projects for search", error));
  }, [location.pathname]);

  const results = useMemo<SearchResult[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    const leadResults = leads
      .filter((lead) => canViewOwnedRecord(currentUser, lead.owner))
      .filter((lead) =>
        [lead.name, lead.company, lead.email, lead.segment, lead.origin]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
      .map((lead) => ({
        id: lead.id,
        type: "lead" as const,
        title: lead.name,
        subtitle: `${lead.company} · Negócio`,
        path: `/pipeline?leadId=${lead.id}`,
      }));

    const projectResults = projects
      .filter((project) => canViewOwnedRecord(currentUser, project.owner))
      .filter((project) =>
        [project.name, project.client, project.status, project.scope]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
      .map((project) => ({
        id: project.id,
        type: "project" as const,
        title: project.name,
        subtitle: `${project.client} · Projeto`,
        path: `/projetos/${project.id}`,
      }));

    return [...leadResults, ...projectResults].slice(0, 8);
  }, [currentUser, leads, projects, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [location.pathname, location.search]);

  function handleSignOut() {
    clearCurrentUser();
    navigate("/login", { replace: true });
  }

  function handleNavigate(path: string) {
    setIsOpen(false);
    setQuery("");
    navigate(path);
  }

  function handleSubmit() {
    if (!results[0]) {
      return;
    }

    handleNavigate(results[0].path);
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-black/20 px-4 py-4 backdrop-blur-2xl sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button variant="secondary" className="shrink-0 gap-2" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sair
        </Button>
        <div ref={containerRef} className="relative flex min-w-0 flex-1">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="size-4 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              placeholder="Buscar negócios e projetos..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-400 sm:flex">
              <Command className="size-3" />
              K
            </div>
          </div>

          {isOpen && query.trim() ? (
            <div className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl">
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      type="button"
                      onClick={() => handleNavigate(result.path)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                    >
                      <div className="mt-0.5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300">
                        {result.type === "lead" ? (
                          <Search className="size-4" />
                        ) : (
                          <FolderKanban className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{result.title}</p>
                        <p className="truncate text-xs text-zinc-400">{result.subtitle}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                        {result.type === "lead" ? "Negócio" : "Projeto"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-sm text-zinc-400">Nenhum resultado encontrado.</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="icon">
          <Bell className="size-4" />
        </Button>
        <Button size="sm" className="gap-2">
          <WandSparkles className="size-4" />
          Modo IA
        </Button>
      </div>
    </header>
  );
}
