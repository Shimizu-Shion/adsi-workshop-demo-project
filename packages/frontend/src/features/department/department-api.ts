import { apiClient } from "@/lib/api-client";

export interface DepartmentResponse {
  id: string;
  name: string;
}

export interface DepartmentRequest {
  name: string;
}

export function fetchDepartments(): Promise<DepartmentResponse[]> {
  return apiClient.get<DepartmentResponse[]>("/api/departments");
}

export function createDepartment(req: DepartmentRequest): Promise<DepartmentResponse> {
  return apiClient.post<DepartmentResponse>("/api/departments", req);
}

export function updateDepartment(id: string, req: DepartmentRequest): Promise<DepartmentResponse> {
  return apiClient.put<DepartmentResponse>(`/api/departments/${id}`, req);
}
