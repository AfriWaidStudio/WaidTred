# WaidTred Launch Readiness Report

Audit date: 23 June 2026  
Current verdict: **NOT READY FOR PRODUCTION LAUNCH**

## Executive summary

The repository is a large React/Supabase prototype with 127 client routes, 127 schema tables, 46 database functions, and only three Edge Functions. The production build succeeds, but breadth of UI is substantially ahead of the trusted backend and provider layer. Several core screens still use mock data, and there is no deployed payment-provider adapter, virtual-account creation endpoint, payout endpoint, or central provider webhook receiver in this repository.

The audit found critical wallet and scheduler authorization defects. A new hardening migration closes the confirmed direct-wallet-credit path, removes direct balance/status mutation, introduces audited admin operations, adds KYC evidence storage/review, makes scheduled execution concurrency-safe, and protects the unauthenticated cron function with a dedicated secret. These changes must be applied to the target Supabase project before they protect production.

## Verification performed

| Check | Result |
|---|---|
| Production build | Pass (`vite build`) |
| TypeScript | Pass (`tsc --noEmit`) |
| Unit tests | Pass, but only 1 placeholder test exists |
| ESLint | Fail: 315 errors and 27 warnings |
| Route/import compilation | Pass for 127 declared routes |
| Database migration execution | Not run locally: Supabase CLI download succeeded, but its Windows binary could not execute in this environment |
| Live provider/API tests | Not possible: no provider execution functions or test credentials in scope |
| Authenticated browser E2E | Not available: no seeded test users/provider sandbox setup |

## Existing and connected features

- Supabase email/password registration, login, logout, password reset, and persisted sessions.
- Role-protected user, agent, moderator, admin, and super-admin route shells.
- User profiles, wallets, immutable wallet ledger, notifications, contacts, funding requests, KYC records, scheduled actions, disputes, risk/fraud tables, and audit logs.
- Atomic internal wallet transfer RPC with sender debit, recipient credit, paired transaction records, ledger entries, and recipient notification.
- Manual funding approval RPC with role checks and ledger credit.
- Provider registry, provider credential *environment-variable references*, service capability records, country/service routes, priority resolution, provider logs, and webhook event tables.
- Admin views for users, wallets, transactions, funding, providers/routes, security, and audit data; several other admin views remain mock-backed.
- Transaction history now reads the authenticated user's real transaction records rather than demo data.
- KYC now uploads actual ID/selfie evidence to a private bucket and provides an audited admin review path using short-lived signed URLs.

## Critical issues

### Resolved in code (deployment required)

1. **Arbitrary wallet credit/debit RPC exposure.** `process_wallet_movement` and related primitives were `SECURITY DEFINER` functions with PostgreSQL's default `PUBLIC` execute permission. Any authenticated caller could credit their own or another wallet. The new migration revokes client execution and grants it only to `service_role`.
2. **Unauthenticated service-role scheduler.** `process-scheduled-actions` had `verify_jwt = false`, accepted any request, and invoked a service-role RPC. It now requires POST plus `SCHEDULED_ACTIONS_CRON_SECRET` in `x-cron-secret`, failing closed if the secret is absent.
3. **Duplicate scheduled money execution.** Due rows were read without row locks. The executor now uses `FOR UPDATE SKIP LOCKED` and records paired transactions.
4. **Direct wallet/admin mutation without ledger.** Direct admin wallet updates were removed. `admin_adjust_wallet` is role-checked, ledger-backed, and audited; a database balance-identity constraint was added.
5. **Forged completed transaction records.** Client insert policy now permits only the caller's pending intents; direct authenticated transaction updates were revoked.
6. **Unaudited transaction relabelling.** Admin UI could mark completed transactions reversed without moving money. Those controls were removed; the remaining flag operation is an audited RPC and creates a fraud event.
7. **Role resolution failure/race.** Multi-role users were queried with `maybeSingle()` and auth loading ended before role retrieval. Roles now resolve deterministically by privilege and protected routes wait for resolution.
8. **Recipient lookup disconnected by RLS.** Exact email/phone lookup could never see another profile. A narrow, authenticated exact-match RPC now supports transfers without making profiles broadly readable.
9. **Fake KYC uploads and direct KYC approval.** UI-only upload flags were replaced by private evidence storage. Direct profile KYC mutation was removed in favour of an evidence-based, atomic, audited review RPC.
10. **Additional value-mutation primitives exposed.** Staking accrual, metrics snapshot, reserve consumption, and unrestricted entity-treasury movement are now service-only.
11. **Waides KI exceeded its permitted scope.** Its money-transfer and scheduling tools are now server-blocked, only read-only analytics tools are advertised to the model, and the dashboard chat action surface is disabled.

### Open launch blockers

1. **No payment execution/provider adapter layer.** Provider records and routing metadata exist, but no Edge Function calls Paystack, Flutterwave, Monnify, Kora, VTU, bank, or mobile-money APIs. The current recharge page creates a pending row and previously simulated success by debiting the wallet locally.
2. **No central provider webhook endpoint.** There is a `provider_webhooks` table, but no receiver performs provider-specific signature verification, idempotent deposit/payout settlement, retries, replay, or dead-letter processing.
3. **No virtual-account implementation.** There is no virtual-account table, create-account RPC/function, provider customer mapping, or deposit-to-wallet reconciliation path.
4. **No withdrawal/payout implementation.** There is no beneficiary bank validation, payout initiation, approval/fraud workflow, provider status polling, or reversal/reconciliation path.
5. **KYC is not tiered and phone verification is absent.** Current schema exposes a single profile KYC status. Tier 0-3 limits, OTP phone verification, proof-of-address distinction, and per-tier transaction limits are not implemented.
6. **Critical migrations are unverified against a database.** The Supabase CLI Windows binary could not execute in this environment, so the new migration has static/type/build verification only. It must pass `supabase db reset`/staging deployment and policy tests before release.
7. **No meaningful automated financial tests.** The only unit test asserts `true`. Atomicity, concurrency, RLS, idempotency, ledger invariants, reversals, webhook replay, and provider failover have no automated coverage.

## High-priority issues

- Airtime/data/bill pages contain static countries, providers, and plans; at least one airtime page is UI-only.
- Admin Countries, Integrations test action, Pricing, SokoPlace inventory/orders, and compliance reporting contain mock/static behaviour.
- SokoPlace user transaction screens and the legacy transaction history were mock-backed; history is fixed, marketplace remains mock-backed.
- Numerous browser services call the now-private wallet primitive directly. This is intentionally fail-closed, but each must move into a purpose-built, validating server RPC before that feature can be enabled.
- No device registry/fingerprinting, IP reputation pipeline, configurable velocity rules, duplicate-payment controls, or distributed rate limiter.
- No email/SMS/push delivery workers; in-app notifications exist.
- No country registry table; the current country admin page is static.
- No feature-flag enforcement around unfinished financial products.
- KYC document numbers are stored as plaintext application data; encryption/tokenisation and retention/deletion policy are required.

## Medium-priority issues

- Production bundle is about 1.5 MB minified (about 371 KB gzip) because all routes are eagerly imported.
- ESLint has 315 errors, dominated by untyped `any`, plus hook-dependency and empty-block defects.
- Generated browser data and migrations are not protected by schema-contract tests.
- Several UI strings show character-encoding corruption.
- Browser compatibility data is stale and Vite reports ineffective dynamic imports.
- Audit-log coverage is inconsistent outside the newly hardened financial/admin operations.

## Low-priority issues

- UI loading, empty, and error states vary across pages.
- Accessibility and keyboard flows have not been systematically tested.
- README contains no operational setup, deployment, rollback, incident, or reconciliation runbook.

## Required launch sequence

1. Apply all migrations to an isolated staging project and set `SCHEDULED_ACTIONS_CRON_SECRET`; deploy the updated scheduler.
2. Add provider adapters and a central webhook function with provider-specific signature verification and idempotent settlement.
3. Implement virtual accounts, beneficiaries, payouts/withdrawals, reconciliation, and reversals as server-owned state machines.
4. Implement phone OTP, KYC tiers, limits, sanctions/PEP workflow, retention, and encrypted sensitive fields.
5. Replace or feature-disable every mock-backed financial/admin surface.
6. Add database/RLS tests, provider contract tests, webhook replay tests, wallet concurrency tests, and authenticated Playwright core-flow tests.
7. Run staging soak/reconciliation, security review, provider sandbox certification, backup/restore drill, and operational launch sign-off.

## Launch decision

**NO-GO.** The confirmed arbitrary-wallet-mutation and unauthenticated-cron defects are repaired in source, but the platform cannot meet its stated fintech/VTU launch scope until the open critical provider, webhook, virtual-account, withdrawal, tiered-KYC, migration-validation, and financial-test blockers are completed.
