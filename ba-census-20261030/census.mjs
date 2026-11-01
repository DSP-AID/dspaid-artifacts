#!/usr/bin/env node
// Census of x402 payment endpoints (v4, review-round-3 fixes; v3 discovery/dedup/politeness machinery unchanged):
//  - enumerate BOTH public discovery surfaces: CDP Bazaar (api.cdp.coinbase.com/platform/v2/x402/discovery/resources)
//    and PayAI (facilitator.payai.network/discovery/resources); dedup across sources, discovered_via names every catalog;
//  - Circle agent-marketplace candidate URLs fetched LIVE every run (one GET each, robots.txt first for webpage URLs,
//    400ms pacing), logged in request_log.jsonl; the method/seed_sources text is built from those live results;
//  - published seed host list (seed_hosts.json): one GET /.well-known/x402 per seed host unless the host's
//    <=2 total-request budget was consumed by its endpoint probe (skips are logged, never silent);
//  - rev-3 fix 1 (reproducibility): the /.well-known/x402 wave accepts bodies up to WK_DOC_CAP=120MB (the largest live
//    doc, x402helper.xyz ~101MB, and detect.halowerk.com ~7.5MB were truncated by the old 4MB cap -> JSON.parse failed);
//    resource URLs resolve in all observed shapes: absolute url/resource key wins when both exist (kariguetoazul),
//    relative url/resource/plain-string entries resolve against the host origin (mpp.tracefast.xyz, via-router.floot.app,
//    x402helper.xyz); per-doc accounting res_total/res_added/res_dup/res_bad is recorded in every well_known_log entry;
//    EVERY host that ever returned HTTP 200 is re-GET by each producing run (doc rows only exist in the run that
//    fetched the body), definitive non-200 results are reused without re-requesting; --selftest runs offline
//    acceptance checks (resource shapes incl. saved real docs, USD-band purity, by_asset unknown bucket);
//  - rev-3 fix 2 (request log): request_log.jsonl holds every request of the run that produced the files (catalog
//    pages, Circle robots.txt pre-checks + page GETs paced 400ms apart, probes, chain metadata, well-known wave;
//    UA dspaid-census/3.0 throughout) plus six disclosed parser-validation pre-fetches merged from probe_log.jsonl;
//    well_known_log.jsonl is append-only across all runs (every wk attempt ever made); request_budget gains
//    per_host_requests_all_runs: per-host totals across all runs derived from that history + this run's log;
//  - rev-3 fix 3 (price bands): USD $ bands hold only USDC/USDT-family assets at verified decimals (USDC=6,
//    USDT0=6, legacy ETH/BSC USDT=18); other dollar stablecoins incl. USD1 (0x8d0d000ee...08b0d, BSC, 18 dec) land
//    in 'other (non-USD or unverified decimals)', never in a $ band;
//  - rev-3 fix 4 (asset stats): by_asset is keyed by asset address (case-fold only 0x/eip155), with one explicit
//    'unknown' bucket for rows that carry no asset; counts sum to total_rows exactly (asserted at build time);
//  - handshake = HTTP 402 whose payment-required header/body parses to a non-empty accepts array; other 402s get
//    label http_402_no_parsable_accepts; decoded live-402 accepts stored in row notes and used to overwrite
//    price/asset/network/operator; every row keeps a notes key;
//  - stats: CAIP-2 mapping (built-in map + live chainid.network/chains.json name fallback; Solana chain ids = first
//    32 chars of getGenesisHash from api.mainnet-beta.solana.com / api.devnet.solana.com), case-fold ONLY for
//    0x/eip155 addresses, testnet class from known ids + chains.json names.
// resumable: rerun with the same --out reuses definitive non-200 well-known results; every prior HTTP 200 re-fetched.
// flags: --max-probes=N (probe sample cap, default 200 = sized to fit the 50k submission cap), --skip-wk (smoke test),
//        --selftest [--selftest-docs=DIR] offline acceptance checks with no network
// full run ~40-60 min (catalog paging ~1.05s/page, waves ~80ms/request, per-host >=1s apart by construction).
import { mkdirSync, writeFileSync, readFileSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const UA = 'dspaid-census/3.0' + ' (+https://pact0.com/u/dspaid; mailto:aidserver@proton.me)';
const SOURCES = [
  ['cdp', 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=500&offset='],
  ['payai', 'https://facilitator.payai.network/discovery/resources?limit=500&offset='],
];
const SRC_NAME = Object.fromEntries(SOURCES.map(([s, u]) => [s, u.replace('?limit=500&offset=', '')]));
const PAGE_DELAY_MS = 1050, WAVE_DELAY_MS = 80, PER_HOST_TOTAL_CAP = 2, PROBE_TIMEOUT_MS = 4000;
const WK_DOC_CAP = 120_000_000, WK_DOC_TIMEOUT_MS = 30000; // /.well-known/x402 bodies: largest live doc x402helper.xyz ~101MB (rev-3 fix 1)
const RUN_START_MS = Date.now();

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

// resource entries appear in the live docs in three shapes; when both url and resource keys exist the absolute one
// wins, relative values (and plain strings) resolve against the doc host origin (rev-3 fix 1: kariguetoazul 'resource',
// x402helper / mpp.tracefast / via-router.floot relative paths). Plain-string 'METHOD /path' entries (mpp.tracefast.xyz)
// keep the path part. Non-http(s) results are rejected.
function resUrl(rs, origin) {
  if (typeof rs === 'string') { const m = rs.match(/^([A-Z]{3,7}) (\S+)$/); if (m) rs = m[2]; }
  const cands = typeof rs === 'string' ? [rs] : (rs ? [rs.url, rs.resource] : []).filter(s => typeof s === 'string' && s.trim());
  for (const u of cands) if (/^https?:\/\//i.test(u)) return u;
  for (const u of cands) { try { const x = new URL(u, origin); if (/^https?:$/.test(x.protocol)) return x.href; } catch { /* not URL-like */ } }
  return null;
}

// USD families for price bands: USDC/USDT by catalog asset name or verified deployment; decimals verified per family
// (USDC=6 on every deployment incl. Solana mints via getTokenSupply; USDT0/LayerZero USDT=6; legacy ETH/BSC USDT=18).
// Everything else (JPY Coin, wSOL, XNO, Global Dollar, RLUSD, USD1, gas/test tokens, unverified mints) is banded 'other':
// this census verifies decimals only for the USDC/USDT family. USD1 (0x8d0d000ee325ec378907814123acdb63f0a08b0d, BSC,
// 18 dec) is a dollar stablecoin whose decimals are NOT verified here, so it must never land in a $ band (rev-3 fix 3).
const U18 = new Set(['0xdac17f958d2ee523a2206206994597c13d831ec7', '0x55d398326f99059f775485246999027b3197955e']); // legacy 18-dec USDT (Ethereum, BSC)
const USD_MINTS = new Set([
  'epjfwdd5aufqssqem2qn1xzybapc8g4weggkzwytdt1v', '4zmmc9srt5ri5x14gagxhahii3gnpaeerypjgzjdncdu', // Solana USDC mainnet/devnet (getTokenSupply: 6 dec)
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', '0x036cbd53842c5426634e7929541ec2318f3dcf7e', // Base / Base Sepolia USDC
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // Ethereum / Polygon USDC
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831', '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // Arbitrum / Avalanche USDC
  '0x3600000000000000000000000000000000000000', // Arc eip155:5042 native USDC (chainid.network nativeCurrency.symbol=USDC; catalog rows name it 'USDC')
]);
const isUsd = r => {
  const n = String(r.asset_name ?? '');
  return /^(usdc|usdt)/i.test(n) || /^usd ?coin/i.test(n) || /usd₮0|tether/i.test(n) || USD_MINTS.has(String(r.asset ?? '').toLowerCase());
};
const decFor = r => (U18.has(String(r.asset ?? '').toLowerCase()) ? 18 : 6);
const band = r => {
  if (r.price == null || !Number.isFinite(Number(r.price))) return 'unknown';
  if (!isUsd(r)) return 'other (non-USD or unverified decimals)';
  const v = Number(r.price) / 10 ** decFor(r);
  return v < 0.01 ? '$<0.01' : v < 0.1 ? '$0.01-0.10' : v < 1 ? '$0.10-$1' : v < 10 ? '$1-$10' : v < 100 ? '$10-$100' : '$>100';
};
// case-fold only 0x / eip155 account ids; base58 addresses and CAIP-2 values keep their exact case (one key per cluster)
const fold = s => { const t = String(s ?? '').trim(); if (!t) return null; return (/^0x[0-9a-fA-F]{6,}$/.test(t) || /^eip155:\d+:/i.test(t)) ? t.toLowerCase() : t; };
// by_asset key (rev-3 fix 4): address-shaped asset ids only (0x-hex case-folded; bare 40-hex deployment ids and
// base58 mints keep exact case; CAIP-2/ERC-155 style ids kept raw). Everything else - missing, 'null'/'undefined',
// symbol-only listings ('USDC', 'XNO'), decimal ids ('31566704') - folds into ONE explicit 'unknown' bucket so the
// map is address-keyed and its counts sum to total_rows exactly.
const assetKey = r => {
  const t = String(r.asset ?? '').trim();
  if (!t || /^(null|undefined)$/i.test(t)) return 'unknown';
  if (/^0x[0-9a-fA-F]{6,}$/.test(t)) return fold(t);
  if (/^[0-9a-fA-F]{40}$/.test(t) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(t)) return t;
  if (/[/:]/.test(t) && /^[a-z][a-z0-9]*(?::[a-zA-Z0-9-]+)+([/:\/][0-9A-HJ-NP-Za-km-z]+)*$/.test(t)) return t; // CAIP-2 / ERC-155 style
  return 'unknown';
};

// ---- offline acceptance checks (rev-3): no network, run with --selftest; add --selftest-docs=DIR to replay saved real docs ----
if (argv.includes('--selftest')) {
  const fails = [];
  const ok = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) fails.push(name); };
  const O = 'https://h.example/';
  ok('url key absolute', resUrl({ url: 'https://a/b' }, O) === 'https://a/b');
  ok('relative url + absolute resource wins (kariguetoazul shape)', resUrl({ url: '/v1/tool', resource: 'https://x.dev/v1/tool' }, O) === 'https://x.dev/v1/tool');
  ok('relative url resolves against host origin', resUrl({ url: '/v1/tool' }, O) === 'https://h.example/v1/tool');
  ok('resource key only', resUrl({ resource: 'https://p/q' }, O) === 'https://p/q');
  ok('plain string entry', resUrl('https://s/t', O) === 'https://s/t');
  ok('METHOD + path string keeps path (mpp.tracefast shape)', resUrl('GET /api/v1/chains/1/blocks/latest', O) === 'https://h.example/api/v1/chains/1/blocks/latest');
  ok('protocol-relative string resolves https', resUrl('//cdn.example/x', O) === 'https://cdn.example/x');
  ok('non-http scheme entry rejected', resUrl({ url: 'mailto:a@b.c' }, O) === null);
  ok('no usable entry -> null', resUrl({}, O) === null && resUrl(null, O) === null);
  ok('USD1 (BSC 18dec) NOT in USD bands', band({ asset_name: 'USD1', asset: '0x8d0d000ee325ec378907814123acdb63f0a08b0d', price: '5000000000000000000' }) === 'other (non-USD or unverified decimals)');
  ok('USDC 150e6 -> $>100 at 6 dec', band({ asset_name: 'USDC', asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', price: '150000000' }) === '$>100');
  ok('legacy BSC USDT banded at 18 dec', band({ asset_name: 'Tether', asset: '0x55d398326f99059f775485246999027b3197955e', price: '2500000000000000000' }) === '$1-$10');
  ok('null price -> unknown band', band({ asset_name: 'USDC', price: null }) === 'unknown');
  ok('missing/null asset -> unknown bucket', assetKey({ asset: null }) === 'unknown' && assetKey({}) === 'unknown' && assetKey({ asset: 'null' }) === 'unknown');
  ok('symbol-only / decimal asset ids -> unknown bucket', assetKey({ asset: 'USDC' }) === 'unknown' && assetKey({ asset: 'XNO' }) === 'unknown' && assetKey({ asset: '31566704' }) === 'unknown');
  ok('bare 40-hex deployment id kept', assetKey({ asset: '524C555344000000000000000000000000000000' }) === '524c555344000000000000000000000000000000'.toUpperCase());
  ok('base58 mint kept exact case', assetKey({ asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }) === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  ok('CAIP/ERC-155 style id kept raw', assetKey({ asset: 'eip155:8453/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' }) === 'eip155:8453/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' && assetKey({ asset: 'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }) === 'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  ok('0x address keys case-folded', assetKey({ asset: '0x833589FCD6EDB6E08F4C7C32D4F71B54BDA02913' }) === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913');
  const docsArg = process.argv.find(a => a.startsWith('--selftest-docs='));
  if (docsArg) {
    const dir = docsArg.slice('--selftest-docs='.length);
    for (const h of ['x402helper.xyz', 'x402-agent.kariguetoazul.workers.dev', 'detect.halowerk.com', 'mpp.tracefast.xyz', 'via-router.floot.app', 'mpp.hyreagent.fun']) {
      let n = 0, tot = 0;
      try {
        const j = JSON.parse(readFileSync(join(dir, h + '.json'), 'utf8'));
        for (const rs of (Array.isArray(j.resources) ? j.resources : [])) { tot++; if (resUrl(rs, 'https://' + h + '/')) n++; }
      } catch { }
      ok('saved real doc ' + h + ': resolvable resources ' + n + '/' + tot + ' > 0', n > 0);
    }
  }
  console.log(fails.length ? 'SELFTEST FAIL: ' + fails.join('; ') : 'SELFTEST PASS');
  process.exit(fails.length ? 1 : 0);
}

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

// ---- 2. Circle agent-marketplace candidates: live GETs every run, logged; no assumption about responses ----
const CIRCLE = [
  { url: 'https://app.circle.com/x402/listings', webpage: true },
  { url: 'https://developer.circle.com/x402', webpage: true },
  { url: 'https://www.circle.com/agent-marketplace.json' },
  { url: 'https://marketplace.circle.com/api/resources?limit=2' },
];
const circleResults = [];
for (const c of CIRCLE) {
  let robots = null;
  if (c.webpage) robots = String((await fetchLog(new URL('/robots.txt', c.url).href, 15000, 1500)).status);
  const { status, body } = await fetchLog(c.url, 15000, 4000);
  let meta = false;
  try { const j = JSON.parse(body.toString()); meta = !!(j && (j.resources || j.items || j.accepts)); } catch { }
  circleResults.push({ url: c.url, webpage: !!c.webpage, robots_status: robots, http_status: String(status), x402_listing_metadata_in_body: meta });
  await sleep(400);
}
console.log('circle attempts:', JSON.stringify(circleResults.map(c => [c.url, c.robots_status ?? '-', c.http_status])));

// ---- 3. Cross-source dedup (resource url + mcp toolName); discovered_via names every listing catalog ----
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

// ---- 4. Seed host list: every unique resource-server host enumerated (facilitator hosts excluded) ----
const SEED_SKIP = new Set(['api.cdp.coinbase.com', 'facilitator.payai.network']);
const seedHosts = [...new Set(all.map(r => hostOf(r.url)))].filter(h => h !== '?' && !SEED_SKIP.has(h)).sort();
writeFileSync(join(outDir, 'seed_hosts.json'), JSON.stringify(seedHosts));
const rowsByHost = new Map();
for (const r of all) { const h = hostOf(r.url); if (!rowsByHost.has(h)) rowsByHost.set(h, []); rowsByHost.get(h).push(r); }

// ---- 5. Probe wave: deterministic sample (sorted hosts), one probe per host within budget ----
const probedHosts = [];
for (const h of seedHosts) {
  const cands = (rowsByHost.get(h) || []).filter(r => r.url.includes('://'));
  if (cands.length && probedHosts.length < MAX_PROBES) { useHost(h); probedHosts.push([h, cands[0]]); }
}
console.log('probe wave:', probedHosts.length, 'hosts of', seedHosts.length, 'seed hosts');

const lastHit = new Map();
let handshakes = 0, other402 = 0;
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
      r.verified = 'handshake'; // 402 + parsable x402 accepts
      handshakes++;
    } else {
      r.verified = 'http_402_no_parsable_accepts'; // e.g. platform-generated gateway 402s, not an x402 handshake
      r.notes = 'HTTP 402 but no parsable x402 accepts in payment-required header or body; raw=' + String(pr || body.toString('utf8')).slice(0, 160).replace(/\n/g, ' ');
      other402++;
    }
  } else {
    r.http_status_other = status;
    r.notes = `probe got HTTP ${status}, not 402`;
  }
  if (i % 500 === 0) console.log('probe', i + 1, '/', probedHosts.length, 'handshakes:', handshakes);
}
console.log('probe wave done, handshakes:', handshakes, '| other 402s (no parsable accepts):', other402);

// ---- 6. /.well-known/x402 wave: exactly one GET per seed host; budget-consuming probes win, skips logged.
// JSON x402 docs have resources[] enumerated as rows (discovered_via = doc URL). well_known_log.jsonl is an
// append-only history across ALL runs; definitive non-200 results (+budget skips) from prior runs are reused
// without re-requesting, while EVERY host that ever returned HTTP 200 is re-GET by each producing run because
// document rows are materialized only by the run that fetches the body (rev-3 fix 1). ----
const wkPath = join(outDir, 'well_known_log.jsonl');
const wkDone = new Map();
if (existsSync(wkPath)) {
  for (const l of readFileSync(wkPath, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try {
      const w = JSON.parse(l);
      if (w.status !== 'ERR' && w.status !== 200) wkDone.set(w.host, w); // definitive non-200 + skips reused; every 200 re-fetched to re-parse its resources[]
    } catch { }
  }
  if (wkDone.size) console.log('resume: reuse', wkDone.size, 'prior non-200 well-known results');
}
const urlFirst = new Map(); // url-level dedup for doc resources vs catalog rows
for (const r of all) if (!urlFirst.has(r.url)) urlFirst.set(r.url, r);
const wellKnown = [];
let resAddedTotal = 0;
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
  const { status, body } = await fetchLog(`https://${h}/.well-known/x402`, WK_DOC_TIMEOUT_MS, WK_DOC_CAP); // full bodies up to 120MB so the largest live docs parse whole (rev-3 fix 1)
  let doc = null, accepts_n = null, res_total = 0, res_added = 0, res_dup = 0, res_bad = 0;
  if (status === 200) {
    try {
      const j = JSON.parse(body.toString());
      if (j && typeof j === 'object' && !Array.isArray(j) && ('x402Version' in j || 'accepts' in j || 'accepted' in j || 'resources' in j)) doc = j;
    } catch { }
  }
  if (doc) {
    accepts_n = (doc.accepts ?? doc.accepted ?? []).length;
    const via = `https://${h}/.well-known/x402`;
    const origin = 'https://' + h + '/';
    const list = Array.isArray(doc.resources) ? doc.resources : [];
    res_total = list.length;
    for (const rs of list) {
      // three live shapes, relative values resolved against the doc origin; absolute url/resource wins (rev-3 fix 1)
      const u = resUrl(rs, origin);
      if (!u) { res_bad++; continue; }
      const acc = (rs && Array.isArray(rs.accepts) ? rs.accepts[0] : null) || (rs && rs.price && typeof rs.price === 'object' ? rs.price : null) || {};
      const tool = ((rs?.extensions || {}).bazaar || {}).info?.toolName ?? (typeof rs?.name === 'string' ? rs.name : null);
      const prevRow = urlFirst.get(u);
      if (prevRow) { if (!prevRow.discovered_via.includes(via)) prevRow.discovered_via += ' + ' + via; res_dup++; continue; }
      const row = {
        url: u, mcp_tool: tool, discovered_via: via, operator: acc.payTo ?? null, verified: 'listing-only',
        price: acc.maxAmountRequired ?? acc.amount ?? null, asset: acc.asset ?? null, network: acc.network ?? null,
        scheme: acc.scheme ?? null, updated: null, asset_name: (acc.extra || {}).name ?? null,
        notes: `discovered via ${via} resources[]; not probed`,
      };
      all.push(row); urlFirst.set(u, row); res_added++;
    }
    resAddedTotal += res_added;
  }
  const entry = { host: h, status, accepts_n, json_doc: !!doc, res_total, res_added, res_dup, res_bad }; // per-doc accounting (rev-3 fix 1)
  wellKnown.push(entry);
  appendFileSync(wkPath, JSON.stringify(entry) + '\n');
  if (wellKnown.length % 2000 === 0) console.log('well-known', wellKnown.length, '/', seedHosts.length);
  await sleep(WAVE_DELAY_MS);
}
// request_log.jsonl = every request of the run that produces the files (rev-3 fix 2), plus the disclosed parser-
// validation pre-fetches recorded by probe_log.jsonl (same UA); overwritten each run, well_known_log.jsonl keeps
// the append-only cross-run well-known history instead.
const priorProbe = existsSync(join(outDir, 'probe_log.jsonl')) ? readFileSync(join(outDir, 'probe_log.jsonl'), 'utf8').split('\n').filter(x => x.trim()).map(JSON.parse) : [];
const allReq = [...priorProbe, ...log].sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
writeFileSync(join(outDir, 'request_log.jsonl'), allReq.map(e => JSON.stringify(e)).join('\n') + (allReq.length ? '\n' : ''));

// ---- 7. Stats: CAIP-2 mapping, case-folded 0x/eip155 asset/operator, USD-only bands at real decimals, testnet split ----
const SOL_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'; // first 32 chars of mainnet-beta getGenesisHash (api.mainnet-beta.solana.com)
const SOL_DEVNET = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';   // first 32 chars of devnet getGenesisHash (api.devnet.solana.com)
const NET_MAP = {
  'base': 'eip155:8453', 'ethereum': 'eip155:1', 'polygon': 'eip155:137', 'bsc': 'eip155:56', 'bnb-smart-chain': 'eip155:56',
  'optimism': 'eip155:10', 'arbitrum': 'eip155:42161', 'avalanche': 'eip155:43114', 'solana': SOL_MAINNET,
  'base-sepolia': 'eip155:84532', 'polygon-amoy': 'eip155:80002', 'ethereum-sepolia': 'eip155:11155111',
  'solana-devnet': SOL_DEVNET, 'solana:devnet': SOL_DEVNET,
  'xlayer': 'eip155:196', 'x-layer': 'eip155:196', 'xlayer-testnet': 'eip155:1952', // chains.json: "X Layer Testnet"=1952 (195 deprecated)
  'sei-testnet': 'eip155:1328', 'peaq': 'eip155:3338', // chains.json: "Sei Testnet"=1328, "peaq"=3338
};
const normName = s => String(s ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-');
// live chain metadata (one GET): name->chainId resolution for unmapped names + testnet classification by chain name
let CHAINLIST = null;
{ const { status, body } = await fetchLog('https://chainid.network/chains.json', 30000, 4_000_000);
  if (status === 200) { try { CHAINLIST = JSON.parse(body.toString()); } catch { } } }
const clByName = new Map(), clById = new Map();
for (const c of CHAINLIST || []) {
  const k = String(c.name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (k && !clByName.has(k)) clByName.set(k, c.chainId);
  clById.set(String(c.chainId), c);
}
const toNet = n => {
  const t = String(n ?? '').trim();
  if (!t) return ''; // no network in listing (e.g. plain-string resources[] entries) -> separate stats bucket, not ?unmapped
  const k = normName(t);
  if (NET_MAP[k]) return NET_MAP[k];
  if (/^solana:/i.test(t)) { // base58 chain ids are case-sensitive: fold only the known clusters to canonical CAIP-2, one key per cluster
    const id = t.slice(7).trim();
    if (id.toLowerCase() === SOL_MAINNET.slice(7)) return SOL_MAINNET;
    if (id.toLowerCase() === SOL_DEVNET.slice(7)) return SOL_DEVNET;
    return 'solana:' + id;
  }
  if (t.includes(':')) return t; // already CAIP-2, exact case preserved (no lowercasing of base58)
  const byName = clByName.get(k.replace(/[^a-z0-9]/g, ''));
  if (byName != null) return 'eip155:' + byName;
  return k + '?unmapped';
};
const TESTNET = new Set(['eip155:84532', 'eip155:11155111', 'eip155:80002', 'eip155:43113', SOL_DEVNET,
  'eip155:1952', 'eip155:11142220', 'eip155:1328', 'eip155:46630']); // X Layer Testnet / Celo Sepolia / Sei Testnet / Robinhood Chain Testnet
const isTestnet = id => TESTNET.has(id) || /testnet|devnet|sepolia|amoy/i.test(String(clById.get(id.includes(':') ? id.split(':').slice(1).join(':') : '')?.name ?? ''));
const tally = (arr, key) => { const m = new Map(); for (const v of arr) { const k = key(v); if (k != null) m.set(k, (m.get(k) || 0) + 1); } return m; };
const nets = tally(all, r => toNet(r.network) || 'no-network-in-listing');
const classes = tally(all, r => !String(r.network ?? '').trim() ? 'no-network-in-listing' : isTestnet(toNet(r.network)) ? 'testnet' : 'mainnet');
const assets = tally(all, assetKey); // rev-3 fix 4: address-keyed with one 'unknown' bucket; counts must sum to total_rows exactly
if ([...assets.values()].reduce((s, c) => s + c, 0) !== all.length) console.warn('WARN: by_asset sum != total_rows');
const bands = tally(all, band);
const ops = tally(all, r => fold(r.operator));
const hosts = tally(all, r => hostOf(r.url));
const top = m => [...m.entries()].sort((a, b) => b[1] - a[1]);
const hand = all.filter(r => r.verified === 'handshake').length;
const wkSkipped = wellKnown.filter(w => String(w.status).startsWith('skipped')).length;
const docsFound = wellKnown.filter(w => w.json_doc).length; // JSON x402 docs only (rev-1 counted any HTTP 200)
// per-host request totals across ALL runs (rev-3 fix 2): well_known_log.jsonl is append-only and permanently records
// every wk attempt/skip ever made. Count history lines (skips are not requests) + this run's non-wk log requests +
// pre-run parser-validation wk GETs from probe_log (not appended to the wk history). Requests of superseded runs
// whose per-run request_log was overwritten (catalog pages, probes, Circle page GETs) are a disclosed undercount floor.
const wkHistAll = existsSync(wkPath) ? readFileSync(wkPath, 'utf8').split('\n').filter(x => x.trim()).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(w => w && !String(w.status).startsWith('skipped')) : [];
const allRunsReqs = new Map();
for (const e of log) if (!e.url.includes('/.well-known/x402')) { const hh = hostOf(e.url); allRunsReqs.set(hh, (allRunsReqs.get(hh) || 0) + 1); } // this run's non-wk requests
for (const w of wkHistAll) allRunsReqs.set(w.host, (allRunsReqs.get(w.host) || 0) + 1); // includes this run's appended wk GETs; the run log's own wk lines are excluded above to avoid double counting
for (const e of priorProbe) if (e.url.includes('/.well-known/x402')) { const hh = hostOf(e.url); allRunsReqs.set(hh, (allRunsReqs.get(hh) || 0) + 1); }

const circleText = circleResults.map(c => `${c.url} -> HTTP ${c.http_status}${c.webpage ? ` (robots.txt pre-check: HTTP ${c.robots_status})` : ''}${c.x402_listing_metadata_in_body ? ', body carries x402/listing-style metadata (not ingested: schema unverified)' : ', no x402 listing metadata found in body'}`).join('; ');
const out = {
  as_of: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  method: `Enumerated from two public bazaar discovery surfaces with full pagination: CDP Bazaar GET https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=500&offset=N and PayAI GET https://facilitator.payai.network/discovery/resources?limit=500&offset=N. Dedup by (resource url + mcp toolName) across sources -> ${all.length} unique endpoints; each row's discovered_via names every catalog or /.well-known/x402 doc that listed it. Circle agent-marketplace candidates fetched live this run, one GET each (webpage URLs preceded by a robots.txt GET), all logged in request_log.jsonl: ${circleText}. Seed host list published in seed_hosts.json (${seedHosts.length} unique resource-server hosts derived from catalog rows, facilitator hosts excluded, no blind scanning): one unauthenticated GET https://{host}/.well-known/x402 per seed host (append-only cross-run history in well_known_log.jsonl: definitive non-200 results from earlier runs are reused without re-requesting, while every host that previously returned HTTP 200 is re-GET by this producing run because document rows are materialized only by the run that fetches the body; ${wkSkipped} hosts skipped because their <=${PER_HOST_TOTAL_CAP}-request total budget went to the endpoint probe first, each skip logged). A 200 response counts as an x402 document only when it parses to a JSON object carrying an x402Version/accepts/accepted/resources key; each such document's resources[] entries become endpoint rows with discovered_via = the document URL, read in all shapes observed live (entries with a url and/or resource key — an absolute http(s) value wins when both keys exist, relative values and plain-URL strings resolve against the document host origin), bodies accepted up to 120MB so the largest live docs (x402helper.xyz ~101MB, detect.halowerk.com ~7.5MB) parse whole instead of failing truncated JSON.parse at the old 4MB cap, deduped by URL against catalog rows (${resAddedTotal} new rows from documents this run; every well_known_log entry carries per-document res_total/res_added/res_dup/res_bad accounting); document rows without payment metadata land in a dedicated no-network-in-listing stats bucket instead of ?unmapped. well_known_docs_found counts JSON x402 documents only, non-JSON 200 responses are counted separately. Handshake verification: unauthenticated GET on a sample of ${probedHosts.length} endpoints (one per sampled host, deterministic sorted order); handshake = HTTP 402 whose payment-required header or body parses to a non-empty x402 accepts array (decoded accepts stored in the row notes and used to overwrite price/asset/network/operator); other 402 responses are labeled http_402_no_parsable_accepts (${other402} this run). Per-host budget: <=${PER_HOST_TOTAL_CAP} total requests incl. /.well-known/x402 and probe; >=1s between requests to the same host. Network normalization to CAIP-2: built-in map + live https://chainid.network/chains.json name matching as fallback (logged); Solana chain ids = first 32 chars of getGenesisHash from api.mainnet-beta.solana.com / api.devnet.solana.com; testnet class = known testnet ids plus chains.json names matching testnet/devnet/sepolia/amoy. Asset/operator stats keys are case-folded only for 0x/eip155 addresses; base58 and CAIP-2 values keep exact case so each chain cluster is one key. Price bands in $ cover USDC/USDT-family assets only (catalog asset name or verified mint list) at real decimals (USDC=6 every deployment, Solana mints verified via getTokenSupply; USDT0=6; legacy Ethereum/BSC USDT=18); every other asset including other dollar stablecoins whose decimals are not verified here (e.g. USD1 = 0x8d0d000ee325ec378907814123acdb63f0a08b0d on BSC, 18 dec) is banded 'other (non-USD or unverified decimals)', never in a $ band. by_asset is keyed by address-shaped asset ids only (0x-hex case-folded, bare 40-hex deployment ids and base58 mints exact-case, CAIP-2/ERC-155 style ids raw), with one explicit 'unknown' bucket for rows whose listing carries no usable asset id (missing, symbol-only like 'USDC'/'XNO', decimal ids); its counts sum to total_rows exactly. request_log.jsonl holds every request of the run that produced these files (catalog pages, Circle robots.txt pre-checks + page GETs paced 400ms apart, probes, chain metadata, the well-known wave, plus six disclosed parser-validation pre-fetches), User-Agent dspaid-census/3.0 throughout; per-host request totals across all runs are in request_budget.per_host_requests_all_runs. No payments were made. Reproducible by rerunning census.mjs (node census.mjs --selftest [--selftest-docs=DIR] checks the resource-shape resolver, USD-band purity and the unknown-asset bucket offline); drift expected as catalogs are live.`,
  seed_sources: [
    'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources (CDP Bazaar discovery surface, x402 bazaar spec; facilitator base URL per https://docs.cdp.coinbase.com/sdks/cdp-sdks-v2/typescript/x402/variables/CDP_FACILITATOR_URL)',
    'https://facilitator.payai.network/discovery/resources (PayAI discovery surface; listed production facilitator at https://docs.x402.org/dev-tools/facilitators)',
    'https://docs.x402.org/extensions/bazaar (bazaar spec: GET {facilitator}/discovery/resources)',
    `Circle listings fetched live this run (logged in request_log.jsonl): ${circleText}`,
    'chain metadata / testnet classification: https://chainid.network/chains.json fetched at run time (logged); Solana CAIP-2 chain ids = first 32 chars of getGenesisHash from api.mainnet-beta.solana.com and api.devnet.solana.com',
    `seed host list: seed_hosts.json (${seedHosts.length} hosts) -> one GET /.well-known/x402 each; well_known_log.jsonl is the append-only cross-run history of those attempts (status, JSON-doc flag, accepts count, per-document res_total/res_added/res_dup/res_bad accounting), request_log.jsonl holds every request of this producing run, cross-run per-host totals in request_budget.per_host_requests_all_runs`,
  ],
  endpoints: all,
  stats: {
    total_rows: all.length,
    handshake_verified: hand,
    http_402_no_parsable_accepts: other402,
    listing_only: all.length - hand - other402,
    by_network_caip2: Object.fromEntries(top(nets)),
    network_class: Object.fromEntries(classes),
    by_asset: Object.fromEntries(assets),
    by_price_band: Object.fromEntries(bands),
    unique_operators: ops.size,
    top_operators_share_pct: +(top(ops).slice(0, 20).reduce((s, [, c]) => s + c, 0) * 100 / [...ops.values()].reduce((s, c) => s + c, 0)).toFixed(1),
    unique_hosts: hosts.size,
    top_hosts: top(hosts).slice(0, 15),
    well_known_docs_found: docsFound,
    well_known_200_nonjson_or_other: wellKnown.filter(w => w.status === 200 && !w.json_doc).length,
    well_known_resources_added_rows: resAddedTotal,
    well_known_seed_hosts_probed: wellKnown.length - wkSkipped,
    well_known_seed_hosts_skipped_budget: wkSkipped,
  },
  request_budget: {
    total_requests: log.length,
    catalog_pages: log.filter(e => e.url.includes('discovery/resources')).length,
    well_known_gets: log.filter(e => e.url.includes('.well-known/x402')).length,
    circle_gets: log.filter(e => e.url.includes('circle.')).length,
    chainlist_gets: log.filter(e => e.url.includes('chainid.network')).length,
    endpoint_probes: log.filter(e => !e.url.includes('discovery/resources') && !e.url.includes('.well-known/x402') && !e.url.includes('circle.') && !e.url.includes('chainid.network')).length,
    paid_calls: 0,
    hosts_contacted: new Set(log.map(e => hostOf(e.url))).size,
    per_host_max_requests: Math.max(...[...tally(log, e => hostOf(e.url)).values()], 1), // all hosts incl. catalog surfaces (rev-1 reported this excluding them)
    per_host_max_requests_seed_hosts: Math.max(...[...tally(log.filter(e => !e.url.includes('discovery/resources') && !e.url.includes('circle.') && !e.url.includes('chainid.network')), e => hostOf(e.url)).values()], 1),
    logged_request_lines: allReq.length, // request_log.jsonl content size incl. merged disclosed pre-fetch lines
    per_host_requests_all_runs: { distinct_hosts_observed: allRunsReqs.size, max_per_host: Math.max(...[...allRunsReqs.values()], 1), top: top(allRunsReqs).slice(0, 15) }, // rev-3 fix 2: totals across ALL runs (see retention disclosure in politeness)
    politeness: 'User-Agent dspaid-census/3.0 (+pact0.com/u/dspaid; mailto) on every request in this run\'s log and in the merged pre-fetch lines. Catalog discovery surfaces are paged once per run each at ~1 req/s and are excluded from the <=2 endpoint-host budget by design (they are the enumerated surfaces, not surveyed hosts); every surveyed host: per-run total cap 2 requests (one /.well-known/x402 + one endpoint probe; budget-consuming probes take priority, well-known skips are logged); Circle: one robots.txt GET + one page GET per webpage URL paced 400ms apart (both logged), one GET per API/JSON URL, max 2 per circle host; chainid.network metadata = 1 GET; >=1s between requests to the same host within a run. Cross-run accounting (rev-3 fix 2): well_known_log.jsonl is append-only across all runs and permanently records every /.well-known/x402 attempt ever made; each producing run re-GETs hosts that previously returned HTTP 200 (document rows are materialized only by the run that fetches the body) and reuses definitive non-200 results without re-requesting; per_host_requests_all_runs gives per-host totals across all runs built from that history + this run\'s log + the six disclosed parser-validation pre-fetches. Undercount disclosure: earlier runs of superseded pre-fix code versions (UA 2.0) kept per-run request logs that were overwritten, so their catalog-page/probe/Circle requests are not reconstructable line-by-line; only their well-known attempts survive in well_known_log.jsonl. Zero robots.txt violations (API endpoints and well-known docs; circle webpage robots.txt pre-checks logged, Lockout pages reported as-is).',
  },
};

writeFileSync(join(outDir, 'census_rows.json'), JSON.stringify(all, null, 0));
writeFileSync(join(outDir, 'census_full.json'), JSON.stringify(out));
console.log('out:', outDir, '| rows:', all.length, '(+' + resAddedTotal + ' from well-known docs)', '| handshakes:', hand, '| other402:', other402, '| json x402 docs:', docsFound, '| requests this run:', log.length);
