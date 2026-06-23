import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Toast";
import {
  createDepartment,
  type DepartmentRequest,
  fetchDepartments,
  updateDepartment,
} from "./department-api";

const DEPARTMENTS_QUERY_KEY = ["departments"] as const;

export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: fetchDepartments,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: DepartmentRequest) => createDepartment(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      toast.success("部署を登録しました");
    },
    onError: () => {
      toast.error("部署の登録に失敗しました");
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: DepartmentRequest }) => updateDepartment(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      toast.success("部署を更新しました");
    },
    onError: () => {
      toast.error("部署の更新に失敗しました");
    },
  });
}
