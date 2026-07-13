import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TodayRecords } from "./TodayRecords";
import { useTodayStatus, useUpdateMemo } from "./useAttendance";

vi.mock("./useAttendance", () => ({
  useTodayStatus: vi.fn(),
  useUpdateMemo: vi.fn(),
}));

const mockUpdateMemo = vi.fn();

function setupMocks(
  records: Array<{
    id: string;
    clockIn: string;
    clockOut: string | null;
    clockInMemo: string | null;
    clockOutMemo: string | null;
    corrected: boolean;
  }>,
) {
  (useTodayStatus as ReturnType<typeof vi.fn>).mockReturnValue({
    data: { status: "CLOCKED_IN", records },
    isLoading: false,
  });
  (useUpdateMemo as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mockUpdateMemo,
    isPending: false,
  });
}

describe("TodayRecords - メモ表示・編集", () => {
  describe("メモ表示", () => {
    it("出勤メモが表示される", () => {
      setupMocks([
        {
          id: "record-1",
          clockIn: "2025-01-15T00:00:00Z",
          clockOut: null,
          clockInMemo: "在宅勤務",
          clockOutMemo: null,
          corrected: false,
        },
      ]);
      render(<TodayRecords />);

      expect(screen.getByText("在宅勤務")).toBeInTheDocument();
    });

    it("退勤メモが表示される", () => {
      setupMocks([
        {
          id: "record-1",
          clockIn: "2025-01-15T00:00:00Z",
          clockOut: "2025-01-15T08:00:00Z",
          clockInMemo: null,
          clockOutMemo: "明日は客先直行",
          corrected: false,
        },
      ]);
      render(<TodayRecords />);

      expect(screen.getByText("明日は客先直行")).toBeInTheDocument();
    });

    it("メモがない場合は何も表示されない", () => {
      setupMocks([
        {
          id: "record-1",
          clockIn: "2025-01-15T00:00:00Z",
          clockOut: null,
          clockInMemo: null,
          clockOutMemo: null,
          corrected: false,
        },
      ]);
      render(<TodayRecords />);

      expect(screen.queryByText("在宅勤務")).not.toBeInTheDocument();
      expect(screen.queryByText("明日は客先直行")).not.toBeInTheDocument();
    });
  });

  describe("ダブルクリック編集", () => {
    it("メモをダブルクリックするとtextareaに切り替わる", () => {
      setupMocks([
        {
          id: "record-1",
          clockIn: "2025-01-15T00:00:00Z",
          clockOut: null,
          clockInMemo: "在宅勤務",
          clockOutMemo: null,
          corrected: false,
        },
      ]);
      render(<TodayRecords />);

      const memoText = screen.getByText("在宅勤務");
      fireEvent.doubleClick(memoText);

      const textarea = screen.getByDisplayValue("在宅勤務");
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe("textarea");
    });

    it("Escキーで編集がキャンセルされる", () => {
      setupMocks([
        {
          id: "record-1",
          clockIn: "2025-01-15T00:00:00Z",
          clockOut: null,
          clockInMemo: "在宅勤務",
          clockOutMemo: null,
          corrected: false,
        },
      ]);
      render(<TodayRecords />);

      const memoText = screen.getByText("在宅勤務");
      fireEvent.doubleClick(memoText);

      const textarea = screen.getByDisplayValue("在宅勤務");
      fireEvent.change(textarea, { target: { value: "変更中" } });
      fireEvent.keyDown(textarea, { key: "Escape" });

      expect(screen.getByText("在宅勤務")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("変更中")).not.toBeInTheDocument();
    });

    it("欄外クリックで保存される", () => {
      setupMocks([
        {
          id: "record-1",
          clockIn: "2025-01-15T00:00:00Z",
          clockOut: null,
          clockInMemo: "在宅勤務",
          clockOutMemo: null,
          corrected: false,
        },
      ]);
      render(<TodayRecords />);

      const memoText = screen.getByText("在宅勤務");
      fireEvent.doubleClick(memoText);

      const textarea = screen.getByDisplayValue("在宅勤務");
      fireEvent.change(textarea, { target: { value: "本社出勤" } });
      fireEvent.blur(textarea);

      expect(mockUpdateMemo).toHaveBeenCalledWith(
        {
          recordId: "record-1",
          clockInMemo: "本社出勤",
          clockOutMemo: null,
        },
        expect.anything(),
      );
    });
  });
});
