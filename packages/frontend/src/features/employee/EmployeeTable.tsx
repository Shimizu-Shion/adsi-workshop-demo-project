"use client";

import { Pencil, Shield, UserMinus } from "lucide-react";
import { type Column, DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import type { EmployeeResponse } from "./employee-api";

type EmployeeRow = EmployeeResponse & Record<string, unknown>;

const ROLE_CONFIG = {
  ADMIN: { label: "管理者", variant: "default" as const },
  EMPLOYEE: { label: "一般", variant: "secondary" as const },
};

const MANAGER_CONFIG = {
  true: { label: "上長", variant: "default" as const },
  false: { label: "-", variant: "outline" as const },
};

interface EmployeeTableProps {
  data: EmployeeResponse[];
  onEdit: (employee: EmployeeResponse) => void;
  onRetire: (employee: EmployeeResponse) => void;
  onToggleManager: (employee: EmployeeResponse) => void;
}

export function EmployeeTable({ data, onEdit, onRetire, onToggleManager }: EmployeeTableProps) {
  const columns: Column<EmployeeRow>[] = [
    { key: "name", header: "名前" },
    { key: "email", header: "メール" },
    { key: "departmentName", header: "部署" },
    {
      key: "role",
      header: "ロール",
      render: (employee) => <StatusBadge status={employee.role} configMap={ROLE_CONFIG} />,
    },
    {
      key: "isManager",
      header: "上長",
      render: (employee) => (
        <StatusBadge status={String(employee.isManager)} configMap={MANAGER_CONFIG} />
      ),
    },
    { key: "hireDate", header: "入社日" },
    {
      key: "actions",
      header: "操作",
      render: (employee) => {
        const isRetired = employee.retireDate !== null;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(employee)}
              disabled={isRetired}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRetire(employee)}
              disabled={isRetired}
            >
              <UserMinus />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onToggleManager(employee)}
              disabled={isRetired}
            >
              <Shield />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<EmployeeRow>
      columns={columns}
      data={data as EmployeeRow[]}
      rowKey={(item) => item.id}
      emptyMessage="社員が見つかりません"
    />
  );
}
