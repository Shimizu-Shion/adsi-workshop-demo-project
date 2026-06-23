"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlySummaryResponse } from "./attendance-api";
import { formatMinutes } from "./format";

interface SummaryCardProps {
  label: string;
  value: string;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

interface MonthlySummaryProps {
  summary: MonthlySummaryResponse | undefined;
  isLoading: boolean;
}

export function MonthlySummary({ summary, isLoading }: MonthlySummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {["s1", "s2", "s3", "s4"].map((id) => (
          <div key={id} className="rounded-lg border p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard label="出勤日数" value={`${summary.workDays}日`} />
      <SummaryCard label="総勤務時間" value={formatMinutes(summary.totalWorkMinutes)} />
      <SummaryCard label="総残業時間" value={formatMinutes(summary.totalOvertimeMinutes)} />
      <SummaryCard label="欠勤日数" value={`${summary.absentDays}日`} />
    </div>
  );
}
