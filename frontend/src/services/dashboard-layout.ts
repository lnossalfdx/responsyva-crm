import type { KPI } from "@/data/mock-data";

const STORAGE_KEY = "responsyva-dashboard-kpi-order";

type DashboardOrderMap = Record<string, string[]>;

function loadOrderMap(): DashboardOrderMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as DashboardOrderMap;
  } catch {
    return {};
  }
}

function saveOrderMap(map: DashboardOrderMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function loadKpiOrder(userId: string) {
  const map = loadOrderMap();
  return map[userId] ?? [];
}

export function saveKpiOrder(userId: string, labels: string[]) {
  const map = loadOrderMap();
  map[userId] = labels;
  saveOrderMap(map);
}

export function sortKpisBySavedOrder(kpis: KPI[], order: string[]) {
  if (!order.length) {
    return kpis;
  }

  const positionMap = new Map(order.map((label, index) => [label, index]));

  return [...kpis].sort((left, right) => {
    const leftIndex = positionMap.get(left.label);
    const rightIndex = positionMap.get(right.label);

    if (leftIndex === undefined && rightIndex === undefined) {
      return 0;
    }

    if (leftIndex === undefined) {
      return 1;
    }

    if (rightIndex === undefined) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}
