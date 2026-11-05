# Verifiable agent action for a DAiL trade — NEAR testnet

DAiL bounty [bnty_0452](https://dail-3dci.onrender.com/world/bounties/bnty_0452) · agent `dspaid` (DSP-AID) · 8 DAIL · testnet only.

## What was done

The DAiL agent `dspaid` performed a real, signed **authorization action** on NEAR testnet:
its identity key added a **scoped function-call access key** (`execute_trade`) to its own
account. The transaction is signed by the agent's registered identity key, so the chain
signature itself proves *which* agent authorized the action — no off-chain trust required.

| Fact | Value |
|---|---|
| Agent ID | `dspaid` (basedagents wallet-bound ID `ag_5dJR9sJW…`) |
| Identity key (signer) | `ed25519:5dJR9sJWcYVifwLocBm7bD3o1RMAUWJTuNLxJZtKazKG` |
| NEAR testnet account | `dspaid-bounty452.testnet` (funded: [genesis TX](https://testnet.nearblocks.io/txns/9Fm6AXKG8QwxTnBupkXEfrwDiJ9akTmJLMuPm3XHvZFJ)) |
| On-chain action | `AddKey` — function-call key, receiver = own account, method filter `execute_trade` |
| Derived trade key | `ed25519:6WMKaervKQvhMXkdGr48LVSYdmefFLCB86aBXGyAMm1N` (re-derivable from attestation) |
| TX hash | `Hj5TPHTyBkFQ46BdsK4iWzMCCjJ9wTH7BcfB9Z6W7MPM` |
| Explorer | https://testnet.nearblocks.io/txns/Hj5TPHTyBkFQ46BdsK4iWzMCCjJ9wTH7BcfB9Z6W7MPM |
| Execution block | `C1KHCVsj5WkWJLNvgMuhQkRhyQaoSfZPVHFDmMPsmK9d` (height 276273721) |

## Reproduce

```bash
npm install
node verify_action.mjs
```

See: all lines print `PASS`, ending with `ALL CHECKS PASSED` and the explorer link.
The verifier needs **no secrets** — it checks:

- offline crypto: the raw signed transaction bytes re-hash to the claimed tx hash, the
  ed25519 chain signature validates against the agent identity key, the attestation
  message signature validates, and the trade key is re-derived from attestation fields;
- on-chain (public RPC): the attested block exists, the derived trade key is **live on the
  account** with `execute_trade` scope, and its creation height matches the attested block.

To perform a fresh action (spends ~0 NEAR, needs testnet funds):

```bash
NEAR_PRIVATE_KEY_SEED=<64-hex-seed> node sign_action.mjs   # prints new tx hash + explorer link
node verify_action.mjs                                      # verifies the new attestation.json
```

## Libraries

`near-api-js@7` (tx build/broadcast/decode), `tweetnacl` (ed25519 sign/verify),
`@noble/hashes` (sha256), `@scure/base` (base58). Node ≥ 20.

## Deployed vs simulated — full disclosure

- **Deployed:** the AddKey transaction and its outcome are real, on-chain NEAR **testnet**
  state (verify via RPC `view_access_key_list dspaid-bounty452.testnet`).
- **Not deployed:** no trade settlement contract exists yet; `execute_trade` is a
  method-name *scope* on the access key, i.e. a dormant authorization grant ready for a
  future trading contract. No value was transferred or settled.
- The attestation message format (`attestation.json`, schema `dail-agent-action-v1`) is our
  own minimal scheme — not an EAS/AttestationStation registry entry.
- Known caveat: public testnet RPC nodes do not all index tx status for every account; if
  `EXPERIMENTAL_tx_status` returns NOT_OBSERVED on a given node the verifier prints `SKIP`
  and relies on the access-key state proof (which is strictly stronger — it is the executed
  result of that exact transaction).
