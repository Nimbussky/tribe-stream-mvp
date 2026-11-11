# TribeStream MVP

**High-tech social video + tribe platform**  
YouTube-style content + Discord-style clubs/rooms + own Coin economy + glass UI + AI Support Agent.

Built on **Puter.js** (serverless, user-pays AI, KV, FS, Auth, Workers, Peer).

> Architecture follows Rika Trinity (Reservoir / Storage / Manifestation) for infinite modularity.

## Current Working Features (MVP Phase 1)

- Puter Auth (sign in / out)
- Glass cinematic UI shell
- Home / Explore feed
- Watch page + basic player
- Like / Comment / Share / Subscribe actions → earn Coins
- Immutable-style Coin Ledger (Puter KV)
- Wallet view + peer transfer simulation
- Tribes list + simple Room
- AI Support Agent (Puter.ai.chat)
- Responsive glass design system

## How to Run Locally

1. Serve the folder with any static HTTP server (required by Puter):
   ```bash
   npx serve .
   # or
   python -m http.server 3000
   ```
2. Open the URL in browser.
3. Sign in with Puter account.

## Important Notes

- This is a **real working skeleton**, not vaporware.
- Coin economy is ledger-based (every earn/transfer is recorded).
- Real cash-out / universal payment is **intentionally out of MVP** (legal & compliance risk).
- Live streaming, advanced peer voice, and full affiliate shopping come in Phase 2+.

## Project Structure

```
tribe-stream-mvp/
├── index.html              # Main app entry
├── src/
│   ├── app.js              # Core application logic
│   ├── design-system.css   # Glass / cinematic tokens
│   ├── ledger.js           # Coin economy (Reservoir + Storage)
│   ├── tribes.js           # Tribe / Room system
│   └── agent.js            # AI Support Agent (Manifestation)
├── workers/                # Future Puter Workers
└── docs/
    └── architecture.md     # Rika mapping + roadmap
```

## Next Steps (Priority Order)

1. Deploy as Puter App or static host
2. Add real media upload via puter.fs
3. Implement Puter Peer for real-time rooms
4. Add creator upload flow
5. Partner affiliate catalog (Phase 2)
6. Full moderation + report system

---

**Powered by Puter** · Built with Rika modular architecture · No slop.
