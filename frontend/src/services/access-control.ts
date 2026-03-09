export type AppUserRole =
  | "Super Admin"
  | "Admin"
  | "Operacional"
  | "Financeiro"
  | "Comercial";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  ownerName: string;
};

const STORAGE_KEY = "responsyva-current-user";
const AUTH_STORAGE_KEY = "responsyva-authenticated";
const AUTH_TOKEN_KEY = "responsyva-auth-token";

const defaultCurrentUser: CurrentUser = {
  id: "",
  name: "",
  email: "",
  role: "Operacional",
  ownerName: "",
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export function getOwnerNameFromFullName(name: string) {
  return name.trim().split(/\s+/)[0] || "Sem responsavel";
}

export function loadCurrentUser(): CurrentUser {
  if (typeof window === "undefined") {
    return defaultCurrentUser;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultCurrentUser;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CurrentUser>;

    return {
      ...defaultCurrentUser,
      ...parsed,
      ownerName: parsed.ownerName || getOwnerNameFromFullName(parsed.name || defaultCurrentUser.name),
    };
  } catch {
    return defaultCurrentUser;
  }
}

export function saveCurrentUser(user: CurrentUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
}

export function saveAuthSession(user: CurrentUser, token: string) {
  if (typeof window === "undefined") {
    return;
  }

  saveCurrentUser(user);
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true" && !!getAuthToken();
}

export function clearCurrentUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isCommercialUser(user: CurrentUser) {
  return user.role === "Comercial";
}

export function canAccessFinance(user: CurrentUser) {
  return !isCommercialUser(user);
}

export function canAccessSettings(user: CurrentUser) {
  return !isCommercialUser(user);
}

export function canViewOwnedRecord(user: CurrentUser, owner: string) {
  if (!isCommercialUser(user)) {
    return true;
  }

  return normalizeValue(owner) === normalizeValue(user.ownerName);
}
