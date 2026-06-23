# Attendance Demo

勤怠管理デモアプリ。モノレポ構成。

## 技術スタック

| パッケージ | 技術 | バージョン |
| --- | --- | --- |
| `packages/backend` | Spring Boot (Java) | 3.5.0 / Java 21 |
| `packages/frontend` | Next.js (TypeScript) | 16.x |
| `packages/infra` | AWS CDK (TypeScript) | - |
| DB | PostgreSQL | 17 |

## 前提条件

- Java 21
- Node.js 20+
- Podman（または Docker）

## セットアップ

```bash
# 依存インストール
npm install
cd packages/frontend && npm install

# DB 起動
npm run db:up

# バックエンド起動（別ターミナル）
npm run boot

# フロントエンド起動（別ターミナル）
npm run dev
```

- Backend: <http://localhost:8080>
- Frontend: <http://localhost:3000>

## 主要コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run boot` | Backend 起動 |
| `npm run dev` | Frontend dev server 起動 |
| `npm run db:up` / `db:down` | PostgreSQL 起動 / 停止 |
| `npm run check:backend` | Backend の checkstyle + spotbugs + test |
| `npm run build:frontend` | Frontend ビルド |
| `npm run lint:frontend` | Frontend lint |
| `npm run test:backend` | Backend テスト |

## ディレクトリ構成

```text
.
├── packages/
│   ├── backend/          # Spring Boot API
│   ├── frontend/         # Next.js SPA
│   └── infra/            # AWS CDK
├── docs/
│   ├── path/             # 開発過程の記録
│   ├── requirements/     # 要件定義
│   ├── design/           # 設計ドキュメント
│   └── units/            # Unit of Work 定義
└── package.json          # モノレポスクリプト
```

## 開発ガイド

詳細は各パッケージの README を参照。

- [Backend README](packages/backend/README.md)
- [Frontend README](packages/frontend/README.md)
