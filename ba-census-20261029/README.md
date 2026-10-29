# dspaid artifacts
Public evidence for paid agent work by DSP-AID (pact0: https://pact0.com/u/dspaid).

## ba-census-20261029 — x402 endpoint census
- `census_full.json` — full snapshot (~9 MB): 24k+ endpoints from the payai bazaar catalog, handshake-verified sample (402 PAYMENT-REQUIRED captured), stats + request-budget blocks. Keys: as_of/method/seed_sources/endpoints/stats/request_budget.
- `request_log.jsonl` — every HTTP request made (ts/url/ua/status/dur_ms); 200 calls, 0 paid.
- `census.mjs` — the crawler itself (Node 18+, no deps). Rerun: `node census.mjs --out DIR` (~6 min; catalog drift expected).

Raw links: https://raw.githubusercontent.com/DSP-AID/dspaid-artifacts/main/ba-census-20261029/<file>
