import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Link2, Plus, X } from "lucide-react";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { SectionHeader } from "@/components/shared/section-header";
import { canViewOwnedRecord, loadCurrentUser } from "@/services/access-control";
import { createSchedule, listSchedules, type ScheduleItem } from "@/services/crm-api";
import { useCrmStore } from "@/stores/use-crm-store";

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildCalendarDays(monthDate: Date) {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startWeekday = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();
  const totalSlots = Math.ceil((startWeekday + totalDays) / 7) * 7;

  return Array.from({ length: totalSlots }, (_, index) => {
    const dayNumber = index - startWeekday + 1;

    if (dayNumber < 1 || dayNumber > totalDays) {
      return null;
    }

    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber);
    return {
      date,
      key: toDateKey(date),
      dayNumber,
    };
  });
}

export function SchedulesPage() {
  const currentUser = loadCurrentUser();
  const leads = useCrmStore((state) => state.leads);
  const loadLeads = useCrmStore((state) => state.loadLeads);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({
    leadId: "",
    title: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    notes: "",
  });

  useEffect(() => {
    loadLeads();
    listSchedules()
      .then(setItems)
      .catch((error) => console.error("Failed to load schedules", error));
  }, [loadLeads]);

  const visibleLeads = useMemo(
    () => leads.filter((lead) => canViewOwnedRecord(currentUser, lead.owner)),
    [currentUser, leads],
  );

  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => canViewOwnedRecord(currentUser, item.owner))
        .sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`)),
    [currentUser, items],
  );

  const monthDays = useMemo(() => buildCalendarDays(activeMonth), [activeMonth]);
  const selectedDayItems = useMemo(
    () => visibleItems.filter((item) => item.date === selectedDate),
    [selectedDate, visibleItems],
  );

  function openCreateForDate(date: string) {
    setSelectedDate(date);
    setForm((current) => ({ ...current, date }));
    setCreateOpen(true);
  }

  function changeMonth(direction: "prev" | "next") {
    setActiveMonth((current) => {
      const nextMonth = new Date(current);
      nextMonth.setMonth(current.getMonth() + (direction === "next" ? 1 : -1));
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    });
  }

  async function createScheduleItem() {
    const linkedLead = visibleLeads.find((lead) => lead.id === form.leadId);

    if (!linkedLead || !form.title.trim()) {
      return;
    }

    await createSchedule({
      leadId: linkedLead.id,
      ownerId: currentUser.id,
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      notes: form.notes.trim(),
    });

    const refreshed = await listSchedules();
    setItems(refreshed);
    setCreateOpen(false);
    setSelectedDate(form.date);
    setForm({
      leadId: "",
      title: "",
      date: new Date().toISOString().slice(0, 10),
      time: "09:00",
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Agenda comercial"
        title="Agendamentos"
        description="Compromissos vinculados aos leads do CRM para organizar reunioes, follow-ups e apresentacoes."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Novo agendamento
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold capitalize text-white">{formatMonthLabel(activeMonth)}</h3>
              <p className="text-sm text-zinc-400">Clique em um dia para abrir ou agendar compromissos.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => changeMonth("prev")}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={() => changeMonth("next")}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className="px-2 py-3 text-center text-[11px] uppercase tracking-[0.24em] text-zinc-500"
              >
                {label}
              </div>
            ))}

            {monthDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="min-h-[110px] rounded-[20px] border border-transparent" />;
              }

              const dayItems = visibleItems.filter((item) => item.date === day.key);
              const isSelected = selectedDate === day.key;
              const isToday = day.key === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDate(day.key)}
                  onDoubleClick={() => openCreateForDate(day.key)}
                  className={`min-h-[110px] rounded-[22px] border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_24px_rgba(52,211,153,0.08)]"
                      : "border-white/10 bg-white/5 hover:border-white/15 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${isToday ? "text-emerald-200" : "text-white"}`}>
                      {day.dayNumber}
                    </span>
                    {dayItems.length ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-200">
                        {dayItems.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-1">
                    {dayItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="truncate rounded-xl bg-black/20 px-2 py-1 text-[11px] text-zinc-300">
                        {item.time} · {item.leadName}
                      </div>
                    ))}
                    {dayItems.length > 2 ? (
                      <p className="text-[11px] text-zinc-500">+{dayItems.length - 2} compromissos</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Agenda do dia</h3>
              <p className="text-sm text-zinc-400">{formatDate(selectedDate)}</p>
            </div>
            <Button onClick={() => openCreateForDate(selectedDate)}>
              <Plus className="mr-2 size-4" />
              Agendar
            </Button>
          </div>

          <div className="space-y-3">
            {selectedDayItems.length ? (
              selectedDayItems.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-zinc-400">
                        {item.leadName} · {item.company}
                      </p>
                    </div>
                    <Badge tone="emerald">{item.owner}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4 text-emerald-300" />
                      {item.time}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Link2 className="size-4" />
                      Lead vinculado: {item.leadName}
                    </div>
                    {item.notes ? <p className="text-sm text-zinc-500">{item.notes}</p> : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-500">
                Nenhum compromisso para este dia. Clique em <span className="text-zinc-300">Agendar</span> ou dê duplo clique em um dia do calendário.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 outline-none">
            <Card className="border-emerald-400/20">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-white">Novo agendamento</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-zinc-400">
                    Vincule o compromisso a um lead do CRM para aparecer no dashboard e na agenda.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:text-white">
                    <X className="size-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-300">Lead vinculado</span>
                  <select
                    value={form.leadId}
                    onChange={(event) => setForm((current) => ({ ...current, leadId: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="">Selecione um lead</option>
                    {visibleLeads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} · {lead.company}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-300">Titulo do compromisso</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-300">Data</span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-zinc-300">Horario</span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-zinc-300">Notas</span>
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
                <Button onClick={createScheduleItem}>Salvar agendamento</Button>
              </div>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
