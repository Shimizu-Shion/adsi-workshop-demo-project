"use client";

import { useEffect, useState } from "react";
import { FormDialog } from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmployeeResponse } from "./employee-api";

interface RetireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeResponse | null;
  onConfirm: (id: string, retireDate: string) => void;
  isLoading: boolean;
}

export function RetireDialog({
  open,
  onOpenChange,
  employee,
  onConfirm,
  isLoading,
}: RetireDialogProps) {
  const [retireDate, setRetireDate] = useState("");

  useEffect(() => {
    if (open) {
      setRetireDate(new Date().toISOString().split("T")[0]);
    }
  }, [open]);

  const handleSubmit = () => {
    if (employee && retireDate) {
      onConfirm(employee.id, retireDate);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="退職処理"
      description={employee ? `${employee.name} さんの退職処理を行います。` : undefined}
      onSubmit={handleSubmit}
      submitLabel="退職処理を実行"
      isSubmitting={isLoading}
    >
      <div className="space-y-2">
        <Label htmlFor="retire-date">退職日</Label>
        <Input
          id="retire-date"
          type="date"
          value={retireDate}
          onChange={(e) => setRetireDate(e.target.value)}
          required
        />
      </div>
    </FormDialog>
  );
}
