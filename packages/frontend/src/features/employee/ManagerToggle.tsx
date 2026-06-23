"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { EmployeeResponse } from "./employee-api";

interface ManagerToggleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeResponse | null;
  onConfirm: (id: string, isManager: boolean) => void;
  isLoading: boolean;
}

export function ManagerToggle({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isLoading,
}: ManagerToggleProps) {
  if (!employee) return null;

  const nextState = !employee.isManager;
  const action = nextState ? "上長に任命" : "上長を解除";

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action}の確認`}
      description={`${employee.name} さんを${action}しますか？`}
      onConfirm={() => onConfirm(employee.id, nextState)}
      confirmLabel={action}
      isLoading={isLoading}
    />
  );
}
