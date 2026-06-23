"use client";

import { useState } from "react";
import { DepartmentFormDialog } from "@/features/department/DepartmentFormDialog";
import { DepartmentTable } from "@/features/department/DepartmentTable";
import type { DepartmentResponse } from "@/features/department/department-api";
import {
  useCreateDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/features/department/useDepartments";

type DialogState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; department: DepartmentResponse };

export default function DepartmentsPage() {
  const { data: departments = [], isLoading } = useDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const [dialogState, setDialogState] = useState<DialogState>({ open: false });

  const handleCreateNew = () => {
    setDialogState({ open: true, mode: "create" });
  };

  const handleEdit = (department: DepartmentResponse) => {
    setDialogState({ open: true, mode: "edit", department });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDialogState({ open: false });
    }
  };

  const handleSubmit = (name: string) => {
    if (dialogState.open && dialogState.mode === "create") {
      createMutation.mutate({ name }, { onSuccess: () => setDialogState({ open: false }) });
    } else if (dialogState.open && dialogState.mode === "edit") {
      updateMutation.mutate(
        { id: dialogState.department.id, req: { name } },
        { onSuccess: () => setDialogState({ open: false }) },
      );
    }
  };

  if (isLoading) {
    return <div className="p-6">読み込み中...</div>;
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6">
      <DepartmentTable
        departments={departments}
        onEdit={handleEdit}
        onCreateNew={handleCreateNew}
      />
      <DepartmentFormDialog
        open={dialogState.open}
        onOpenChange={handleOpenChange}
        mode={dialogState.open ? dialogState.mode : "create"}
        department={
          dialogState.open && dialogState.mode === "edit" ? dialogState.department : undefined
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
