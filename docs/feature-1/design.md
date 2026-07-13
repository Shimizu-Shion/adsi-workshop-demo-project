# 打刻メモ入力 — 設計

Issue: #4

---

## 1. データ設計

### DB マイグレーション（V5）

```sql
ALTER TABLE attendance_records
    ADD COLUMN clock_in_memo VARCHAR(200),
    ADD COLUMN clock_out_memo VARCHAR(200);
```

- NULL 許容（任意入力のため）
- 検索インデックスは初回リリースでは不要（将来対応）

### Entity 変更

`AttendanceRecord` に追加:

```java
@Column(name = "clock_in_memo", length = 200)
private String clockInMemo;

@Column(name = "clock_out_memo", length = 200)
private String clockOutMemo;
```

---

## 2. API 設計

### 打刻 API（既存エンドポイント改修）

#### POST /api/attendance/clock-in

Before: `?employeeId=...`（query param のみ）
After: Request Body に変更

```json
// Request
{
  "employeeId": "uuid",
  "memo": "在宅勤務"        // nullable, max 200
}

// Response (既存 + memo 追加)
{
  "id": "uuid",
  "workDate": "2026-07-13",
  "clockIn": "2026-07-13T00:00:00Z",
  "clockOut": null,
  "clockInMemo": "在宅勤務",
  "clockOutMemo": null,
  "corrected": false
}
```

#### POST /api/attendance/clock-out

```json
// Request
{
  "employeeId": "uuid",
  "memo": "明日は客先直行"   // nullable, max 200
}
```

### メモ編集 API（新規）

#### PATCH /api/attendance/{id}/memo

```json
// Request
{
  "clockInMemo": "在宅勤務（変更）",   // nullable
  "clockOutMemo": null                // null = 変更なし ではなく、明示的に消す場合も null
}

// Response: 更新後の AttendanceRecordResponse
```

- 本人の打刻レコードのみ編集可能（他人のレコードは 403）
- バリデーション: 各フィールド max 200 文字

---

## 3. Backend 設計

### 新規ファイル

| ファイル | 役割 |
|---------|------|
| `V5__add_memo_columns.sql` | マイグレーション |
| `ClockInRequest.java` | 出勤リクエスト DTO (record) |
| `ClockOutRequest.java` | 退勤リクエスト DTO (record) |
| `UpdateMemoRequest.java` | メモ編集リクエスト DTO (record) |

### 変更ファイル

| ファイル | 変更内容 |
|---------|----------|
| `AttendanceRecord.java` | `clockInMemo`, `clockOutMemo` フィールド追加 |
| `AttendanceRecordResponse.java` | `clockInMemo`, `clockOutMemo` フィールド追加 + `from()` マッパー更新 |
| `AttendanceService.java` | `clockIn(ClockInRequest)`, `clockOut(ClockOutRequest)`, `updateMemo(UUID, UpdateMemoRequest)` |
| `AttendanceServiceImpl.java` | 各メソッド実装変更 |
| `AttendanceController.java` | `@RequestBody` 受け取り + PATCH エンドポイント追加 |

### Request DTO

```java
public record ClockInRequest(
    @NotNull UUID employeeId,
    @Size(max = 200) String memo
) {}

public record ClockOutRequest(
    @NotNull UUID employeeId,
    @Size(max = 200) String memo
) {}

public record UpdateMemoRequest(
    @Size(max = 200) String clockInMemo,
    @Size(max = 200) String clockOutMemo
) {}
```

### Service ロジック変更

```java
// clockIn: memo をエンティティにセット
var record = AttendanceRecord.builder()
    .employee(employee)
    .workDate(today)
    .clockIn(Instant.now(clock))
    .clockInMemo(request.memo())  // 追加
    .build();

// clockOut: memo をエンティティにセット
record.setClockOut(Instant.now(clock));
record.setClockOutMemo(request.memo());  // 追加

// updateMemo: 本人チェック + メモ更新
public AttendanceRecordResponse updateMemo(UUID recordId, UpdateMemoRequest request, UUID currentUserId) {
    var record = repository.findById(recordId)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
    if (!record.getEmployee().getId().equals(currentUserId)) {
        throw new ResponseStatusException(FORBIDDEN);
    }
    record.setClockInMemo(request.clockInMemo());
    record.setClockOutMemo(request.clockOutMemo());
    return AttendanceRecordResponse.from(repository.save(record));
}
```

---

## 4. Frontend 設計

### 退勤後再出勤（1行変更）

```typescript
// ClockButtons.tsx
const canClockIn = status === "NOT_CLOCKED_IN" || status === "CLOCKED_OUT";
```

### 打刻メモ入力 UI

`ClockButtons.tsx` に textarea を 2 つ追加:

```
┌─────────────────────────────┐
│  現在時刻: 09:00:00         │
│                             │
│  [出勤メモ (textarea)]      │  ← 出勤可能時のみ表示
│  [ 出勤 ]                   │
│                             │
│  [退勤メモ (textarea)]      │  ← 出勤中のみ表示
│  [ 退勤 ]                   │
└─────────────────────────────┘
```

- 出勤メモ欄: `canClockIn` のとき表示
- 退勤メモ欄: `status === "CLOCKED_IN"` のとき表示
- placeholder: 「勤務形態や予定をメモ（任意）」

### メモ表示 + インライン編集（TodayRecords.tsx）

```
┌─────────────────────────────────────────────────────┐
│ 09:00 出勤   出勤メモ: 在宅勤務      ← ダブルクリックで編集
│ 18:00 退勤   退勤メモ: 明日は客先     ← ダブルクリックで編集
└─────────────────────────────────────────────────────┘
```

- ダブルクリック → textarea に切替（既存テキストが入った状態）
- Enter or 欄外クリック → 保存（PATCH API 呼び出し）
- Esc → キャンセル（元に戻る）

### 月次履歴テーブル（AttendanceTable.tsx）

columns に追加:

| 列名 | 内容 |
|------|------|
| 出勤メモ | `record.clockInMemo` （同日複数の場合は改行区切り） |
| 退勤メモ | `record.clockOutMemo` |

### API クライアント変更

```typescript
// attendance-api.ts
export interface AttendanceRecordResponse {
  id: string;
  workDate: string;
  clockIn: string;
  clockOut: string | null;
  clockInMemo: string | null;   // 追加
  clockOutMemo: string | null;  // 追加
  corrected: boolean;
}

export function clockIn(employeeId: string, memo?: string) {
  return apiClient.post<AttendanceRecordResponse>(
    "/api/attendance/clock-in",
    { employeeId, memo }
  );
}

export function clockOut(employeeId: string, memo?: string) {
  return apiClient.post<AttendanceRecordResponse>(
    "/api/attendance/clock-out",
    { employeeId, memo }
  );
}

export function updateMemo(recordId: string, clockInMemo: string | null, clockOutMemo: string | null) {
  return apiClient.patch<AttendanceRecordResponse>(
    `/api/attendance/${recordId}/memo`,
    { clockInMemo, clockOutMemo }
  );
}
```

### React Query hooks 変更

```typescript
// useAttendance.ts
export function useClockIn() {
  return useMutation({
    mutationFn: (memo?: string) => clockIn(user!.id, memo),
    ...
  });
}

export function useClockOut() {
  return useMutation({
    mutationFn: (memo?: string) => clockOut(user!.id, memo),
    ...
  });
}

export function useUpdateMemo() {
  return useMutation({
    mutationFn: (params: { recordId: string; clockInMemo: string | null; clockOutMemo: string | null }) =>
      updateMemo(params.recordId, params.clockInMemo, params.clockOutMemo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TODAY_STATUS_KEY }),
  });
}
```

---

## 5. 依存関係・実装順序

```
1. DB マイグレーション (V5)
2. Entity + DTO 変更
3. Service + Controller 変更（打刻メモ対応）
4. Service + Controller 追加（PATCH メモ編集）
5. Frontend: API クライアント + hooks
6. Frontend: ClockButtons（メモ入力 + 再出勤）
7. Frontend: TodayRecords（メモ表示 + インライン編集）
8. Frontend: AttendanceTable（月次履歴メモ列）
```

テストは各ステップで TDD（Red → Green → Refactor）で進める。
