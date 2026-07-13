import { fireEvent, render, screen } from "@testing-library/react";
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

const mockClockInMutate = vi.fn();
const mockClockOutMutate = vi.fn();

function setupMocks(status: "NOT_CLOCKED_IN" | "CLOCKED_IN" | "CLOCKED_OUT") {
  (useTodayStatus as ReturnType<typeof vi.fn>).mockReturnValue({
    data: { status, records: [] },
    isLoading: false,
  });
  (useClockIn as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mockClockInMutate,
    isPending: false,
  });
  (useClockOut as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mockClockOutMutate,
    isPending: false,
  });
}

describe("ClockButtons - メモ入力", () => {
  describe("出勤メモ欄", () => {
    it("未出勤時に出勤メモのtextareaが表示される", () => {
      setupMocks("NOT_CLOCKED_IN");
      render(<ClockButtons />);

      const memoInput = screen.getByPlaceholderText(/勤務形態や予定をメモ/);
      expect(memoInput).toBeInTheDocument();
      expect(memoInput.tagName.toLowerCase()).toBe("textarea");
    });

    it("出勤ボタンを押すとメモが送信される", () => {
      setupMocks("NOT_CLOCKED_IN");
      render(<ClockButtons />);

      const memoInput = screen.getByPlaceholderText(/勤務形態や予定をメモ/);
      fireEvent.change(memoInput, { target: { value: "在宅勤務" } });

      const clockInButton = screen.getByRole("button", { name: /出勤/ });
      fireEvent.click(clockInButton);

      expect(mockClockInMutate).toHaveBeenCalledWith("在宅勤務", expect.anything());
    });

    it("メモ未入力でも出勤打刻できる", () => {
      setupMocks("NOT_CLOCKED_IN");
      render(<ClockButtons />);

      const clockInButton = screen.getByRole("button", { name: /出勤/ });
      fireEvent.click(clockInButton);

      expect(mockClockInMutate).toHaveBeenCalled();
    });

    it("勤務中は出勤メモ欄が非表示", () => {
      setupMocks("CLOCKED_IN");
      render(<ClockButtons />);

      const memoInputs = screen.queryAllByPlaceholderText(/勤務形態や予定をメモ/);
      const clockInMemo = memoInputs.find((el) => el.getAttribute("data-memo-type") === "clock-in");
      expect(clockInMemo).toBeUndefined();
    });
  });

  describe("退勤メモ欄", () => {
    it("勤務中に退勤メモのtextareaが表示される", () => {
      setupMocks("CLOCKED_IN");
      render(<ClockButtons />);

      const memoInput = screen.getByPlaceholderText(/退勤メモ/);
      expect(memoInput).toBeInTheDocument();
      expect(memoInput.tagName.toLowerCase()).toBe("textarea");
    });

    it("退勤ボタンを押すとメモが送信される", () => {
      setupMocks("CLOCKED_IN");
      render(<ClockButtons />);

      const memoInput = screen.getByPlaceholderText(/退勤メモ/);
      fireEvent.change(memoInput, { target: { value: "明日は客先直行" } });

      const clockOutButton = screen.getByRole("button", { name: /退勤/ });
      fireEvent.click(clockOutButton);

      expect(mockClockOutMutate).toHaveBeenCalledWith("明日は客先直行", expect.anything());
    });
  });

  describe("退勤後の再出勤", () => {
    it("退勤済みでも出勤ボタンが有効になる", () => {
      setupMocks("CLOCKED_OUT");
      render(<ClockButtons />);

      const clockInButton = screen.getByRole("button", { name: /出勤/ });
      expect(clockInButton).toBeEnabled();
    });

    it("退勤済みで出勤メモ欄が表示される", () => {
      setupMocks("CLOCKED_OUT");
      render(<ClockButtons />);

      const memoInput = screen.getByPlaceholderText(/勤務形態や予定をメモ/);
      expect(memoInput).toBeInTheDocument();
    });
  });
});
