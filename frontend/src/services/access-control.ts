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

const defaultCurrentUser: CurrentUser = {
  id: "user-1",
  name: "Logan Nossal",
  email: "logan@responsyva.ai",
  role: "Super Admin",
  ownerName: "Logan",
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

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function clearCurrentUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
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

export function signInWithLocalProfile(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return defaultCurrentUser;
  }

  if (normalizedEmail === "bia@responsyva.ai") {
    return {
      id: "user-3",
      name: "Bia Teles",
      email: "bia@responsyva.ai",
      role: "Comercial",
      ownerName: "Bia",
    } satisfies CurrentUser;
  }

  if (normalizedEmail === "carol@responsyva.ai") {
    return {
      id: "user-2",
      name: "Carol Prado",
      email: "carol@responsyva.ai",
      role: "Admin",
      ownerName: "Carol",
    } satisfies CurrentUser;
  }

  return {
    id: "user-1",
    name: "Logan Nossal",
    email: normalizedEmail || "logan@responsyva.ai",
    role: "Super Admin",
    ownerName: "Logan",
  } satisfies CurrentUser;
}
