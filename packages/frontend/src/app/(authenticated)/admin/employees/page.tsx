"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeFilters } from "@/features/employee/EmployeeFilters";
import { EmployeeFormDialog } from "@/features/employee/EmployeeFormDialog";
import { EmployeeTable } from "@/features/employee/EmployeeTable";
import type { EmployeeResponse } from "@/features/employee/employee-api";
import { ManagerToggle } from "@/features/employee/ManagerToggle";
import { RetireDialog } from "@/features/employee/RetireDialog";
import {
  useCreateEmployee,
  useDepartments,
  useEmployees,
  useRetireEmployee,
  useSetManager,
  useUpdateEmployee,
} from "@/features/employee/useEmployees";

export default function EmployeesPage() {
  const [page, setPage] = useState(0);
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [includeRetired, setIncludeRetired] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [retireOpen, setRetireOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const employeesQuery = useEmployees({
    page,
    size: 20,
    departmentId: departmentId || undefined,
    role: role || undefined,
    includeRetired,
  });
  const departmentsQuery = useDepartments();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const retireMutation = useRetireEmployee();
  const managerMutation = useSetManager();

  const handleOpenCreate = () => {
    setFormMode("create");
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (employee: EmployeeResponse) => {
    setFormMode("edit");
    setSelectedEmployee(employee);
    setFormOpen(true);
  };

  const handleOpenRetire = (employee: EmployeeResponse) => {
    setSelectedEmployee(employee);
    setRetireOpen(true);
  };

  const handleOpenManager = (employee: EmployeeResponse) => {
    setSelectedEmployee(employee);
    setManagerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">社員管理</h1>
        <Button onClick={handleOpenCreate}>
          <Plus />
          社員登録
        </Button>
      </div>

      <EmployeeFilters
        departmentId={departmentId}
        onDepartmentIdChange={(value) => {
          setDepartmentId(value);
          setPage(0);
        }}
        role={role}
        onRoleChange={(value) => {
          setRole(value);
          setPage(0);
        }}
        includeRetired={includeRetired}
        onIncludeRetiredChange={(value) => {
          setIncludeRetired(value);
          setPage(0);
        }}
        departments={departmentsQuery.data ?? []}
      />

      {employeesQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <EmployeeTable
            data={employeesQuery.data?.content ?? []}
            onEdit={handleOpenEdit}
            onRetire={handleOpenRetire}
            onToggleManager={handleOpenManager}
          />

          {employeesQuery.data && employeesQuery.data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
              >
                前へ
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {employeesQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= employeesQuery.data.totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
              >
                次へ
              </Button>
            </div>
          )}
        </>
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        employee={selectedEmployee}
        departments={departmentsQuery.data ?? []}
        onSubmitCreate={(request) => {
          createMutation.mutate(request, {
            onSuccess: () => setFormOpen(false),
          });
        }}
        onSubmitUpdate={(id, request) => {
          updateMutation.mutate({ id, request }, { onSuccess: () => setFormOpen(false) });
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <RetireDialog
        open={retireOpen}
        onOpenChange={setRetireOpen}
        employee={selectedEmployee}
        onConfirm={(id, retireDate) => {
          retireMutation.mutate(
            { id, request: { retireDate } },
            { onSuccess: () => setRetireOpen(false) },
          );
        }}
        isLoading={retireMutation.isPending}
      />

      <ManagerToggle
        open={managerOpen}
        onOpenChange={setManagerOpen}
        employee={selectedEmployee}
        onConfirm={(id, isManager) => {
          managerMutation.mutate(
            { id, request: { isManager } },
            { onSuccess: () => setManagerOpen(false) },
          );
        }}
        isLoading={managerMutation.isPending}
      />
    </div>
  );
}
