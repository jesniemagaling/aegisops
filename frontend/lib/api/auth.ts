import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { AuthUser, LoginRequest, LoginResponse } from "@/types";

export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe(): Promise<AuthUser> {
  return apiClient<AuthUser>(API_ENDPOINTS.AUTH_ME);
}

export function logout(): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.AUTH_LOGOUT, {
    method: "POST",
  });
}
