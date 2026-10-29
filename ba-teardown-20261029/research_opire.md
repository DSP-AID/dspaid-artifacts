# Opire lifecycle teardown — public-materials research (no signups)

Date: 2026-10-29. Subagent report. All facts from live public pages fetched today; Wayback Machine was unreachable during the session (see Unknowns).

## 0. Premise correction (important)

- **opire.io is dead.** DNS NXDOMAIN via Google DNS (`Status: 3`) and RDAP registry returns 404 (domain not registered). Sources: https://dns.google/resolve?name=opire.io&type=A , https://rdap.org/domain/opire.io . Consequence: `docs.opire.io`, `help.opire.io` cannot exist either.
- **Live official domain is opire.dev**: site https://opire.dev/home , app https://app.opire.dev , docs https://docs.opire.dev/ (sidebar verified: Overview / Rewards / Tips / FAQ only — no vulnerability section).
- **GitHub org "OpireApp" does not exist**: https://api.github.com/users/OpireApp → `Not Found`; https://github.com/orgs/OpireApp/repositories → 404. Real org is https://github.com/opire with a single public repo `.github`: https://api.github.com/orgs/Opire/repos . Its security policy: "report it to us sending an email to team@opire.dev" — https://github.com/opire/.github/blob/main/CONTRIBUTING.md
- **docs source repo is gone**: https://api.github.com/repos/Opire/opire → `Not Found`; https://github.com/Opire/opire → HTTP 404 (the docs "Edit this page" links are broken).
- **Platform identity mismatch:** Opire's own current public materials describe a **GitHub-issue bounty platform**, not a vulnerability-disclosure marketplace. No vulnerability-report lifecycle (draft→submitted→triaged…), no CVE/CVSS/NVD, no auto-disclosure deadlines, no crypto payouts appear anywhere in docs, ToS, homepage FAQ or the dev.to blog. The requested VDM lifecycle could not be confirmed from any current Opire-owned public page (see §6).

## 1. Lifecycle states (current: bounty on a GitHub issue)

| # | Fact | Source |
|---|------|--------|
| 1.1 | Created: only a repo **code owner** can create a bounty, for an issue in their repo, ≥ $20; via app or `/reward [amount]` bot command. | https://docs.opire.dev/overview/getting-started — "Bounties start at $20." ; https://docs.opire.dev/rewards/pricing ; https://docs.opire.dev/overview/commands |
| 1.2 | Published/listed: bounty appears on the Opire platform and on the issue itself; any programmer may attempt it, declaring intent with `/try`. | https://docs.opire.dev/rewards/lifecycle — "it will appear on the Opire platform, as well as on the issue itself" ; https://docs.opire.dev/overview/commands (`/try` "Indicate that you are going to try to solve") |
| 1.3 | Claimed: developer opens PR then `/claim #[issue]`; each bounty creator receives a link to the PR. | https://docs.opire.dev/rewards/lifecycle — "This notifies each bounty creator with a link to the PR." ; https://docs.opire.dev/overview/commands |
| 1.4 | Review/approve: each creator independently reviews the PR against the issue requirements; no platform-side decision. | https://docs.opire.dev/rewards/lifecycle — "Each creator reviews the solution and, if it meets the issue requirements, arranges payment"; "Claiming a bounty never creates an automatic payment." |
| 1.5 | Paid: funds move on Stripe Checkout confirmation, straight to the developer's Stripe account (ToS); docs phrase payments as human-arranged. | https://opire.dev/terms-of-service — "Upon successful payment confirmation through Stripe Checkout, the funds are transferred directly to the developer's Stripe account." ; https://docs.opire.dev/rewards/pricing — "payments are arranged directly by the people involved" |
| 1.6 | Rejected: PR can be improved and re-submitted; another dev's PR may win instead. | https://opire.dev/home#faq — "Improve the pull request and submit it again… Another developer's solution may be accepted instead." |
| 1.7 | Public aggregate states: app shows counters "Paid 44 / Available 6 / Paid out $4,975.87 / Open value $212.00". | https://app.opire.dev/home |
| 1.8 | API state fields: public JSON lists `pendingPrice`, `claimerUsers`, `tryingUsers`; **no explicit lifecycle status enum** in the public payload. | https://api.opire.dev/rewards (verified response shape, 2026-10-29) |
| 1.9 | Tip track: tip created from a command on an issue/PR to thank a contributor; not tied to solving anything. | https://docs.opire.dev/tips/lifecycle ; https://docs.opire.dev/overview/commands (`/tip [amount] @[user]`) |

## 2. Money movement

- **No escrow.** ToS: contractual relationship is "directly between the customer and the developer"; "Opire LLC is not responsible for the failure of any Customer to pay a Bounty." — https://opire.dev/terms-of-service
- **Payout = 100% of bounty to developer; platform fee 4% + Stripe fees, paid by the creator on top.** ToS: "they are entitled to receive 100% of the Bounty amount… including a service fee of 4% to Opire and transaction fees charged by our payment processing partner, Stripe." — https://opire.dev/terms-of-service ; corroborated (third party) by https://www.oss.fund/opire/ ("4% platform fee + Stripe processing fee, paid by bounty creators").
- **Who holds money:** nobody pre-funds; creator pays via Stripe Checkout at approval time (ToS §Registration and Payments + §Creation and Fulfillment of Bounties) — https://opire.dev/terms-of-service
- **Rails:** Stripe only ("Stripe processes all payments on our platform", ToS). No crypto rail is mentioned in any public Opire source; oss.fund lists "Payment methods: Stripe" (third-party). — https://opire.dev/terms-of-service , https://www.oss.fund/opire/
- **Minimums:** bounty $20 USD, tip $1 USD — https://docs.opire.dev/rewards/pricing ("Bounties start at $20 USD"; table "Tip $1 USD").
- **Multiple funding is allowed; each creator pays their share separately** — https://docs.opire.dev/rewards/lifecycle ("Each creator pays their part separately.")

## 3. Review / acceptance model

- No platform triage, severity grading, CVSS or NVD involvement anywhere in docs/ToS/FAQ (the VDM concept is absent). **Not stated → unknown** for the security-report context; for bounties: "Bounty creators will pay you when they confirm that your solution meets the requirements defined in the issue." — https://docs.opire.dev/overview/getting-started
- Access gate for creation: code-owner permission ("Repository access alone is not enough.") — https://docs.opire.dev/overview/getting-started
- Multiple developers may work on the same bounty; winner chosen by creators, not by queue: "A claim does not create an automatic payment; the creator arranges payment only if the pull request meets the issue requirements." — https://opire.dev/home#faq

## 4. Dispute handling

- **No arbitration, no enforcement:** "While Opire is not obligated to intervene in disputes between Customers and Developers, we may, at our discretion, contact a Customer… facilitation service rather than an enforcement measure." — https://opire.dev/terms-of-service
- **Self-service anti-abuse:** creators who systematically fail to pay have bounty creation disabled: "The affected user's ability to create bounties will be disabled until such time as they have rectified their outstanding obligations" — https://opire.dev/terms-of-service (Ethical Use Policy)
- **Refunds:** none for subscriptions ("No refunds will be provided for any portions of the subscription fee already paid"), access kept until end of billing cycle — https://opire.dev/terms-of-service . No bounty-refund mechanism is documented.

## 5. Timers / deadlines

- **Bounty/claim/payout: no documented timers.** No patch window, claim expiry, payment SLA or auto-closure appears in docs, ToS, FAQ (checked all pages; grep of saved copies returns zero hits for deadline/expire/days). **Not stated → unknown.**
- **Subscriptions:** monthly/annual; "Subscription tiers cannot be changed until the next renewal period… can be paused or cancelled at any time"; access ends with the billing cycle ("until a month has elapsed since the start of the subscription") — https://opire.dev/terms-of-service
- **No auto-disclosure deadline exists** (nothing discloses automatically; disclosure concept absent).

## 6. Explicit unknowns (do NOT guess)

1. Whether Opire ever operated a vulnerability-disclosure marketplace at opire.io with draft→submitted→triaged→acknowledged→fixed→disclosed→paid states, maintainer patch windows, escrow, CVSS/NVD triage, crypto payouts — **unverifiable today**: domain is unregistered/dead and the Internet Archive was unreachable (see 7). No current Opire-owned page mentions vulnerabilities.
2. Payout processing times (Stripe settlement SLA) — not stated publicly.
3. Subscription tier prices/fee discounts ("discounted service fees") — ToS mentions plans but no public pricing table for tiers was found on opire.dev or docs.
4. Whether `api.opire.dev/rewards` hides a richer status enum for authenticated users — unknown (public payload has no status field).
5. Historical "Challenges"/"Projects" product tabs on app.opire.dev (nav present at https://app.opire.dev/home) — mechanics not documented publicly.

## 7. Dead/blocked URLs encountered

- https://opire.io/ — dead: unregistered domain (NXDOMAIN + RDAP 404).
- https://github.com/orgs/OpireApp/repositories — 404; https://api.github.com/users/OpireApp — Not Found.
- https://github.com/Opire/opire and https://api.github.com/repos/Opire/opire — 404 (docs "Edit this page" links dead).
- https://docs.opire.io/ , https://help.opire.io/ — transport failure; parent zone opire.io unregistered → dead.
- https://web.archive.org/cdx/search/cdx… , https://web.archive.org/wayback/available… , https://archive.ph/opire.dev — Internet Archive "Temporarily Offline" / bot-block (from local IP and from 10.0.0.100); Wayback CDX rows for opire.io (2024: 308→404→200) were observed but URL columns unrendered; historical snapshots could not be retrieved today.

## 8. Secondary corroboration (third-party, cited as such)

- https://www.oss.fund/opire/ — "Stripe-based payouts", fees 4%+Stripe, status Live (unverified by their own admission).
- https://dev.to/farkharoumy/how-to-use-opire-to-find-unclaimed-github-bounties-with-real-data-from-30-live-bounties-2dj5 (2026-03) — comment-based flow (`/try`, `/claim`), public API endpoint.
- https://modemworld.me/2026-05-15/2026-week-20-sl-open-source-tpvd-meeting-summary — Second Life "retiring the use of the Opire bounty platform" (bot-spam submissions), confirms platform live in 2026.
- https://github.com/opire/.github/blob/main/CONTRIBUTING.md — org profile repo; security reports → email team@opire.dev (no VDM program).
- dev.to official blog https://dev.to/opire (7 articles, API-checked bodies): zero mentions of security/vulnerability/CVE/disclosure.

## 9. Verification & test results

- Live fetches OK: opire.dev/home, /terms-of-service, docs.opire.dev/{overview/getting-started, overview/commands, rewards/introduction, rewards/pricing, rewards/lifecycle, tips/lifecycle, faq}, api.opire.dev/rewards (200, JSON), dev.to API, oss.fund/opire.
- DNS/RDAP checks: opire.io NXDOMAIN (dns.google), unregistered (rdap.org 404).
- GitHub API checks: org Opire exists (1 public repo), OpireApp absent, Opire/opire absent.
- Known inconsistency flagged: docs say payments "arranged directly by the people involved", ToS says funds go via Stripe Checkout "directly to the developer's Stripe account" — both same source set, wording differs.

## 10. Follow-ups

- Re-check Wayback (opire.io + opire.dev 2023 snapshots) when Internet Archive recovers; a historical VDM ToS would settle §6.1.
- Optionally auth-check api.opire.dev status enum via app dashboard screenshots (needs signup — out of scope).
