#!/usr/bin/env node
// DAiL bounty bnty_0452 — verifiable agent action on NEAR testnet.
//
// What it does:
//   1. Derives a deterministic "trade executor" ed25519 key from attestation fields.
//   2. Signs a human-readable attestation message with the agent identity key.
//   3. Broadcasts an AddKey transaction on NEAR testnet authorizing the derived trade
//      key (function-call, method-filtered to `execute_trade`). The transaction is
//      signed by the agent identity key itself, so the chain signature proves which
//      agent authorized the action.
//   4. Writes attestation.json with tx hash, explorer link and raw signed tx bytes.
//
// Usage: NEAR_PRIVATE_KEY_SEED=<hex32> node sign_action.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  JsonRpcProvider, KeyPair, KeyPairSigner, PublicKey, createTransaction, actions, base64Encode,
} from 'near-api-js';
import { base58 } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import nacl from 'tweetnacl';

const RPC_URL = 'https://rpc.testnet.near.org';
const EXPLORER = 'https://testnet.nearblocks.io/txns/';
const NETWORK = 'near-testnet';
const ACCOUNT = 'dspaid-bounty452.testnet';
const AGENT_ID = 'dspaid';
const BOUNTY = 'bnty_0452';
const TRADE_METHOD = 'execute_trade';

const provider = new JsonRpcProvider({ url: RPC_URL });
const outDir = path.dirname(fileURLToPath(import.meta.url));
const b58pk = (buf) => `ed25519:${base58.encode(buf)}`;

async function main() {
  const seedHex = process.env.NEAR_PRIVATE_KEY_SEED;
  if (!/^[0-9a-f]{64}$/i.test(seedHex ?? '')) {
    throw new Error('NEAR_PRIVATE_KEY_SEED must be a 64-char hex ed25519 seed');
  }
  const seed = Buffer.from(seedHex, 'hex');
  const identity = nacl.sign.keyPair.fromSeed(seed);
  const agentPkStr = b58pk(identity.publicKey);
  console.log('agent identity key :', agentPkStr);

  const signer = new KeyPairSigner(await KeyPair.fromString(`ed25519:${base58.encode(seed)}`));
  const accessKey = await provider.viewAccessKey({ accountId: ACCOUNT, publicKey: PublicKey.from(agentPkStr) });
  const { header } = await provider.viewBlock({ finality: 'final' });
  const blockHash = base58.decode(header.hash); // borsh expects raw 32 bytes
  const timestamp = new Date().toISOString();

  // Deterministic trade key: anyone holding the attestation can re-derive it.
  const tradeSeed = sha256(new TextEncoder().encode(
    `dail-trade-v1|${ACCOUNT}|${agentPkStr}|${timestamp}`,
  ));
  const tradePkStr = b58pk(nacl.sign.keyPair.fromSeed(tradeSeed).publicKey);

  const message = [
    'DAiL AGENT ACTION ATTESTATION v1',
    `agent_id: ${AGENT_ID}`,
    `agent_identity_key: ${agentPkStr}`,
    `chain: ${NETWORK}`,
    `account: ${ACCOUNT}`,
    `bounty: ${BOUNTY}`,
    'action: add_function_call_access_key',
    `method_granted: ${TRADE_METHOD}`,
    `trade_access_key: ${tradePkStr}`,
    `timestamp: ${timestamp}`,
  ].join('\n');

  const msgSig = nacl.sign.detached(sha256(new TextEncoder().encode(message)), identity.secretKey);

  const tx = createTransaction(
    ACCOUNT,
    PublicKey.from(agentPkStr),
    ACCOUNT,
    BigInt(accessKey.nonce) + 1n,
    [actions.addFunctionCallAccessKey(PublicKey.from(tradePkStr), ACCOUNT, [TRADE_METHOD], undefined)],
    blockHash,
  );
  const { signedTransaction } = await signer.signTransaction(tx);
  const txBytes = signedTransaction.encode();
  const txHash = base58.encode(sha256(txBytes));

  console.log('broadcasting tx...');
  const res = await provider.sendJsonRpc('broadcast_tx_commit', [base64Encode(txBytes)]);
  if (!('SuccessValue' in res.status)) {
    throw new Error(`tx failed: ${JSON.stringify(res.status)}`);
  }

  const attestation = {
    schema: 'dail-agent-action-v1',
    network: NETWORK,
    bounty: BOUNTY,
    agent_id: AGENT_ID,
    account: ACCOUNT,
    agent_public_key: agentPkStr,
    message,
    message_signature: `ed25519:${base58.encode(msgSig)}`,
    tx_hash: txHash,
    tx_signed_b64: base64Encode(txBytes),
    block_hash: res.transaction_outcome.block_hash,
    explorer: EXPLORER + txHash,
    broadcast_at: timestamp,
  };

  const out = path.join(outDir, 'attestation.json');
  await writeFile(out, JSON.stringify(attestation, null, 2));

  console.log('tx hash            :', txHash);
  console.log('explorer           :', EXPLORER + txHash);
  console.log('attestation written:', out);
}

main().catch((e) => { console.error('FAIL:', e.stack ?? e); process.exit(1); });
