import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClockButtons } from "./ClockButtons";
import { useClockIn, useClockOut, useTodayStatus } from "./useAttendance";

vi.mock("./useAttendance", () => ({
  useTodayStatus: vi.fn(),
  useClockIn: vi.fn(),
  useClockOut: vi.fn(),
}));

vi.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user-id", name: "テスト太郎" } }),
}));

const mockMutate = vi.fn();

function setupMocks(status: "NOT_CLOCKED_IN" | "CLOCKED_IN" | "CLOCKED_OUT") {
  (useTodayStatus as ReturnType<typeof vi.fn>).mockReturnValue({
    data: { status, records: [] },
    isLoading: false,
  });
  (useClockIn as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });
  (useClockOut as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });
}

function renderAndGetButtons() {
  const { container } = render(<ClockButtons />);
  const buttons = within(container).getAllByRole("button");
  return {
    clockIn: buttons.find((b) => b.textContent?.includes("出勤"))!,
    clockOut: buttons.find((b) => b.textContent?.includes("退勤"))!,
  };
}

describe("ClockButtons", () => {
  describe("ボタン活性制御", () => {
    it("未出勤: 出勤ボタンが有効、退勤ボタンが無効", () => {
      setupMocks("NOT_CLOCKED_IN");
      const buttons = renderAndGetButtons();

      expect(buttons.clockIn).toBeEnabled();
      expect(buttons.clockOut).toBeDisabled();
    });

    it("勤務中: 出勤ボタンが無効、退勤ボタンが有効", () => {
      setupMocks("CLOCKED_IN");
      const buttons = renderAndGetButtons();

      expect(buttons.clockIn).toBeDisabled();
      expect(buttons.clockOut).toBeEnabled();
    });

    it("退勤済み: 出勤・退勤ともに無効", () => {
      setupMocks("CLOCKED_OUT");
      const buttons = renderAndGetButtons();

      expect(buttons.clockIn).toBeDisabled();
      expect(buttons.clockOut).toBeDisabled();
    });
  });
});
