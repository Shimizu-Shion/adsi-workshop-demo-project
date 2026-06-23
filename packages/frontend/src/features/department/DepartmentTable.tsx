"use client";

import { type Column, DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import type { DepartmentResponse } from "./department-api";

interface DepartmentTableProps {
  departments: DepartmentResponse[];
  onEdit: (department: DepartmentResponse) => void;
  onCreateNew: () => void;
}

const createColumns = (
  onEdit: (department: DepartmentResponse) => void,
): Column<DepartmentResponse & Record<string, unknown>>[] => [
  { key: "name", header: "部署名" },
  {
    key: "actions",
    header: "",
    render: (item) => (
      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
        編集
      </Button>
    ),
  },
];

export function DepartmentTable({ departments, onEdit, onCreateNew }: DepartmentTableProps) {
  const columns = createColumns(onEdit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">部署一覧</h2>
        <Button onClick={onCreateNew}>新規登録</Button>
      </div>
      <DataTable
        columns={columns}
        data={departments as (DepartmentResponse & Record<string, unknown>)[]}
        rowKey={(item) => item.id}
        emptyMessage="部署が登録されていません"
      />
    </div>
  );
}
