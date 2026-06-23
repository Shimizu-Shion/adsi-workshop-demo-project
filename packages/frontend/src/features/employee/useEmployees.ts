"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Toast";
import {
  createEmployee,
  type EmployeeCreateRequest,
  type EmployeeSearchParams,
  type EmployeeUpdateRequest,
  fetchDepartmentList,
  fetchEmployees,
  type ManagerRequest,
  type RetireRequest,
  retireEmployee,
  setManager,
  updateEmployee,
} from "./employee-api";

const EMPLOYEES_KEY = ["employees"] as const;
const DEPARTMENTS_KEY = ["departments"] as const;

export function useEmployees(params: EmployeeSearchParams) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, params],
    queryFn: () => fetchEmployees(params),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: [...DEPARTMENTS_KEY],
    queryFn: fetchDepartmentList,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EmployeeCreateRequest) => createEmployee(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success("社員を登録しました");
    },
    onError: () => {
      toast.error("社員の登録に失敗しました");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: EmployeeUpdateRequest }) =>
      updateEmployee(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success("社員情報を更新しました");
    },
    onError: () => {
      toast.error("社員情報の更新に失敗しました");
    },
  });
}

export function useRetireEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: RetireRequest }) =>
      retireEmployee(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      toast.success("退職処理が完了しました");
    },
    onError: () => {
      toast.error("退職処理に失敗しました");
    },
  });
}

export function useSetManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ManagerRequest }) =>
      setManager(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY });
      const action = variables.request.isManager ? "任命" : "解除";
      toast.success(`上長${action}が完了しました`);
    },
    onError: () => {
      toast.error("上長設定の変更に失敗しました");
    },
  });
}
