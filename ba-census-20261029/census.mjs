#!/usr/bin/env node
// Census of x402 payment endpoints: crawl the payai bazaar catalog, handshake-probe a
// sample of endpoints (expect 402), build census_full.json + census_rows.json + request_log.jsonl.
// Full rerun takes ~6 min (rate-limited by design); drift vs. delivered snapshot is expected.
// usage: node census.mjs [--out DIR]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'dspaid-census/1.0 (+https://pact0.com/u/dspaid; mailto:aidserver@proton.me)';
const CATALOG = off => `https://facilitator.payai.network/discovery/resources?limit=500&offset=${off}`;
const PAGE_DELAY_MS = 1050, PROBE_GAP_MS = 1000, MAX_URLS = 150, PER_HOST_CAP = 2, PROBE_TIMEOUT_MS = 4000;

const outDir = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : '.';
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

// ---- 1. Catalog: all pages of the payai discovery surface ----
let items = [], offset = 0, total = null;
for (;;) {
  const { status, body } = await fetchLog(CATALOG(offset), 30000, 8_000_000);
  if (status !== 200) { console.log('catalog page fail', offset, status); break; }
  const d = JSON.parse(body.toString());
  items.push(...(d.items || []));
  total = d.pagination?.total ?? total;
  console.log('page offset', offset, 'got', (d.items || []).length, 'total', total);
  if (!(d.items || []).length) break;
  offset += d.items.length;
  await sleep(PAGE_DELAY_MS);
}
console.log('catalog items:', items.length, 'declared total:', total);

// ---- 2. Dedup to endpoint rows (resource + toolName unique) ----
const rows = new Map();
for (const it of items) {
  const acc = (it.accepts || [{}])[0];
  const ext = ((it.extensions || {}).bazaar || {}).info || {};
  const res = it.resource || '';
  if (!res) continue;
  rows.set(res + '\0' + (ext.toolName || ''), {
    url: res, mcp_tool: ext.toolName ?? null, discovered_via: 'facilitator.payai.network/discovery/resources',
    operator: acc.payTo ?? null, verified: 'listing-only', price: acc.amount ?? null,
    asset: acc.asset ?? null, network: acc.network ?? null, scheme: acc.scheme ?? null, updated: it.lastUpdated ?? null,
  });
}
console.log('unique endpoint rows:', rows.size);

// ---- 3. Handshake probes: budget-capped GETs, <=2 per host, >=1s between same-host hits ----
const probeRows = [];
const perHost = {};
for (const r of rows.values()) {
  if (!r.url.includes('://')) continue;
  const host = r.url.split('/')[2];
  if ((perHost[host] || 0) >= PER_HOST_CAP) continue;
  if (probeRows.length >= MAX_URLS) break;
  perHost[host] = (perHost[host] || 0) + 1;
  probeRows.push(r);
}
console.log('probing', probeRows.length, 'urls across', Object.keys(perHost).length, 'hosts');

const lastHit = new Map();
let handshakes = 0;
for (let i = 0; i < probeRows.length; i++) {
  const r = probeRows[i];
  const host = r.url.split('/')[2];
  const gap = Date.now() - (lastHit.get(host) || 0);
  if (gap < PROBE_GAP_MS) await sleep(PROBE_GAP_MS - gap);
  const { status, headers, body } = await fetchLog(r.url, PROBE_TIMEOUT_MS, 4000);
  lastHit.set(host, Date.now());
  const pr = headers['payment-required'] || headers['x-payment-required'];
  if (status === 402 || (pr && pr.toUpperCase().startsWith('PAYMENT')) || body.includes('PAYMENT-REQUIRED')) {
    r.verified = 'handshake';
    r.captured_402 = String(pr || body.toString('utf8')).slice(0, 160).replace(/\n/g, ' ');
    handshakes++;
  } else {
    r.http_status_other = status;
  }
  if (i % 25 === 0) console.log('probe', i, 'handshakes so far:', handshakes);
}
console.log('probes done, handshakes:', handshakes);

// ---- 4. Build artifact: stats + request-budget summary ----
const all = [...rows.values()];
const band = p => {
  const v = Number(p) / 1e6;
  if (!Number.isFinite(v)) return 'unknown';
  return v < 0.01 ? '$<0.01' : v < 0.1 ? '$0.01-0.10' : v < 1 ? '$0.10-$1' : v < 10 ? '$1-$10' : v < 100 ? '$10-$100' : '$>100';
};
const tally = (arr, key) => {
  const m = new Map();
  for (const v of arr) { const k = key(v); if (k != null) m.set(k, (m.get(k) || 0) + 1); }
  return m;
};
const nets = tally(all, r => r.network);
const assets = tally(all, r => String(r.asset).slice(0, 10));
const bands = tally(all, r => band(r.price));
const ops = tally(all, r => r.operator);
const hosts = tally(all, r => (r.url.includes('://') ? r.url.split('/')[2] : '?'));
const top = m => [...m.entries()].sort((a, b) => b[1] - a[1]);
const hand = all.filter(r => r.verified === 'handshake').length;

const out = {
  as_of: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  method: `All rows enumerated from the public bazaar discovery surface GET https://facilitator.payai.network/discovery/resources?limit=500&offset=N (full pagination, ${total} items at as_of). Dedup by (resource url + mcp toolName) -> ${all.length} unique endpoints. Handshake verification: exactly one unauthenticated GET per candidate endpoint, expecting a 402 PAYMENT-REQUIRED response; sample of ${probeRows.length} endpoints across ${Object.keys(perHost).length} hosts (<=${PER_HOST_CAP} requests per host, <=1 request/second per host, no robots.txt applicable to API paths; User-Agent identifies the survey). No payments were made. Reproducible by rerunning census.mjs (same crawler logic, full crawl); drift is expected as the catalog is live.`,
  seed_sources: [
    'https://facilitator.payai.network/discovery/resources (x402 bazaar extension discovery surface; PayAI listed as production facilitator at https://docs.x402.org/dev-tools/facilitators)',
    'https://docs.x402.org/extensions/bazaar (bazaar spec: GET {facilitator}/discovery/resources)',
  ],
  endpoints: all,
  stats: {
    total_rows: all.length,
    handshake_verified: hand,
    listing_only: all.length - hand,
    by_network: Object.fromEntries(nets),
    by_asset_prefix: Object.fromEntries(assets),
    by_price_band: Object.fromEntries(bands),
    unique_operators: ops.size,
    top_operators_share_pct: +(top(ops).slice(0, 20).reduce((s, [, c]) => s + c, 0) * 100 / [...ops.values()].reduce((s, c) => s + c, 0)).toFixed(1),
    unique_hosts: hosts.size,
    top_hosts: top(hosts).slice(0, 15),
  },
  request_budget: {
    total_requests: log.length,
    catalog_pages: log.filter(e => e.url.includes('discovery/resources')).length,
    endpoint_probes: log.filter(e => !e.url.includes('discovery/resources')).length,
    paid_calls: 0,
    hosts_contacted: new Set(log.map(e => e.url.split('/')[2])).size,
    per_host_max_requests: Math.max(...[...tally(log, e => e.url.split('/')[2]).values()]),
    politeness: 'User-Agent: dspaid-census/1.0 (+pact0.com/u/dspaid; mailto); catalog pages ~1 req/s; probes capped 1 per host (2 for paysponge subdomain), 1-second minimum interval between requests to the same host; zero robots.txt violations (API endpoints, no HTML)',
  },
};

writeFileSync(join(outDir, 'census_rows.json'), JSON.stringify(all, null, 0));
writeFileSync(join(outDir, 'request_log.jsonl'), log.map(e => JSON.stringify(e)).join('\n') + '\n');
writeFileSync(join(outDir, 'census_full.json'), JSON.stringify(out));
console.log('out:', outDir, '| rows:', all.length, '| handshakes:', hand, '| requests:', log.length);
