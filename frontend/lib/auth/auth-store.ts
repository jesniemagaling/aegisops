import type { AuthUser } from "@/types";

const TOKEN_KEY = "aegisops_token";
const USER_KEY = "aegisops_user";
const TOKEN_COOKIE = "aegisops_token";

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;SameSite=Strict`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

let cachedToken: string | null = null;
let cachedUser: AuthUser | null = null;

export const authStore = {
  getToken(): string | null {
    if (cachedToken) return cachedToken;
    cachedToken = getStoredToken();
    return cachedToken;
  },

  getUser(): AuthUser | null {
    if (cachedUser) return cachedUser;
    cachedUser = getStoredUser();
    return cachedUser;
  },

  setAuth(token: string, user: AuthUser): void {
    cachedToken = token;
    cachedUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setCookie(TOKEN_COOKIE, token);
    }
  },

  clearAuth(): void {
    cachedToken = null;
    cachedUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      deleteCookie(TOKEN_COOKIE);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
