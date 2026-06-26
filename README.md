# FinTrack

*A personal finance dashboard with Plaid, AWS Cognito OIDC auth, and a fully serverless backend on AWS.*

> **Live Demo:** `https://d20zeyg4ora1rm.cloudfront.net/demo`
>
> **Demo Login:** `nathan.liviano@gmail.com`  ·  **Password:** `Nathan123`

---

## Overview

FinTrack is a production‑style, **serverless** personal finance app. It authenticates users with **AWS Cognito (OIDC Hosted UI)**, fetches live account balances via **Plaid** (Sandbox), stores user budgets in **DynamoDB**, and exposes an API through **API Gateway (HTTP API) + AWS Lambda**. The front end is a responsive **React (Vite) + Tailwind** single‑page app delivered by **S3/CloudFront**, with CI/CD via **GitHub Actions**.

For users who haven’t linked Plaid, the API automatically serves **demo data** (accounts, transactions, category summaries) and marks responses with the header `x-demo: true`. The UI reads that header to show a demo banner and a **Connect a Bank** button.

---

## Why this project matters

* **Real auth integration** – OIDC flow with Cognito Hosted UI; JWT is attached to every API call and validated by the API Gateway authorizer.
* **Serverless architecture** – API Gateway (HTTP API) + Lambda + DynamoDB + CloudFront. Small operational surface, fast deploys, least‑privilege IAM.
* **Plaid integration** – Create Link Token → exchange Public Token (stores the Plaid `access_token`) → `/plaid/summary` calls Plaid `/accounts/balance/get` and aggregates cached transactions for charts. Transaction syncing is a **separate** endpoint (see `POST /plaid/sync-transactions`).
* **Resilient UX** – Seamless **demo fallback** when Plaid isn’t linked, so evaluators can explore immediately.
* **Clean data model** – DynamoDB patterns per feature: budgets keyed on `userId/category`; transactions on `userId/transactionId`.
* **CI/CD** – GitHub Actions builds the SPA, deploys to S3, and invalidates CloudFront.
* **Security‑first** – Tight CORS, clear handling for 401/403/429, and signed transaction amounts throughout the stack.

---

## Feature summary

* **Auth**: Cognito Hosted UI; the SPA attaches `Authorization: Bearer <jwt>` to all API calls. The HTTP API validates the JWT with a built‑in **JWT authorizer** (`CognitoJWT`) against the Cognito user pool; Lambdas read the caller's id from `requestContext.authorizer.jwt.claims.sub`.
* **Accounts**: Live balances from Plaid; automatic demo balances when no bank is linked.
* **Transactions**: **Synced Plaid transactions** (90‑day window) stored in DynamoDB when linked; **synthetic demo transactions** with the same shape otherwise. Amounts are signed (`debit` negative, `credit` positive). Category totals power charts.
* **Budgets CRUD**: Create / update / delete monthly limits per category in DynamoDB. The UI shows progress bars with traffic‑light thresholds.
* **Dashboard**: Balance card, **Income vs. Expenses** line chart, **Top Categories** donut chart, and a transaction list.
* **Demo mode contract**: APIs return valid data plus `x-demo: true`. The SPA shows a banner and renders a **Connect a Bank** button.

---

## Architecture

```mermaid
flowchart LR
  A["React SPA (Vite + Tailwind)
CloudFront + S3"] -->|Bearer JWT| B["API Gateway (HTTP API) /prod
JWT authorizer: CognitoJWT"]

  subgraph Lambdas
    L1["GET /plaid/summary"]
    L2["GET /accounts"]
    L3["GET /budgets"]
    L4["PUT /budgets"]
    L5["DELETE /budgets/:category"]
    L6["POST /plaid/create-link-token"]
    L7["POST /plaid/exchange-token"]
    L8["PUT /change-password"]
    L9["PUT /profile"]
    L10["GET /plaid/balances (not wired into SPA)"]
    L11["POST /plaid/sync-transactions (manual)"]
  end

  B --> L1
  B --> L2
  B --> L3
  B --> L4
  B --> L5
  B --> L6
  B --> L7
  B --> L8
  B --> L9
  B --> L10
  B --> L11

  L1 -->|Query| DDB1["PlaidTokens (DynamoDB)"]
  L1 -->|Query| DDB2["PlaidTransactions (DynamoDB)"]
  L3 -->|Query| DDB3["UserBudgets (DynamoDB)"]
  L4 -->|Put| DDB3
  L5 -->|Delete| DDB3
  L7 -->|Put| DDB1
  L11 -->|BatchWrite| DDB2

  L1 -->|HTTPS| P["Plaid API (Sandbox)"]
  L2 -->|HTTPS| P
  L10 -->|HTTPS| P
  L11 -->|HTTPS| P

  C["Cognito Hosted UI
fintrackdemo1.auth.us-east-1.amazoncognito.com"] -->|OIDC| A
```

**Primary AWS resources**

* **CloudFront** – CDN for the SPA.
* **S3** – Static hosting bucket for the SPA build.
* **API Gateway (HTTP API / v2)** – `Fintrack-API`; `/prod` stage exposing all routes, fronted by the `CognitoJWT` JWT authorizer.
* **Lambda** – One function per endpoint. Source is exported in this repo under `fintrack/backend/<function-name>/`.
* **DynamoDB** –

  * `PlaidTokens` — `PK: userId (S)`; stores Plaid `access_token`.
  * `PlaidTransactions` — `PK: userId (S)`, `SK: transactionId (S)`; 90‑day history when linked.
  * `UserBudgets` — `PK: userId (S)`, `SK: category (S)`; `monthlyLimit (N)`.
* **Cognito User Pool** – OIDC Hosted UI and JWT issuance.

---

## Endpoints

All endpoints expect a valid **JWT access token** in `Authorization: Bearer <token>`.

### Plaid

* `POST /plaid/create-link-token` → `{ link_token }`

* `POST /plaid/exchange-token` → body `{ public_token, userId }`; exchanges `public_token` for a Plaid `access_token` and persists it in `PlaidTokens`. Note: it takes `userId` from the request body, and does **not** trigger a transaction sync.

* `GET /plaid/summary` → returns a dashboard payload:

  ```json
  {
    "balance": 723.00,
    "balanceDate": "7/25/2025",
    "chartData": [{ "name": "05", "income": 2500, "expenses": 350 }],
    "categoryData": [{ "name": "Groceries", "value": 210.34 }],
    "transactions": [{ "date": "2025-07-01", "amount": -82.34, "type": "debit", "category": "Groceries" }]
  }
  ```

  **Demo mode:** if no Plaid token or a Plaid call fails, the Lambda returns a synthetic payload **and** header `x-demo: true`.

* `GET /accounts` → array of `{ accountId, institution, name, mask, type, current, available }`.
  **Demo mode:** same `x-demo: true` header.

* `GET /plaid/balances` → `{ balance, balanceDate, accounts }` for linked accounts (`404` if no bank linked). **Deployed but not wired into the SPA** — its total-balance logic is already covered by `/plaid/summary`; effectively legacy.

* `POST /plaid/sync-transactions` → pulls the last 90 days from Plaid and batch-writes them to `PlaidTransactions` (`404` if no bank linked). **Deployed but not auto-triggered** — nothing calls it on a schedule or after exchange, so it must be invoked manually to populate the transactions table that `/plaid/summary` reads.

### Budgets

* `GET /budgets` → `[{ category, monthlyLimit }]`
* `PUT /budgets` → upsert `{ category, monthlyLimit }` (number). Returns `204`.
* `DELETE /budgets/{category}` → returns `204`.

### User profile / security

* `PUT /profile` → body `{ name }`; updates the Cognito `name` attribute via `AdminUpdateUserAttributes` (optimistic UI on client). Requires the `USER_POOL_ID` env var.
* `PUT /change-password` → Cognito `ChangePassword` using the access token from the `Authorization` header. Maps Cognito errors to status codes (e.g. `401`, `422`, `429`).

> **CORS:** All responses include `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: Content-Type,Authorization`. `/plaid/summary` and `/accounts` also expose `x-demo` via `Access-Control-Expose-Headers: x-demo`.

> **Known cleanup (not wired to the SPA):** the HTTP API also has a `GET /test` route (a `ping` health-check stub) and a dangling `GET /budget` route pointing at a deleted `GetBudgetData` function. Both are safe to remove from API Gateway.

---

## Front end

* **React (Vite)** SPA with **Tailwind CSS**.
* **Auth**: `react-oidc-context` handles the OIDC session with Cognito Hosted UI.
* **State**: lightweight custom hooks; `useDashboardData` reads `x-demo` to toggle demo messaging and the **Connect a Bank** button.
* **UI polish**: progress bars for budgets; charts for income vs. expenses and top categories.

---

## Backend configuration

Environment variables used by Lambdas:

* `PLAID_CLIENT_ID`
* `PLAID_SECRET`
* `PLAID_ENV` (e.g., `sandbox`)
* `PLAID_TOKENS_TABLE` = `PlaidTokens`
* `PLAID_TX_TABLE` = `PlaidTransactions`
* `BUDGETS_TABLE` = `UserBudgets`
* `USER_POOL_ID` — Cognito user pool id, used by `PUT /profile` (`AdminUpdateUserAttributes`)

> Table-name variables have sensible defaults baked into the handlers (`PlaidTokens`, `PlaidTransactions`, `UserBudgets`).

---

## CI/CD

* **GitHub Actions** builds the SPA, uploads to S3, and invalidates CloudFront.

---

## Roadmap

Chronological path of how the project was built, plus the next polish step.

### ✅ Phase 0 — Git & CI foundation

* Initialize repo and PR checks.
* CI configured; first full deploy executed late in the build once features stabilized.

### ✅ Phase 1 — Front‑end scaffold & hosting

* React (Vite) + Tailwind; layout and core components.
* S3/CloudFront hosting.

### ✅ Phase 2 — Cognito (OIDC Hosted UI)

* Hosted UI, app client, and token handling in the SPA.

### ✅ Phase 3 — Lambda bootstrapping

* Lambda handlers per route, shared response/CORS helpers, least‑privilege IAM.

### ✅ Phase 4 — API Gateway

* REST `/prod` stage with JWT authorizer and CORS.

### ✅ Phase 5 — Plaid integration

* Link token flow; token exchange (stores `access_token`); live balances; 90‑day transaction sync.
* Note: transaction sync lives in a standalone `POST /plaid/sync-transactions` endpoint and is not auto-triggered by exchange or the SPA.

### ✅ Phase 6 — Budgets CRUD (DynamoDB)

* GET/PUT/DELETE with progress UI and color thresholds.

### ✅ Phase 7 — Demo mode fallback

* Inline demo dataset; `x-demo: true` contract; SPA banner + link button.

---

### 🔜 Phase 8 — UX polish

* Toasts for CRUD/link/profile/password.
* Skeleton loaders for Dashboard, Budgets, Accounts.
* Accessibility pass (focus, keyboard nav, contrast).

---

## License

MIT — © Nathan Liriano
