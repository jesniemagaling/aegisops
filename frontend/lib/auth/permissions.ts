import { authStore } from "./auth-store";

export function hasRole(role: string): boolean {
  const user = authStore.getUser();
  if (!user) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(roles: string[]): boolean {
  const user = authStore.getUser();
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}
