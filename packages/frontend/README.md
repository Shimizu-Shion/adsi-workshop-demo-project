# Frontend — Next.js

勤怠管理 SPA。

## 技術スタック

- Next.js 16 (App Router / Turbopack)
- TypeScript
- Tailwind CSS
- shadcn/ui (Base UI)
- TanStack Query（サーバーステート管理）
- Biome（lint / format）

## 起動

```bash
npm install
npm run dev
```

<http://localhost:3000> で起動。Backend (`:8080`) へは `next.config.ts` の rewrites でプロキシ。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run lint` | lint |

## ページ構成

| パス | 認証 | 説明 |
| --- | --- | --- |
| `/login` | 不要 | ログイン画面 |
| `/dashboard` | 必要 | ダッシュボード |
| `/attendance` | 必要 | 出勤・退勤打刻 |
| `/history` | 必要 | 勤怠履歴 |
| `/team` | 必要 | チーム勤怠状況 |
| `/admin/employees` | ADMIN | 社員管理 |
| `/admin/departments` | ADMIN | 部署管理 |

## ディレクトリ構成

フィーチャーベースで整理。

```text
src/
├── app/
│   ├── login/                # ログインページ
│   ├── (authenticated)/      # 認証ガード付きレイアウト
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── history/
│   │   ├── team/
│   │   └── admin/
│   │       ├── employees/
│   │       └── departments/
│   └── page.tsx              # / → /dashboard リダイレクト
├── components/
│   ├── layout/               # Header, Sidebar, AppLayout
│   └── ui/                   # shadcn/ui コンポーネント
├── features/
│   ├── auth/                 # LoginForm, useAuth, auth-api
│   ├── attendance/           # ClockButtons, useAttendance, attendance-api
│   ├── employee/             # EmployeeTable, useEmployees, employee-api
│   └── department/           # DepartmentTable, useDepartments, department-api
└── lib/
    └── api-client.ts         # fetch ラッパー（CSRF 対応）
```

## 認証フロー

1. `/login` でメール + パスワードを POST → Backend がセッション Cookie を発行
2. `(authenticated)/layout.tsx` が `/api/auth/me` でセッション確認
3. 未認証なら `/login` にリダイレクト
4. 変更系リクエストは `X-XSRF-TOKEN` ヘッダーを自動付与
