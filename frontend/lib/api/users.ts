import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { CreateUserRequest, PaginatedData, User } from "@/types";

export function getUsers(page = 1, size = 10): Promise<PaginatedData<User>> {
  return apiClient<PaginatedData<User>>(
    `${API_ENDPOINTS.USERS}?page=${page}&size=${size}`,
  );
}

export function createUser(data: CreateUserRequest): Promise<User> {
  return apiClient<User>(API_ENDPOINTS.USERS, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
