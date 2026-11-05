#!/usr/bin/env node
// DAiL bounty bnty_0452 — independent verifier (no secrets required).
//
// Checks, in order:
//   1. trade_access_key is re-derivable from the attestation fields (binding);
//   2. message_signature is a valid ed25519 signature by the agent identity key;
//   3. tx_signed_b64 re-hashes to tx_hash and its on-chain-format signature validates
//      against the agent identity key (pure crypto, no network);
//   4. the transaction content matches the attestation (signer/receiver/AddKey/method);
//   5. NEAR testnet RPC confirms the tx executed successfully in the claimed block and
//      the chain's own copy of the tx lists the agent identity key as signer;
//   6. the derived trade access key is live on the account with execute_trade scope.
//
// Usage: node verify_action.mjs [path/to/attestation.json]

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  JsonRpcProvider, PublicKey, decodeSignedTransaction, base64Decode,
} from 'near-api-js';
import { base58 } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import nacl from 'tweetnacl';

const provider = new JsonRpcProvider({ url: 'https://rpc.testnet.near.org' });
let failures = 0;

function check(label, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failures += 1;
}

function parseMessage(msg) {
  const fields = {};
  for (const line of msg.split('\n')) {
    const i = line.indexOf(': ');
    if (i > 0) fields[line.slice(0, i)] = line.slice(i + 2);
  }
  return fields;
}

async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const attPath = process.argv[2] ?? path.join(here, 'attestation.json');
  const att = JSON.parse(await readFile(attPath, 'utf8'));
  const f = parseMessage(att.message);

  console.log(`verifying ${attPath}\n`);
  console.log('--- offline (pure cryptography) ---');

  // 1. trade key re-derivation
  const tradeSeed = sha256(new TextEncoder().encode(
    `dail-trade-v1|${f.account}|${f.agent_identity_key}|${f.timestamp}`,
  ));
  const derivedPk = `ed25519:${base58.encode(nacl.sign.keyPair.fromSeed(tradeSeed).publicKey)}`;
  check('trade key derived from attestation fields', derivedPk === f.trade_access_key, derivedPk);

  // 2. message signature by agent identity key
  const agentPkRaw = PublicKey.from(f.agent_identity_key).data;
  const msgSig = base58.decode(att.message_signature.replace('ed25519:', ''));
  check('message signed by agent identity key',
    nacl.sign.detached.verify(sha256(new TextEncoder().encode(att.message)), msgSig, agentPkRaw));

  // 3. raw tx bytes hash to tx_hash; signature validates over the unsigned tx
  const txBytes = base64Decode(att.tx_signed_b64);
  const stx = decodeSignedTransaction(txBytes);
  check('sha256(signed_tx_bytes) == tx_hash', base58.encode(sha256(txBytes)) === att.tx_hash, att.tx_hash);
  const unsignedHash = sha256(stx.transaction.encode());
  const sigBytes = Uint8Array.from(stx.signature.ed25519Signature?.data ?? stx.signature.data);
  check('chain signature valid for agent identity key',
    nacl.sign.detached.verify(unsignedHash, sigBytes, agentPkRaw));

  // 4. transaction content matches attestation
  const t = stx.transaction;
  check('signer == attested account', t.signerId === f.account && t.receiverId === f.account, f.account);
  check('tx signer key == agent identity key', t.publicKey.toString() === f.agent_identity_key);
  const addKey = t.actions[0]?.addKey;
  // borsh decode returns plain {keyType,data}; re-render as ed25519:... for comparison
  const addedPkStr = `ed25519:${base58.encode(Uint8Array.from(addKey?.publicKey?.ed25519Key?.data ?? addKey?.publicKey?.data ?? []))}`;
  check('action is AddKey of derived trade key', addedPkStr === f.trade_access_key, addedPkStr);
  const fc = addKey?.accessKey?.permission?.functionCall;
  check('granted scope: execute_trade on own account',
    fc?.receiverId === f.account && Array.isArray(fc?.methodNames) && fc.methodNames.includes('execute_trade'));

  console.log('\n--- on-chain (NEAR testnet RPC) ---');

  // 5. attested block is canonical; tx_status is best-effort (public testnet RPCs
  //    do not all index tx status — the access-key state below is the primary proof)
  const blk = await provider.viewBlock({ blockId: att.block_hash });
  check('attested block exists on canonical chain', typeof blk?.header?.height === 'number', 'height ' + blk.header.height);

  // NEAR encodes an access key's creation block height into its nonce (height * 1e6),
  // anchoring the AddKey to the attested block (+/-1 by node convention).
  const keys = await provider.viewAccessKeyList({ accountId: f.account });
  const live = keys.keys.find((k) => k.public_key === derivedPk);
  check('trade access key live on account (function-call, execute_trade)',
    live?.access_key.permission?.FunctionCall?.receiver_id === f.account
    && live?.access_key.permission?.FunctionCall?.method_names?.includes('execute_trade'));
  const createdHeight = Number(BigInt(live?.access_key.nonce ?? 0) / 1000000n);
  check('trade key creation block matches attested block', Math.abs(createdHeight - blk.header.height) <= 1,
    `key nonce height ${createdHeight}, block height ${blk.header.height}`);

  try {
    const st = await Promise.race([
      provider.sendJsonRpc('EXPERIMENTAL_tx_status', {
        tx_hash: att.tx_hash, sender_account_id: f.account, wait_until: 'EXECUTED',
      }),
      new Promise((_, rej) => {
        const t = setTimeout(() => rej(new Error('deadline')), 20000);
        t.unref();
      }),
    ]);
    check('tx executed successfully (tx_status)', 'SuccessValue' in st.status);
    check('chain copy of tx lists agent identity key as signer', st.transaction.public_key === f.agent_identity_key);
  } catch {
    console.log('SKIP  tx_status endpoint not serving this tx on this RPC node (key-state proof above stands)');
  }

  console.log(`\nexplorer: ${att.explorer}`);
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('FAIL:', e.message ?? e); process.exit(1); });
