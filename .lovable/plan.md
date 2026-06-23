# Plan: Bigger-Screen Layout + 10 New Features

## Part 1 — Desktop / Bigger Screen Support

Currently the app is mobile-first with `max-w-lg` everywhere. I'll keep mobile pristine but unlock multi-column layouts on `lg+` breakpoints.

- **DashboardLayout**: introduce an optional left sidebar on `lg:` (icon + label nav: Home, Hubs, Wallet, Soko, Wealth, Notifications, Profile). Mobile bottom-nav stays unchanged.
- **DashboardHome**: switch to a 12-col grid on `lg:` — wallet card + quick actions left, KI insight + activity feed right. Floating chat moves to a docked side panel on `xl:`.
- **Hub pages** (WaidPay, Vault, Trade, Akademi, etc.): wrap content in `max-w-6xl` with 2-col splits where natural (form left, history/preview right).
- **Admin/Agent/Moderator layouts**: already have sidebars — widen tables, add sticky filters, multi-column stat grids.
- **Soko, Feed, Leaderboards**: card grids become `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- **Landing (Index)**: already desktop-ready; minor polish.

No mobile regressions — only additive `md:` / `lg:` / `xl:` classes.

## Part 2 — 10 New Full-Stack Features

Each: DB table(s) + RLS + service module + UI page + route.

1. **WaidChat (P2P Messaging)** — Real-time 1:1 + group chats between users; attach money send, payment requests, SmaiPins inline. Tables: `chat_threads`, `chat_participants`, `chat_messages`. Realtime via Supabase channels.

2. **WaidGive (Charity / Causes)** — Verified causes users can donate to; progress bars, top donors leaderboard. Tables: `causes`, `donations`.

3. **WaidEvents (Ticketing)** — Organizers create events, sell tickets in Smai Sika, QR check-in. Tables: `events`, `event_tickets`, `ticket_scans`.

4. **WaidJobs (Gig Marketplace)** — Post gigs, apply, escrow payment on completion. Tables: `jobs`, `job_applications`, `job_milestones` (uses existing escrow logic).

5. **WaidRent (Rentals)** — List items/property for rent, booking calendar, deposit handling. Tables: `rentals`, `rental_bookings`.

6. **SmaiStaking** — Lock Smai Sika at a fixed APY for a term, daily yield accrual. Tables: `staking_plans`, `staking_positions`, `staking_payouts`. Scheduled function accrues yield.

7. **WaidPredict (Prediction Markets)** — Yes/no markets on outcomes; pari-mutuel pool resolves to winners. Tables: `prediction_markets`, `prediction_positions`.

8. **WaidGroups++ (Bill Splitting Groups w/ Ledger)** — Persistent groups (roommates, trips) with a shared ledger that auto-settles. Tables: `expense_groups`, `expense_entries`, `expense_settlements`.

9. **WaidBackup (Recovery Contacts / Social Recovery)** — Nominate 3+ trusted contacts who can approve account recovery + heirs for inheritance flow. Tables: `recovery_contacts`, `recovery_requests`.

10. **WaidVoice (Voice Commands to KonsAI)** — Record/upload voice → transcribe via Lovable AI → feed to existing konsai-chat. Adds mic to LiveChat. Edge function: `voice-transcribe`. (Uses existing `chat_messages` for KonsAI.)

## Wiring

- Add routes in `App.tsx` under `/dashboard/*`.
- Add tiles to `Hubs.tsx` for each new feature.
- Each feature gets a service in `src/lib/services/` exported from `index.ts`.
- KonsAI gets awareness of the new tables (extend its system prompt + tool list in `konsai-chat`).

## Order of Execution

1. One large migration for all 10 features (tables + RLS + GRANTs + helper RPCs).
2. Services layer for all 10.
3. Pages for all 10 + routing + Hubs tiles.
4. Desktop responsive pass across DashboardLayout, DashboardHome, hub pages.
5. KonsAI prompt update + voice edge function.

## Notes / Trade-offs

- Realtime chat uses Supabase Realtime (already available).
- Prediction markets resolve manually by admin (no oracle integration yet).
- Staking yield accrues via the existing scheduled-actions cron pattern.
- Voice transcription uses Lovable AI (Whisper-compatible model if available, else Gemini audio).

Approve and I'll ship it as a sequence of migration → services → pages → layout polish.
