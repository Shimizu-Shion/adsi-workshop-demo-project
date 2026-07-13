"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "./format";
import { useTodayStatus, useUpdateMemo } from "./useAttendance";

function EditableMemo({ value, onSave }: { value: string; onSave: (newValue: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  if (isEditing) {
    return (
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        maxLength={200}
        rows={2}
        ref={(el) => el?.focus()}
        className="w-full rounded-md border px-2 py-1 text-sm resize-none"
      />
    );
  }

  return (
    <button
      type="button"
      className="text-sm text-muted-foreground cursor-pointer hover:bg-muted px-1 rounded text-left"
      onDoubleClick={handleDoubleClick}
    >
      {value}
    </button>
  );
}

export function TodayRecords() {
  const { data: todayStatus, isLoading } = useTodayStatus();
  const updateMemoMutation = useUpdateMemo();

  if (isLoading) {
    return (
      <div className="rounded-lg border p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const records = todayStatus?.records ?? [];

  if (records.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-sm font-medium mb-2">本日の打刻記録</h3>
        <p className="text-sm text-muted-foreground">打刻記録はありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-sm font-medium mb-3">本日の打刻記録</h3>
      <div className="space-y-2">
        {records.map((record) => (
          <div key={record.id} className="text-sm py-1.5 border-b last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">{formatTime(record.clockIn)}</span>
                <span className="text-muted-foreground">~</span>
                <span className="font-medium">
                  {record.clockOut ? formatTime(record.clockOut) : "--:--"}
                </span>
              </div>
              {record.corrected && <Badge variant="outline">修正済み</Badge>}
            </div>
            {record.clockInMemo && (
              <div className="mt-1 ml-1">
                <EditableMemo
                  value={record.clockInMemo}
                  onSave={(newValue) =>
                    updateMemoMutation.mutate(
                      {
                        recordId: record.id,
                        clockInMemo: newValue,
                        clockOutMemo: record.clockOutMemo,
                      },
                      {},
                    )
                  }
                />
              </div>
            )}
            {record.clockOutMemo && (
              <div className="mt-1 ml-1">
                <EditableMemo
                  value={record.clockOutMemo}
                  onSave={(newValue) =>
                    updateMemoMutation.mutate(
                      {
                        recordId: record.id,
                        clockInMemo: record.clockInMemo,
                        clockOutMemo: newValue,
                      },
                      {},
                    )
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
