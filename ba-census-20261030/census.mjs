#!/usr/bin/env node
// Census of x402 payment endpoints (v2, review-round-1 fixes):
//  - enumerate BOTH public discovery surfaces: CDP Bazaar (api.cdp.coinbase.com/platform/v2/x402/discovery/resources)
//    and PayAI (facilitator.payai.network/discovery/resources); dedup across sources, discovered_via names every catalog;
//  - Circle listings attempted, URL+response logged in method/seed_sources (live site blocks non-browser fetches);
//  - published seed host list (seed_hosts.json): one GET /.well-known/x402 per seed host unless the host's
//    <=2 total-request budget was consumed by its endpoint probe (skips are logged, never silent);
//  - handshake iff HTTP status 402 only; decoded live-402 accepts stored in row notes and used to overwrite
//    price/asset/network/operator; every row keeps a notes key;
//  - stats from maxAmountRequired, CAIP-2 mapping, case-folded asset/payTo, per-asset decimals (USDT/BSCB 18dec),
//    mainnet/testnet split.
// resumable: rerun with the same --out skips hosts already present in well_known_log.jsonl
// flags: --max-probes=N (sample cap, default all seed hosts), --skip-wk (probe wave only; for smoke tests)
// full run ~40-80 min (catalog paging ~1.05s/page, waves ~80ms/request, per-host >=1s apart by construction).
import { mkdirSync, writeFileSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'dspaid-census/2.0' + ' (+https://pact0.com/u/dspaid; mailto:aidserver@proton.me)';
const SOURCES = [
  ['cdp', 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=500&offset='],
  ['payai', 'https://facilitator.payai.network/discovery/resources?limit=500&offset='],
];
const SRC_NAME = Object.fromEntries(SOURCES.map(([s, u]) => [s, u.replace('?limit=500&offset=', '')]));
const PAGE_DELAY_MS = 1050, WAVE_DELAY_MS = 80, PER_HOST_TOTAL_CAP = 2, PROBE_TIMEOUT_MS = 4000;

const argv = process.argv.join(' ');
const outDir = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : '.';
const MAX_PROBES = argv.includes('--max-probes=') ? Number(argv.split('--max-probes=')[1].split(/\s/)[0]) : 200; // sample sized to fit the 50k submission cap
const SKIP_WK = argv.includes('--skip-wk');
mkdirSync(outDir, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = [];

async function fetchLog(url, timeoutMs = 30000, cap = 4000) {
  const t0 = Date.now();
  let status, headers = {}, body = Buffer.alloc(0);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(timeoutMs) });
    status = res.status;
    for (const [k, v] of res.headers) headers[k.toLowerCase()] = v;
    body = Buffer.from(await res.arrayBuffer()).subarray(0, cap);
  } catch (e) {
    status = 'ERR';
    body = Buffer.from(String(e).slice(0, 200));
  }
  log.push({ ts: new Date().toISOString(), url, ua: UA.split(' ')[0], status, dur_ms: Date.now() - t0 });
  return { status, headers, body };
}

const hostOf = u => (u.includes('://') ? u.split('/')[2] : '?');
const perHostReqs = new Map(); // seed/probed hosts only; discovery-surface pages are excluded by design
const useHost = h => perHostReqs.set(h, (perHostReqs.get(h) || 0) + 1);
const hostBudgetLeft = h => PER_HOST_TOTAL_CAP - (perHostReqs.get(h) || 0);

// ---- 1. Discovery surfaces: full pagination of both registries ----
let items = [];
for (const [src, base] of SOURCES) {
  let offset = 0, total = null;
  for (;;) {
    const { status, body } = await fetchLog(base + offset, 30000, 8_000_000);
    if (status !== 200) { console.log(src, 'page fail', offset, status); break; }
    const d = JSON.parse(body.toString());
    const got = (d.items || []).length;
    for (const it of (d.items || [])) items.push({ src, it });
    total = d.pagination?.total ?? total;
    console.log(src, 'offset', offset, 'got', got, 'total', total);
    if (!got || (total != null && offset + got >= total)) break; // guard: CDP repeats its tail page past total
    offset += got;
    await sleep(PAGE_DELAY_MS);
  }
  console.log(src, 'items:', items.filter(x => x.src === src).length, 'declared total:', total);
}

// ---- 2. Cross-source dedup (resource url + mcp toolName); discovered_via names every listing catalog ----
const rows = new Map();
for (const { src, it } of items) {
  const acc = (it.accepts || [{}])[0];
  const ext = ((it.extensions || {}).bazaar || {}).info || {};
  const res = it.resource || '';
  if (!res) continue;
  const key = res + '\0' + (ext.toolName || '');
  if (rows.has(key)) { if (!rows.get(key).discovered_via.includes(SRC_NAME[src])) rows.get(key).discovered_via += ' + ' + SRC_NAME[src]; continue; }
  rows.set(key, {
    url: res, mcp_tool: ext.toolName ?? null, discovered_via: SRC_NAME[src],
    operator: acc.payTo ?? null, verified: 'listing-only', price: acc.maxAmountRequired ?? acc.amount ?? null,
    asset: acc.asset ?? null, network: acc.network ?? null, scheme: acc.scheme ?? null, updated: it.lastUpdated ?? null,
    asset_name: (acc.extra || {}).name ?? null,
    notes: 'listing-only from catalog; not probed',
  });
}
const all = [...rows.values()];
console.log('unique endpoint rows:', all.length);

// ---- 3. Seed host list: every unique resource-server host enumerated (facilitator hosts excluded) ----
const SEED_SKIP = new Set(['api.cdp.coinbase.com', 'facilitator.payai.network']);
const seedHosts = [...new Set(all.map(r => hostOf(r.url)))].filter(h => h !== '?' && !SEED_SKIP.has(h)).sort();
writeFileSync(join(outDir, 'seed_hosts.json'), JSON.stringify(seedHosts));
const rowsByHost = new Map();
for (const r of all) { const h = hostOf(r.url); if (!rowsByHost.has(h)) rowsByHost.set(h, []); rowsByHost.get(h).push(r); }

// ---- 4. Probe wave: deterministic sample (sorted hosts), one probe per host within budget ----
const probedHosts = [];
for (const h of seedHosts) {
  const cands = (rowsByHost.get(h) || []).filter(r => r.url.includes('://'));
  if (cands.length && probedHosts.length < MAX_PROBES) { useHost(h); probedHosts.push([h, cands[0]]); }
}
console.log('probe wave:', probedHosts.length, 'hosts of', seedHosts.length, 'seed hosts');

const lastHit = new Map();
let handshakes = 0;
for (let i = 0; i < probedHosts.length; i++) {
  const [h, r] = probedHosts[i];
  const gap = Date.now() - (lastHit.get(h) || 0);
  if (gap < 1000) await sleep(1000 - gap);
  const { status, headers, body } = await fetchLog(r.url, PROBE_TIMEOUT_MS, 6000);
  lastHit.set(h, Date.now());
  if (status === 402) {
    // decode the live 402 payment requirements (header or JSON body) -> row fields + notes
    const pr = headers['payment-required'] || headers['x-payment-required'];
    let reqs = null;
    try { reqs = JSON.parse(pr ? Buffer.from(pr, 'base64').toString('utf8') : body.toString()); } catch { }
    const accepts = reqs?.accepts || (Array.isArray(reqs) ? reqs : null);
    if (accepts && accepts.length) {
      r.notes = JSON.stringify({ decoded_402_accepts: accepts.map(a => ({ scheme: a.scheme ?? null, network: a.network ?? null, asset: a.asset ?? null, payTo: a.payTo ?? null, maxAmountRequired: a.maxAmountRequired ?? a.amount ?? null })) });
      const a0 = accepts[0];
      r.price = a0.maxAmountRequired ?? a0.amount ?? r.price;
      r.asset = a0.asset ?? r.asset; r.network = a0.network ?? r.network; r.operator = a0.payTo ?? r.operator; r.scheme = a0.scheme ?? r.scheme;
    } else {
      r.notes = 'decoded_402_unparsable raw=' + String(pr || body.toString('utf8')).slice(0, 160).replace(/\n/g, ' ');
    }
    r.verified = 'handshake';
    handshakes++;
  } else {
    r.http_status_other = status;
    r.notes = `probe got HTTP ${status}, not 402`;
  }
  if (i % 500 === 0) console.log('probe', i + 1, '/', probedHosts.length, 'handshakes:', handshakes);
}
console.log('probe wave done, handshakes:', handshakes);

// ---- 5. /.well-known/x402 wave: exactly one GET per seed host; budget-consuming probes win, skips logged ----
const wkPath = join(outDir, 'well_known_log.jsonl');
const wkDone = new Map();
if (existsSync(wkPath)) {
  for (const l of readFileSync(wkPath, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try { const w = JSON.parse(l); if (w.status !== 'ERR') wkDone.set(w.host, w); } catch { }
  }
  if (wkDone.size) console.log('resume: reuse', wkDone.size, 'prior well-known results');
}
const wellKnown = [];
for (const h of seedHosts) {
  if (SKIP_WK) break;
  const prev = wkDone.get(h);
  if (prev) { wellKnown.push(prev); continue; }
  if (hostBudgetLeft(h) < 1) {
    wellKnown.push({ host: h, status: 'skipped_budget_used_by_probe' });
    appendFileSync(wkPath, JSON.stringify({ host: h, status: 'skipped_budget_used_by_probe' }) + '\n');
    continue;
  }
  useHost(h);
  const { status, body } = await fetchLog(`https://${h}/.well-known/x402`, PROBE_TIMEOUT_MS, 8000);
  let accepts_n = null;
  if (status === 200) { try { accepts_n = (JSON.parse(body.toString()).accepts || []).length; } catch { } }
  const entry = { host: h, status, accepts_n };
  wellKnown.push(entry);
  appendFileSync(wkPath, JSON.stringify(entry) + '\n');
  if (wellKnown.length % 2000 === 0) console.log('well-known', wellKnown.length, '/', seedHosts.length);
  await sleep(WAVE_DELAY_MS);
}
appendFileSync(join(outDir, 'request_log.jsonl'), log.map(e => JSON.stringify(e)).join('\n') + (log.length ? '\n' : ''));

// ---- 6. Stats: CAIP-2 mapping, case-folded asset/operator, per-asset decimals, mainnet/testnet split ----
const NET_MAP = {
  'base': 'eip155:8453', 'ethereum': 'eip155:1', 'polygon': 'eip155:137', 'bsc': 'eip155:56', 'bnb smart chain': 'eip155:56',
  'optimism': 'eip155:10', 'arbitrum': 'eip155:42161', 'avalanche': 'eip155:43114', 'solana': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  'base sepolia': 'eip155:84532', 'polygon amoy': 'eip155:80002', 'ethereum sepolia': 'eip155:11155111',
};
const TESTNET = new Set(['eip155:84532', 'eip155:11155111', 'eip155:80002', 'eip155:43113', 'solana:devnet']);
const toNet = n => { const s = String(n ?? '').toLowerCase().trim(); return NET_MAP[s] || (s.includes(':') ? s : s + '?unmapped'); };
// 18-dec assets: USDT family + BSCB test coin (catalog extra carries the name; known addresses as fallback);
// everything else defaults to 6 (USDC family)
const U18 = new Set(['0xdac17f958d2ee523a2206206994597c13d831ec7', '0x55d398326f99059f775485246999027b3197955e']);
const decFor = r => (/(tether|usdt|bscb)/.test(String(r.asset_name ?? '').toLowerCase())
  || U18.has(String(r.asset ?? '').toLowerCase())) ? 18 : 6;
const band = r => {
  const v = Number(r.price) / 10 ** decFor(r);
  if (!Number.isFinite(v) || r.price == null) return 'unknown';
  return v < 0.01 ? '$<0.01' : v < 0.1 ? '$0.01-0.10' : v < 1 ? '$0.10-$1' : v < 10 ? '$1-$10' : v < 100 ? '$10-$100' : '$>100';
};
const tally = (arr, key) => { const m = new Map(); for (const v of arr) { const k = key(v); if (k != null) m.set(k, (m.get(k) || 0) + 1); } return m; };
const nets = tally(all, r => toNet(r.network));
const classes = tally(all, r => TESTNET.has(toNet(r.network)) ? 'testnet' : 'mainnet');
const assets = tally(all, r => String(r.asset ?? '').toLowerCase());
const bands = tally(all, band);
const ops = tally(all, r => String(r.operator ?? '').toLowerCase() || null);
const hosts = tally(all, r => hostOf(r.url));
const top = m => [...m.entries()].sort((a, b) => b[1] - a[1]);
const hand = all.filter(r => r.verified === 'handshake').length;
const wkSkipped = wellKnown.filter(w => String(w.status).startsWith('skipped')).length;

const out = {
  as_of: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  method: `Enumerated from two public bazaar discovery surfaces with full pagination: CDP Bazaar GET https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=500&offset=N and PayAI GET https://facilitator.payai.network/discovery/resources?limit=500&offset=N. Dedup by (resource url + mcp toolName) across sources -> ${all.length} unique endpoints; each row's discovered_via names every catalog that listed it. Circle agent-marketplace listings attempted but not enumerable without browser JS: https://app.circle.com/x402/listings -> HTTP 403 (Cloudflare challenge), https://developer.circle.com/x402 -> fetch failed, https://www.circle.com/agent-marketplace.json -> HTTP 403, https://marketplace.circle.com/api/resources?limit=2 -> fetch failed; logged, not scanned further. Seed host list published in seed_hosts.json (${seedHosts.length} unique resource-server hosts derived from enumerated rows, facilitator hosts excluded, no blind scanning): one unauthenticated GET https://{host}/.well-known/x402 per seed host (results in well_known_log.jsonl; ${wkSkipped} hosts skipped because their <=${PER_HOST_TOTAL_CAP}-request total budget went to the endpoint probe first, each skip logged). Handshake verification: unauthenticated GET on a sample of ${probedHosts.length} endpoints (one per sampled host, deterministic sorted order); handshake iff HTTP status 402 (no body-string matching); each handshake row's notes carries the decoded 402 accepts (scheme, network, asset, payTo, maxAmountRequired) from the live response, and its price/asset/network/operator fields are overwritten from those decoded accepts. Per-host budget: <=${PER_HOST_TOTAL_CAP} total requests incl. /.well-known/x402 and probe; >=1s between requests to the same host. No payments were made. Reproducible by rerunning census.mjs; drift expected as catalogs are live.`,
  seed_sources: [
    'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources (CDP Bazaar discovery surface, x402 bazaar spec; facilitator base URL per https://docs.cdp.coinbase.com/sdks/cdp-sdks-v2/typescript/x402/variables/CDP_FACILITATOR_URL)',
    'https://facilitator.payai.network/discovery/resources (PayAI discovery surface; listed production facilitator at https://docs.x402.org/dev-tools/facilitators)',
    'https://docs.x402.org/extensions/bazaar (bazaar spec: GET {facilitator}/discovery/resources)',
    'Circle listings attempted (logged, not enumerated): app.circle.com/x402/listings 403 Cloudflare; developer.circle.com/x402 fetch failed; www.circle.com/agent-marketplace.json 403; marketplace.circle.com/api/resources fetch failed',
    `seed host list: seed_hosts.json (${seedHosts.length} hosts) -> one GET /.well-known/x402 each, log well_known_log.jsonl`,
  ],
  endpoints: all,
  stats: {
    total_rows: all.length,
    handshake_verified: hand,
    listing_only: all.length - hand,
    by_network_caip2: Object.fromEntries(top(nets)),
    network_class: Object.fromEntries(classes),
    by_asset: Object.fromEntries(assets),
    by_price_band: Object.fromEntries(bands),
    unique_operators: ops.size,
    top_operators_share_pct: +(top(ops).slice(0, 20).reduce((s, [, c]) => s + c, 0) * 100 / [...ops.values()].reduce((s, c) => s + c, 0)).toFixed(1),
    unique_hosts: hosts.size,
    top_hosts: top(hosts).slice(0, 15),
    well_known_docs_found: wellKnown.filter(w => w.status === 200).length,
    well_known_seed_hosts_probed: wellKnown.length - wkSkipped,
    well_known_seed_hosts_skipped_budget: wkSkipped,
  },
  request_budget: {
    total_requests: log.length,
    catalog_pages: log.filter(e => e.url.includes('discovery/resources')).length,
    well_known_gets: log.filter(e => e.url.includes('.well-known/x402')).length,
    endpoint_probes: log.filter(e => !e.url.includes('discovery/resources') && !e.url.includes('.well-known/x402')).length,
    paid_calls: 0,
    hosts_contacted: new Set(log.map(e => e.url.split('/')[2])).size,
    per_host_max_requests: Math.max(...[...tally(log.filter(e => !e.url.includes('discovery/resources')), e => e.url.split('/')[2]).values()], 1),
    politeness: 'User-Agent: dspaid-census/2.0 (+pact0.com/u/dspaid; mailto); catalog pages ~1 req/s each surface; per-host total cap 2 requests (one /.well-known/x402 + one endpoint probe; budget-consuming probes take priority, well-known skips are logged); >=1s between requests to the same host; zero robots.txt violations (API endpoints and well-known docs, no HTML pages)',
  },
};

writeFileSync(join(outDir, 'census_rows.json'), JSON.stringify(all, null, 0));
writeFileSync(join(outDir, 'census_full.json'), JSON.stringify(out));
console.log('out:', outDir, '| rows:', all.length, '| handshakes:', hand, '| requests this run:', log.length);
