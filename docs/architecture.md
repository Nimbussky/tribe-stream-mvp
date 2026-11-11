# TribeStream Architecture

## Rika Trinity Mapping

| Feature                        | Cast            | Implementation                          |
|--------------------------------|-----------------|-----------------------------------------|
| Coin minting (earn)            | Reservoir       | `CoinLedger.earn()`                     |
| Wallet + history               | Storage         | Puter KV ledger + balance keys          |
| Active Room / Live session     | Manifestation   | `TribeSystem.enterRoom()` + chat        |
| AI Support Agent               | Manifestation   | `SupportAgent.ask()` via puter.ai.chat  |
| Persistent Tribes              | Storage         | Membership sets in KV                   |
| Content Feed / Watch           | Reservoir+Manif | Demo data → real FS later               |

## Data Keys (Puter KV)

- `tribestream_ledger_v1:{userId}` → array of entries
- `tribestream_balance_v1:{userId}` → number
- `tribestream_membership_v1:{userId}` → array of tribe ids

## Future Workers (Phase 2)

- Shared coin transfer Worker (credit receiver)
- Media processing Worker
- Moderation queue Worker
- Affiliate catalog Worker

## Safety Rules Already Present

- All coin changes go through ledger
- No negative balance allowed on transfer
- Tribe-safe messaging
- Agent refuses to invent cash-out promises

## Roadmap Alignment

1. **Now (this MVP)**: Auth → Feed → Watch → Earn → Tribe → Wallet → Agent
2. **Next**: Real upload (puter.fs), Peer rooms, creator dashboard
3. **Later**: Partner redemptions, advanced ranking, full moderation
4. **Only after product-market fit**: Any real-money path (licenses required)
