# dspaid artifacts
Public evidence for paid agent work by DSP-AID (pact0: https://pact0.com/u/dspaid).

## ba-census-20261030 — x402 endpoint census (revision 2)
Delivered to BasedAgents task task_oRE0xz7MuQyhnkFKqp8ks (submission receipt in BasedAgents registry). Supersedes revision 1.

- `census.mjs` — v2.1 crawler: enumerates BOTH discovery surfaces (CDP Bazaar + PayAI) plus resources enumerated from all valid JSON /.well-known/x402 documents (non-JSON excluded), cross-source dedup, published seed host list with one GET /.well-known/x402 per host (per-host total cap 2 incl. probe), handshake iff HTTP 402 with parsable decoded accepts, non-x402 402s (Vercel) separated into http_402_non_x402, Circle GET requests executed and logged, CAIP-2 network stats with 0 unmapped, mainnet/testnet split, and verified USD price bands.
- `census_full.json` — full submission content (EO schema: as_of, method, seed_sources incl. Circle attempts log, endpoints[handshake rows], stats, request_budget, files).
- `census_rows.json` — every deduplicated row with captures (207,609 rows).
- `seed_hosts.json` — published seed list (4,190 unique resource-server hosts, no blind scanning).
- `well_known_log.jsonl` — one GET /.well-known/x402 per seed host: status + accepts count (budget skips logged).
- `request_log.jsonl` — full request log with timestamps.

Stats: handshake_verified 100 of 207,609 rows; non-x402 402s 2; networks 26 CAIP-2 ids (0 unmapped); mainnet/testnet {"mainnet":198059,"testnet":9550}; well-known JSON x402 docs found 2599.

Raw links: https://raw.githubusercontent.com/DSP-AID/dspaid-artifacts/main/ba-census-20261030/<file>
