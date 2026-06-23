# Backend — Spring Boot

勤怠管理 API サーバー。

## 技術スタック

- Java 21 / Spring Boot 3.5.0
- Spring Security（セッション認証 + CSRF）
- Spring Data JPA / PostgreSQL 17
- Flyway（マイグレーション）
- Lombok / JSpecify

## 起動

```bash
# DB 起動（プロジェクトルートから）
npm run db:up

# アプリ起動
./gradlew bootRun
```

<http://localhost:8080> で起動。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `./gradlew bootRun` | アプリ起動 |
| `./gradlew check` | checkstyle + spotbugs + test + jacoco |
| `./gradlew test` | テストのみ |
| `./gradlew bootJar` | JAR ビルド |

## API エンドポイント

### 認証

| Method | Path | 認証 | 説明 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | 不要 | ログイン |
| POST | `/api/auth/logout` | 必要 | ログアウト |
| GET | `/api/auth/me` | 必要 | ログインユーザー情報 |

### 勤怠

| Method | Path | 認証 | 説明 |
| --- | --- | --- | --- |
| POST | `/api/attendance/clock-in` | 必要 | 出勤打刻 |
| POST | `/api/attendance/clock-out` | 必要 | 退勤打刻 |
| GET | `/api/attendance/today` | 必要 | 当日ステータス |
| GET | `/api/attendance/history` | 必要 | 勤怠履歴 |

### 社員（ADMIN のみ）

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/api/employees` | 一覧（ページネーション + フィルタ） |
| GET | `/api/employees/{id}` | 詳細 |
| POST | `/api/employees` | 作成 |
| PUT | `/api/employees/{id}` | 更新 |
| PATCH | `/api/employees/{id}/retire` | 退職処理 |
| PATCH | `/api/employees/{id}/manager` | 管理者設定 |

### 部署

| Method | Path | 認証 | 説明 |
| --- | --- | --- | --- |
| GET | `/api/departments` | 必要 | 一覧 |
| POST | `/api/departments` | ADMIN | 作成 |
| PUT | `/api/departments/{id}` | ADMIN | 更新 |

## アーキテクチャ

ドメイン分割レイヤード。各ドメインに controller / service / repository / entity / dto を配置。

```text
src/main/java/com/example/attendance/
├── attendance/       # 勤怠ドメイン
├── auth/             # 認証ドメイン
├── department/       # 部署ドメイン
├── employee/         # 社員ドメイン
└── common/
    ├── config/       # SecurityConfig, CorsConfig, ClockConfig
    ├── config/security/  # UserDetails, Filter, Handler
    └── exception/    # 共通例外ハンドリング
```

## DB マイグレーション

Flyway で管理。`src/main/resources/db/migration/` に配置。

| ファイル | 内容 |
| --- | --- |
| `V1__create_departments.sql` | 部署テーブル |
| `V2__create_employees.sql` | 社員テーブル |
| `V3__create_attendance_records.sql` | 勤怠記録テーブル |

シードデータ: `db/seed/V1000__seed_data.sql`

## 品質チェック

- **Checkstyle**: `config/checkstyle/checkstyle.xml`（テストは命名規則・行数制限を緩和）
- **SpotBugs**: `config/spotbugs/spotbugs-exclude.xml`
- **JaCoCo**: カバレッジ 80% 以上
- **ArchUnit**: レイヤー依存テスト
