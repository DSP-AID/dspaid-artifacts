# IssueHunt (issuehunt.io) — Public Teardown: Bounty/Task Lifecycle

Date: 2026-10-29. Research method: live fetches + Wayback Machine captures only (no signups). Every fact cites a specific URL. Quotes ≤30 words.

## 0. Identity & current status (context)

| Fact | Source |
|---|---|
| issuehunt.io (Oct 2026) is now a commercial **bug bounty** service for Japanese companies, run by "IssueHunt K.K."; the OSS issue-bounty platform moved to subdomain `oss.issuehunt.io`. | https://issuehunt.io/ ("#1 Bug Bounty platform in Japan", footer "© 2025 IssueHunt K.K.") |
| The OSS bounty platform was operated by **BoostIO, inc** (later BoostIO K.K.); Terms enacted **June 19, 2018**, footer "© 2019 BoostIO, Inc." | https://web.archive.org/web/20261013194922/https://oss.issuehunt.io/terms |
| Platform source code is **not** in the GitHub org — only content repos (readme, materials, events, Kowaseru); no payment-flow repo exists. | https://github.com/IssueHunt (7 repos listed) |
| OSS app deep links now redirect issuehunt.io → oss.issuehunt.io; live oss.issuehunt.io returned **HTTP 502** during this research (legacy backend down/flaky). | fetch of https://issuehunt.io/repos/34526884 → redirect → 502 |
| OSS listing is stale in 2026: open issue asks "Is the OSS bounty service still accepting contributor submissions in 2026?" — no staff answer recorded. | https://github.com/IssueHunt/readme/issues/12 (opened 2026-09-08) |

## 1. Lifecycle states (OSS bounty)

Sources unless noted: **Terms of Use** = https://oss.issuehunt.io/terms (Wayback capture used: https://web.archive.org/web/20261013194922/https://oss.issuehunt.io/terms — identical text captured 2023-05 → 2026-10, enacted 2018-06-19).

1. **Setup**: Maintainer "declare the start or end of the reception of the Contribution made on the Issue" (Art. 4.5(i)).
2. **Funding**: Funding User purchases "the right to remit fund through the Company to the Issues" by paying consideration → resulting balance is the **"Deposit"** (Art. 4.1). Quote: *"10% of the consideration paid by the Funding User shall be applied to the fee payable to the Company, and the Funding User may remit fund in the Service within the remaining 90%."*
3. **PR submitted**: Contributor submits Pull Request on GitHub and also "submit pull request via IssueHunt" (landing page). Quote (fest FAQ): *"After submitting a pull request through Github, please submit the pull request's URL to IssueHunt as well."* — https://web.archive.org/web/20210924152905/https://fest2018.issuehunt.io/faq/ ; landing: https://web.archive.org/web/20260120034659/https://oss.issuehunt.io/
4. **Review/approval**: *"the Maintainer shall confirm such Contribution and determine approval or refusal"* (Art. 4.7). "Merge" defined as maintainer integrating approved PR (Art. 2(7)). Quote (fest FAQ): *"You will get paid when the repository owner confirms your pull requests!"*
5. **Payout after acceptance**: *"the Company shall pay to the Maintainer the amount of the Deposit remitted to the Issue... as the 'Maintainer Consideration', and the Maintainer shall pay to the Contributor the amount obtained by multiplying the Maintainer Consideration by the Contributor Ratio"* (Art. 4.8).
6. **Payout without acceptance**: *"the Company shall pay to the Maintainer the amount of the Deposit... after 180 days have elapsed"* if no PR approved within 180 days (Art. 4.9) — funds go to maintainer even unmerged.
7. **Partial splitting across multiple PRs**: handled via **"Contributor Ratio"**: *"The Contributor Ratio shall be determined and notified to the Company by the Maintainer until approval... and in cases where such ratio is neither determined nor notified..., the Company may determine such ratio at its discretion"* (Art. 4.8). No default percentage is stated publicly. Multiple PRs shown per issue in UI ("1 pull request", "3 pull requests" counters): https://web.archive.org/web/20260217085358/https://oss.issuehunt.io/issues
8. **UI state labels observed** on the tasks list: **"Funded"**, "N bounty requests", "N pull request(s)" (same issues-list capture). No other explicit state names ("accepted"/"in progress") are documented in public sources — see Unknowns.

## 2. Money movement

| Fact | Source / quote |
|---|---|
| Funds held by the **operator (BoostIO)**, not a named third-party escrow; terms never use the word "escrow". Company receives, holds (as Deposit), then disburses on approval/withdrawal request. | Terms Art. 4–5, https://web.archive.org/web/20261013194922/https://oss.issuehunt.io/terms |
| **Inbound rails**: Stripe card ("Debit remittance"), SWIFT wire, Ethereum crypto: *"The payment of the Deposit... shall be made by the Debit remittance provided by Stripe, remittance system provided by SWIFT, settlement using ETH"* (Art. 5.1). | same Terms |
| Processor fees netted out of top: *"the amount that remains after deducting the settlement fee from the amount actually remitted... shall be deemed to be the consideration"* (Art. 5.1). | same Terms |
| **Outbound rails**: same Stripe/SWIFT/ETH; *"In the event that remittance... made by settlement using ETH, the remittance... shall also be made by... ETH. The Company may deduct the fee, etc. required for such remittance"* (Art. 5.4). | same Terms |
| **No PayPal** on the OSS platform terms (not mentioned). New bug-bounty service pays *"money via bank or PayPal"* (landing). | https://issuehunt.io/ |
| **Platform fee: 10%** of funding consideration (see quote §1.2). | Terms Art. 4.1 |
| Bug-bounty side business: *"We will distribute 3% of company's fee to open source projects on IssueHunt"* (FAQ 01, 2022 bounty site). | https://web.archive.org/web/20221130140907/https://bounty.issuehunt.io/ |
| IssueHunt Fest sponsor money: *"70% of sponsored money will be distributed to the top open source projects listed on IssueHunt (30% of funds will be used to operate IssueHunt)"*. | https://raw.githubusercontent.com/IssueHunt/events/master/README.md |
| **Refunds**: none. *"The consideration paid by the Funding User... shall not be refunded regardless of the extinction of the Deposit or any other reason. In cases where the Service Agreement is terminated, all Deposit remaining at the time of termination shall be extinguished."* (Art. 4.4) | Terms |
| **Cancellation ≠ refund**: within 180 days and only if PR not yet approved, *"the Funding User may remit the cancelled amount of the Deposit to other Issues"* — balance transfer, not cash back (Art. 4.2). | Terms |

## 3. Review / acceptance model

- Maintainer-only approval: Art. 4.7 (above). Maintainer also controls *"provide the Company with a request of withdrawal of the Maintainer Consideration... or Contributor Consideration"* (Art. 4.5(ii)(iii)).
- Split percentages set by maintainer at approval; platform decides if omitted (Art. 4.8, quote §1.7). Payout is **maintainer-centric**: Deposit → maintainer, then contributor share via ratio — i.e., IssueHunt pays the maintainer, who "pays" the contributor through the platform.
- Contributor retains IP of their PR: *"the Intellectual Property Rights in and to the Pull Request shall belong to the Contributor"* (Art. 10.2).
- No public "resolve"-flow doc beyond approval/merge definitions; GitHub app marketplace listing is dead (see Dead URLs), so app install flow unverifiable publicly.

## 4. Dispute handling

- **No platform arbitration**: *"The Registered Users shall, with its full responsibility, treat and resolve all transactions, communications, disputes, etc.... In no event shall the Company be responsible or liable for them."* (Art. 12.6) | Terms
- Liability cap: *"limited to the total amount that the Company receives actually from the Registered User during the last three (3) months... or 1,000 Japanese Yen, whichever is the greater"* (Art. 12.9). | Terms
- Governing law Japan, exclusive jurisdiction **Tokyo District/Summary Court** (Art. 22); unresolved matters: *"resolved through good faith discussions"* (Art. 23). | Terms
- Bug-bounty service: rewards denied for *"out of scope, duplicate and so on"* reports; companies triage; no arbitration clause read publicly. | https://issuehunt.io/ FAQ

## 5. Timers / deadlines (all stated)

| Timer | Value | Source |
|---|---|---|
| Deposit validity (bounty expiration) | **180 days** from purchase, "extinguished" after | Terms Art. 4.3 |
| Funding cancellation window | **180 days** after remittance, only if PR not approved | Art. 4.2 |
| No-acceptance payout to maintainer | after **180 days** elapsed | Art. 4.9 |
| Withdrawal request window | **365 days after approval**; company may force payment after that on its own request | Art. 5.4, 5.5 |
| Failed payment → abandonment deemed | no time given | Art. 5.7 |
| Account inactivity cancellation | unused ≥ **1 year** + no response to notices | Art. 11.1(11) |
| Company-initiated account cancellation | **30 days** prior notice | Art. 11.3 |
| Liability look-back | last **3 months** of payments (or ¥1,000) | Art. 12.9 |
| Confidentiality survival | **5 years** after termination | Art. 21 |
| Bug-bounty payout timing | "Company will pay on triage or once the issue has been fixed" — no numeric SLA | https://issuehunt.io/ |

## 6. Explicit unknowns (NOT stated in any public doc found — do not guess)

- **Minimum withdrawal threshold** for OSS platform (nowhere; terms are request-based, no floor).
- Exact withdrawal fee amounts ("The Company may deduct the fee" — amount not published).
- Default **Contributor Ratio** percentage (only "maintainer determines / Company discretion").
- UI workflow states beyond "Funded"/PR counters (login-gated app; no public docs of internal states like "in progress/accepted").
- Whether maintainer keeps Deposit if issue closed/rejected early (only 180-day rule documented).
- Funding **goal/deadline per issue** feature details ("bounty requests" counter exists in UI, mechanics undocumented publicly).
- New bug-bounty platform fee % / hunter payout schedule (issuehunt.jp/terms is a JS-rendered SPA; text unreadable without browser — see Dead URLs).
- Payout processing duration after withdrawal request.
- Any moderation/dispute-resolution procedure for OSS bounties.

## 7. Dead / broken URLs observed

| URL | Status | Evidence |
|---|---|---|
| https://issuehunt.io/terms-of-service | empty output (SPA marketing site; no OSS terms) | fetched 2026-10-29 |
| https://issuehunt.jp/terms | JS-only Nuxt SPA, content not readable | fetched; HTML shell only |
| https://spectrum.chat/issuehunt/general/faq-summary~... (official "FAQ" footer link) | **dead** — Spectrum shut down, Wayback capture redirects to github.com/features/discussions; also tracked by users: *"FAQ on your website is 404"* | https://web.archive.org/web/20240324210631/https://spectrum.chat/issuehunt/general/faq-summary~6a4aa913-92f8-4ad8-bf85-1f35ca25319c ; https://github.com/IssueHunt/readme/issues/7 |
| https://github.com/marketplace/issuehunt | 404 | fetched |
| https://github.com/apps/issuehunt-io | 404 | fetched |
| https://issuehunt.io/repos/34526884 (AntDesign link in org README) | redirects to oss.issuehunt.io → **HTTP 502** at fetch time | fetched |
| https://medium.com/issuehunt | HTTP 403 to bot (not confirmed dead for humans) | fetched |

## 8. Key primary sources (for re-check)

- Terms of Use (OSS, full text): https://oss.issuehunt.io/terms — Wayback copy: https://web.archive.org/web/20261013194922/https://oss.issuehunt.io/terms
- OSS landing "how it works": https://web.archive.org/web/20260120034659/https://oss.issuehunt.io/
- Tasks list (state labels): https://web.archive.org/web/20260217085358/https://oss.issuehunt.io/issues
- Fest 2018 FAQ (payout flow, fiat-only for event prizes): https://web.archive.org/web/20210924152905/https://fest2018.issuehunt.io/faq/
- Bounty-service landing (bank/PayPal, 3% OSS redistribution): https://web.archive.org/web/20221130140907/https://bounty.issuehunt.io/
- Org README (mission/description): https://raw.githubusercontent.com/IssueHunt/readme/master/README.md
- Events README (70/30 Fest split): https://raw.githubusercontent.com/IssueHunt/events/master/README.md
- Current product: https://issuehunt.io/ ; JP company site https://issuehunt.co.jp/
