import { apiClient } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  role: "ADMIN" | "EMPLOYEE";
  isManager: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export function login(request: LoginRequest): Promise<AuthUser> {
  return apiClient.post<AuthUser>("/api/auth/login", request);
}

export function logout(): Promise<void> {
  return apiClient.post<void>("/api/auth/logout");
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/api/auth/me");
}
