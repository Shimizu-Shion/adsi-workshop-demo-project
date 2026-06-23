import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";

export interface EmployeeResponse {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  role: "ADMIN" | "EMPLOYEE";
  isManager: boolean;
  hireDate: string;
  retireDate: string | null;
}

export interface EmployeeCreateRequest {
  name: string;
  email: string;
  password: string;
  departmentId: string;
  role: "ADMIN" | "EMPLOYEE";
  hireDate: string;
}

export interface EmployeeUpdateRequest {
  name: string;
  email: string;
  departmentId: string;
  role: "ADMIN" | "EMPLOYEE";
  hireDate: string;
}

export interface RetireRequest {
  retireDate: string;
}

export interface ManagerRequest {
  isManager: boolean;
}

export interface DepartmentSummary {
  id: string;
  name: string;
}

export interface EmployeeSearchParams {
  page?: number;
  size?: number;
  departmentId?: string;
  role?: string;
  includeRetired?: boolean;
}

function buildEmployeeQuery(params: EmployeeSearchParams): string {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  if (params.departmentId) {
    query.set("departmentId", params.departmentId);
  }
  if (params.role) {
    query.set("role", params.role);
  }
  query.set("includeRetired", String(params.includeRetired ?? false));
  return query.toString();
}

export function fetchEmployees(
  params: EmployeeSearchParams,
): Promise<PaginatedResponse<EmployeeResponse>> {
  return apiClient.get<PaginatedResponse<EmployeeResponse>>(
    `/api/employees?${buildEmployeeQuery(params)}`,
  );
}

export function createEmployee(request: EmployeeCreateRequest): Promise<EmployeeResponse> {
  return apiClient.post<EmployeeResponse>("/api/employees", request);
}

export function updateEmployee(
  id: string,
  request: EmployeeUpdateRequest,
): Promise<EmployeeResponse> {
  return apiClient.put<EmployeeResponse>(`/api/employees/${id}`, request);
}

export function retireEmployee(id: string, request: RetireRequest): Promise<EmployeeResponse> {
  return apiClient.patch<EmployeeResponse>(`/api/employees/${id}/retire`, request);
}

export function setManager(id: string, request: ManagerRequest): Promise<EmployeeResponse> {
  return apiClient.patch<EmployeeResponse>(`/api/employees/${id}/manager`, request);
}

export function fetchDepartmentList(): Promise<DepartmentSummary[]> {
  return apiClient.get<DepartmentSummary[]>("/api/departments");
}
