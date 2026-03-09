import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SectionHeader } from "@/components/shared/section-header";
import { type FinanceEntry } from "@/data/mock-data";
import { formatCurrency } from "@/lib/utils";
import { listFinanceEntries } from "@/services/crm-api";
import { canViewOwnedRecord, loadCurrentUser } from "@/services/access-control";
import { buildCommissionEntries, getFinanceSummaryFromLeads } from "@/services/crm-finance";
import { useCrmStore } from "@/stores/use-crm-store";

type SortMode = "due-asc" | "due-desc" | "amount-desc" | "amount-asc";

export function FinancePage() {
  const currentUser = loadCurrentUser();
  const leads = useCrmStore((state) => state.leads);
  const loadLeads = useCrmStore((state) => state.loadLeads);
  const [apiEntries, setApiEntries] = useState<FinanceEntry[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FinanceEntry["type"] | "Todos">("Todos");
  const [statusFilter, setStatusFilter] = useState<FinanceEntry["status"] | "Todos">("Todos");
  const [sortMode, setSortMode] = useState<SortMode>("due-asc");

  useEffect(() => {
    loadLeads();
    listFinanceEntries()
      .then(setApiEntries)
      .catch((error) => console.error("Failed to load finance entries", error));
  }, [loadLeads]);

  const visibleLeads = useMemo(
    () => leads.filter((lead) => canViewOwnedRecord(currentUser, lead.owner)),
    [currentUser, leads],
  );
  const derivedEntries = useMemo(
    () => [...apiEntries, ...buildCommissionEntries(visibleLeads)],
    [apiEntries, visibleLeads],
  );
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = derivedEntries.filter((entry) => {
      const matchesQuery = !normalized || entry.title.toLowerCase().includes(normalized);
      const matchesType = typeFilter === "Todos" || entry.type === typeFilter;
      const matchesStatus = statusFilter === "Todos" || entry.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortMode === "due-asc") {
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (sortMode === "due-desc") {
        return b.dueDate.localeCompare(a.dueDate);
      }

      if (sortMode === "amount-desc") {
        return b.amount - a.amount;
      }

      return a.amount - b.amount;
    });
  }, [derivedEntries, query, sortMode, statusFilter, typeFilter]);

  const totals = useMemo(() => {
    const summary = getFinanceSummaryFromLeads(visibleLeads);
    const overdue = derivedEntries
      .filter((entry) => entry.status === "Atrasado")
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      mrr: summary.mrr,
      forecast: summary.projectedRevenue,
      received: summary.closedRevenue,
      overdue,
      commission: summary.commissionTotal,
    };
  }, [derivedEntries, visibleLeads]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Revenue operations"
        title="Financeiro"
        description="Contas a receber, contas a pagar, parcelas, vencimentos, comprovantes, MRR, inadimplência e projeções."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-400">MRR</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totals.mrr)}</p>
          <p className="mt-2 text-xs text-zinc-500">Mensalidade recorrente dos negócios fechados</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Receita prevista</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totals.forecast)}</p>
          <p className="mt-2 text-xs text-zinc-500">Negócios ainda abertos no pipeline</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Receita recebida</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totals.received)}</p>
          <p className="mt-2 text-xs text-zinc-500">Total fechado na carteira</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-400">Comissão comercial</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totals.commission)}</p>
          <p className="mt-2 text-xs text-zinc-500">30% sobre os valores fechados</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <SlidersHorizontal className="size-4 text-emerald-300" />
          Filtros financeiros
        </div>
        <div className="grid gap-3 xl:grid-cols-[1.3fr_0.6fr_0.6fr_0.7fr]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="size-4 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              placeholder="Buscar por título financeiro"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as FinanceEntry["type"] | "Todos")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="Todos">Todos os tipos</option>
            <option value="Receber">Receber</option>
            <option value="Pagar">Pagar</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as FinanceEntry["status"] | "Todos")}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="Todos">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Atrasado">Atrasado</option>
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="due-asc">Vencimento crescente</option>
            <option value="due-desc">Vencimento decrescente</option>
            <option value="amount-desc">Maior valor</option>
            <option value="amount-asc">Menor valor</option>
          </select>
        </div>
      </Card>

      <DataTable
        data={filteredEntries}
        getRowKey={(entry) => entry.id}
        columns={[
          { key: "title", header: "Título", render: (entry) => entry.title },
          { key: "type", header: "Tipo", render: (entry) => entry.type },
          { key: "amount", header: "Valor", render: (entry) => formatCurrency(entry.amount) },
          { key: "dueDate", header: "Vencimento", render: (entry) => entry.dueDate },
          {
            key: "status",
            header: "Status",
            render: (entry) => (
              <Badge tone={entry.status === "Pago" ? "emerald" : entry.status === "Atrasado" ? "rose" : "amber"}>
                {entry.status}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
