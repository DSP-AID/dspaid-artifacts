# Agent Task Marketplaces — Teardown Research: Dealwork vs Virtuals ACP

Date: 2026-10-29 | Sources: public docs only, no signups | Researcher: subagent

## Choice & Why

**Primary: Dealwork (dealwork.ai).** Its developer protocol page `https://dealwork.ai/skill.md` documents the complete contract state machine, exact event names, timers (24h auto-approve, revision cap), fee schedule, escrow mechanics, and dispute resolution — more lifecycle/timer detail than any other candidate. Terms + Security pages back the money/holding model. Enough public material for a 5th teardown platform.

**Runner-up: Virtuals ACP.** `docs.virtuals.io` is unreachable (transport error); the live docs are `https://os.virtuals.io/` (llms-full.txt) and `https://whitepaper.virtuals.io/`. These give a full on-chain job state machine, fee split, USDC-on-Base escrow, and expiry parameters — but almost nothing about dispute/arbitration or auto-approval timers.

## Dealwork — Primary Candidate

### 1) Lifecycle states (job → contract)

- Contract state machine verbatim: `posted → bidding → escrow_locked → in_progress → in_review → completed → paid`, plus `in_review → REJECT → disputed → RESOLVE_WORKER → completed → paid` / `RESOLVE_BUYER → refunded`. — https://dealwork.ai/skill.md
- Transition events (worker): `escrow_locked → START_WORK → in_progress`; `in_progress → SUBMIT_WORK → in_review`; `in_review → REQUEST_REVISION → in_progress (revisionCount++, max 10)`. — https://dealwork.ai/skill.md
- Buyer transitions: "Bid accepted → contract created → escrow_locked (funds locked from your wallet)". — https://dealwork.ai/skill.md
- Two job modes: `jobMode:"bid"` (bids + accept) and `jobMode:"open"` (instant claim slots, `maxConcurrent`); claim returns a created contract. — https://dealwork.ai/skill.md
- API state filter list: `escrow_locked, in_progress, in_review, completed, paid, disputed, cancelled`. — https://dealwork.ai/skill.md (`GET /api/v1/contracts?state=`)

### 2) Money movement

- Custodial, not blockchain escrow: "The funds are held by the platform and released to the provider when the client approves". — https://dealwork.ai/terms
- Token/chain: "Wallet balances are denominated in USD. Top-ups and payouts use the methods shown in your wallet; on-chain top-ups (USDC on Polygon) are credited after the transaction is verified." — https://dealwork.ai/terms (no x402 anywhere on dealwork.ai)
- Accounting: "Every wallet movement is recorded in an auditable double-entry ledger." — https://dealwork.ai/terms; "Funds move only through defined escrow states: locked when a contract starts, released on approval, refunded on dispute" — https://dealwork.ai/security
- Fees: "10% per contract, and 3% when both the client and the provider are AI agents", deducted from payment, shown before commit. — https://dealwork.ai/terms; same on https://dealwork.ai/how-it-works and homepage
- Escrow timing: "Posting a bid-mode job does not lock funds immediately — escrow locks when you accept a bid. Posting an open task locks funds per slot as workers claim them." — https://dealwork.ai/skill.md
- Settlement: `APPROVE → completed → auto RELEASE_ESCROW → paid`. — https://dealwork.ai/skill.md

### 3) Review / acceptance model

- Buyer decision set in `in_review`: `APPROVE` / `REQUEST_REVISION` (requires feedback) / `REJECT` (opens dispute). — https://dealwork.ai/skill.md
- Auto-approval: "Review work within 24 hours. After 24h, contracts auto-approve." — https://dealwork.ai/skill.md; terms wording: "the contract may auto-complete to protect the provider" — https://dealwork.ai/terms
- Reviews: rating 1–5 + comment can be attached to APPROVE/RELEASE_ESCROW in one call. — https://dealwork.ai/skill.md
- Reputation/gating: agents have "trust tiers, verification checks, and daily spending limits" — https://dealwork.ai/terms; KYA badge — https://dealwork.ai/security; bids are rate-limited (10/hour, 3 attempts/job/24h) — https://dealwork.ai/skill.md; owner-claimed agents "no trust tier required" to post jobs — https://dealwork.ai/skill.md
- No staking/reputation gating of work rights is documented.

### 4) Dispute handling

- Trigger: client opens dispute via REJECT while in review. — https://dealwork.ai/terms
- Model: "Our team reviews the brief, the delivery, and the conversation, and resolves the dispute by releasing escrow to the provider, refunding the client, or splitting the amount." — https://dealwork.ai/terms
- Refunds: "Refunds are returned to your wallet balance and can be withdrawn — a refund is real money back, not locked credit." — https://dealwork.ai/terms
- Finality: "Dispute decisions by the platform are final within the platform". — https://dealwork.ai/terms
- No slashing/staking; cancel path: CANCEL event "refunds escrow to your wallet, and re-opens the job" (worker marked `dead` >72h). — https://dealwork.ai/skill.md

### 5) Timers / deadlines

| Timer | Value | Source |
|---|---|---|
| Buyer review window | auto-approve after 24h | https://dealwork.ai/skill.md |
| Revisions | max 10 per contract | https://dealwork.ai/skill.md |
| Bidding deadline | required `biddingDeadline` field on bid-mode jobs | https://dealwork.ai/skill.md |
| Contract deadline | buyer-set `deadline` field on job/contract | https://dealwork.ai/skill.md |
| Worker liveness | active <24h, idle 24–72h, dead >72h → cancel+refund recommended | https://dealwork.ai/skill.md |
| Seed jobs default expiry | `deadlineDays=45` param | https://dealwork.ai/skill.md |
| Connect-token auth poll | 3s interval, 120 attempts (6 min) | https://dealwork.ai/skill.md |
| Rate limits | GET 60/min, POST 20/min, 100 bids/day; 10 bid-creates/hour, 3/job/24h | https://dealwork.ai/skill.md |

### 6) Explicit unknowns (Dealwork — not stated in docs)

- Job expiry after posting for regular jobs (only seed-job `deadlineDays` is shown).
- Exact per-contract review window: terms say "review window shown on the contract" without a default value.
- Fiat top-up/payout rails, fees, minimums, withdrawal timing ("methods shown in your wallet").
- Trust-tier criteria and KYA verification process details (only "we may adjust" language).
- Whether `RESOLVE_WORKER`/`RESOLVE_BUYER` are automated or purely manual team actions.
- Escrow storage location of real funds (bank vs chain) beyond "held by the platform".

## Virtuals ACP — Runner-up

- Lifecycle: phases `open → budget_set → funded → submitted → completed | rejected`, terminal `expired`; each transition is an on-chain action; Job contract = "State machine smart contract with built-in escrow". — https://os.virtuals.io/acp/concepts (aggregate: https://os.virtuals.io/llms-full.txt)
- Money: USDC locked in escrow by `fund`, released by `complete` (escrow→provider) or returned by `reject` (escrow→client); protocol fee split "Without an Evaluator (95/5) … With an Evaluator (90/5/5): Provider 95/90, Protocol 5". Contracts on Base Mainnet (ACP Core `0x238E…32E0`). — https://os.virtuals.io/llms-full.txt
- Evaluation: optional Evaluator role ("If not specified, the Client assumes this role"); four-phase model Request/Negotiation/Transaction/Evaluation with signed Proof of Agreement. — https://whitepaper.virtuals.io/about-virtuals/commerce-layer.md
- Timers: offering `SLA — expected delivery time in minutes`; custom jobs `--expired-in 3600`; `job watch` exit code 3 = "Job expired (terminal)". — https://os.virtuals.io/llms-full.txt (`/acp/concepts`, `/acp/cli/provider-workflow`, `/acp/cli/client-workflow`)
- x402: `acp serve` exposes "x402, MPP, and ACP native endpoints — all backed by ERC-8183 on-chain escrow"; ACP is the ERC-8183 reference implementation. — https://os.virtuals.io/acp/cli/acp-serve (via llms-full.txt)

### ACP unknowns (not stated in docs)
- No auto-approve/auto-release timer found; no post-reject arbitration/dispute mechanism; no slashing; expiry creation is client-supplied (`expired-in`) with no default documented.

## Dead / broken URLs

- `https://docs.virtuals.io` — transport error, unreachable (no page served).
- `https://os.virtuals.io/acp/concepts.md` (and other `.md` suffixes on os.virtuals.io) — 404 HTML; use `https://os.virtuals.io/llms-full.txt` instead.
- `https://dealwork.ai/api-docs` — interactive SPA, renders essentially empty to non-JS fetch ("OpenWork API Docs — Interactive REST API documentation"); content mirrors skill.md.
