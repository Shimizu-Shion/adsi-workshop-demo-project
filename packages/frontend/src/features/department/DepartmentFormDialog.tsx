"use client";

import { useEffect, useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DepartmentResponse } from "./department-api";

type DepartmentFormMode = "create" | "edit";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DepartmentFormMode;
  department?: DepartmentResponse;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  mode,
  department,
  onSubmit,
  isSubmitting,
}: DepartmentFormDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName(mode === "edit" && department ? department.name : "");
    }
  }, [open, mode, department]);

  const title = mode === "create" ? "部署の新規登録" : "部署の編集";

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      onSubmit={() => onSubmit(name)}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-2">
        <Label htmlFor="department-name">部署名</Label>
        <Input
          id="department-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 開発部"
          required
          autoFocus
        />
      </div>
    </FormDialog>
  );
}
