# Algora bounty/task lifecycle — public teardown

Date: 2026-10-29. Method: live fetches of the open-source codebase (`algora-io/algora`, AGPL-3.0, Elixir/Phoenix) + bundled docs; no signups. All facts below verified against raw files on `main` today; anything not stated publicly is listed as unknown (no guesses).

## 0. Identity / current status

| Fact | Source |
|---|---|
| Algora today is positioned as a hiring product: "Hire the top 1% open source engineers." Bounty mechanics still live in the open-source app code and bundled docs. | https://raw.githubusercontent.com/algora-io/algora/main/README.md (200 OK) |
| Docs section for bounties on the website is retired: `docs.algora.io/bounties` → 404; bounty truth is in repo `priv/content/docs/` (the same content served by docs). | fetch 2026-10-29 |
| Repo history for bounty schemas starts 2025-04-15 (`3aed2eb105`), newest touched 2025-08-29 (`594a620116`) — the status enums below are the full history of that field, not reconstructed from memory. | GitHub API commits listing for `lib/algora/bounties/schemas/bounty.ex` |

## 1. Lifecycle states (from schema source of truth)

| Fact | Source |
|---|---|
| Bounty status enum is exactly three states: `field :status, Ecto.Enum, values: [:open, :cancelled, :paid]`. There are no intermediate "in_progress"/"submitted"/"fulfilled" bounty states — work progress lives on claims. | https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/bounties/schemas/bounty.ex (verified 2026-10-29, and identical at the oldest commit 3aed2eb105 of 2025-04-15) |
| Bounty has a poster-set `deadline` (`field :deadline, :utc_datetime_usec`), visibility `:community | :exclusive | :public`, contract type `:bring_your_own | :marketplace`. | same file |
| An opt-out autopay flag exists: `field :autopay_disabled, :boolean, default: false`. | same file |
| Claim (a PR/review/video/design/article submitted for a bounty) status enum: `[:pending, :approved, :cancelled]`; claim types `[:pull_request, :review, :video, :design, :article]`. | https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/bounties/schemas/claim.ex |
| "Attempts" (people indicating intent to work) have no lifecycle enum: only `[:active, :inactive]`. | https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/bounties/schemas/attempt.ex |
| Flow per docs: install app → create bounty → app tracks PRs that claim the bounty → maintainer clicks **Reward** "to proceed with the checkout" → bot comments on the issue when payment lands. Quotes: "The Algora app will track all pull requests that claim the bounty."; "Once you're satisfied with a solution, you can click **Reward** link in the table to proceed with the checkout."; "The Algora bot will comment on the issue when the contributor receives the payment." | https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/bounties/in-your-own-repos.md |
| Split awards exist: `bounty $500` command; example "the award would be split evenly into 3". | https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/commands.md |

## 2. Money movement

| Fact | Source |
|---|---|
| Payments run on Stripe Connect: "Algora partners with Stripe to help you pay collaborators around the world fast & securely." / "Through Stripe Connect, Algora offers the most comprehensive country coverage available." | https://raw.githubusercontent.com/algora-io/algora/main/priv/content/docs/payments.md |
| The word "escrow" does not appear in payments.md; no custody model is stated. Money timing per docs: checkout happens at **Reward** click (after review), contributor payout confirmed later by bot comment. | same file + in-your-own-repos.md |
| Payouts to contributors require their Stripe Connect onboarding credentials; otherwise "Stripe will not process payments to them and Algora will notify those individuals". | payments.md |

## 3. Review / acceptance model

- Maintainer reviews tracked PRs on the claim page ("Once you're satisfied with a solution..."), approves a claim, then triggers payout via Reward checkout (in-your-own-repos.md).
- `autopay_disabled` implies an automatic payout mode exists (semantics not documented — see unknowns) (bounty.ex).

## 4. Dispute handling

- No dispute state exists in bounty/claim enums (`[:pending, :approved, :cancelled]` only); no arbitration doc found → **unknown** (§6).

## 5. Timers / deadlines

| Timer | Value | Source |
|---|---|---|
| Bounty `deadline` | poster-set datetime field; no auto-expiry rule documented | bounty.ex (`field :deadline`) |
| Payout processing duration | not stated in docs | payments.md (no SLA text) |
| Auto-cancel / inactivity windows | none found in schemas or docs | — |

## 6. Explicit unknowns (not stated publicly — do not guess)

1. Custody model: when the buyer's card is charged (at bounty creation vs at Reward checkout), whether Algora holds funds in Stripe between Reward and payout confirmation, refund rules on cancelled bounties.
2. Platform fee percentage for bounty payouts (no % found in payments.md or schemas; historical 5% claim from retired docs could not be verified today — treat as unknown).
3. Dispute/clawback process if a maintainer never rewards an approved PR.
4. Semantics of `autopay_disabled` (what exactly is automated: payout on merge? on approve?).
5. Payout processing time and minimum payout thresholds via Stripe Connect.
6. Whether the public bounty board (algora.io/bounties) still accepts new bounties in 2026 (listing page dead-redirects; board activity stale).

## 7. Dead / verified URLs

| URL | Status |
|---|---|
| https://docs.algora.io/bounties | 404 on 2026-10-29 |
| https://algora.io/bounties | dead (redirect target 404) |
| https://raw.githubusercontent.com/algora-io/algora/main/lib/algora/bounties/status.ex | **does not exist** — 404; the file never existed on main (history check), so older teardown notes citing it are wrong |
| lib/algora/bounties/schemas/{bounty,claim,attempt}.ex, priv/content/docs/{payments.md,bounties/in-your-own-repos.md,commands.md} | 200 OK 2026-10-29 |

## 8. Bottom line

Algora's public code-derived lifecycle is intentionally thin: bounty `open → paid | cancelled`, claim `pending → approved | cancelled`; money moves only at maintainer Reward (Stripe checkout → Stripe Connect payout), with no documented escrow, dispute flow, or platform fee. Everything else is an explicit unknown.
