export type ScheduleItem = {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  owner: string;
  title: string;
  date: string;
  time: string;
  notes: string;
};

const STORAGE_KEY = "responsyva-schedules";

function buildSeedSchedules(): ScheduleItem[] {
  return [];
}

function isLegacySeedSchedule(item: ScheduleItem) {
  return /^schedule-\d+$/.test(item.id);
}

export function loadSchedules() {
  if (typeof window === "undefined") {
    return buildSeedSchedules();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seed = buildSeedSchedules();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as ScheduleItem[];

    if (parsed.some((item) => isLegacySeedSchedule(item))) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

export function saveSchedules(items: ScheduleItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
