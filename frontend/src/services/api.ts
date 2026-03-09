import { clearCurrentUser, getAuthToken } from "@/services/access-control";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

type ListResponse<T> = {
  data: T[];
  meta: {
    count: number;
    limit: number;
    offset: number;
  };
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${API_BASE}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function handleUnauthorized() {
  clearCurrentUser();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function fetcher<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(buildUrl(path, params), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }

    throw new Error(`Erro ao buscar ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function listResource<T>(
  resource: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ListResponse<T>> {
  return fetcher<ListResponse<T>>(`/${resource}`, params);
}

export async function getResource<T>(
  resource: string,
  id: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  return fetcher<T>(`/${resource}/${id}`, params);
}

async function sendJson<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }

    const message = await response.text();
    throw new Error(message || `Erro na requisição ${method} ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function createResource<T>(resource: string, payload: unknown) {
  return sendJson<T>(`/${resource}`, "POST", payload);
}

export async function updateResource<T>(resource: string, id: string, payload: unknown) {
  return sendJson<T>(`/${resource}/${id}`, "PATCH", payload);
}

export async function deleteResource<T = { success: boolean }>(resource: string, id: string) {
  return sendJson<T>(`/${resource}/${id}`, "DELETE");
}
