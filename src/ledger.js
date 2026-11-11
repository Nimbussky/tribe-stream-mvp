/**
 * TribeStream Coin Ledger
 * Rika Trinity: Reservoir (mint energy) + Storage (immutable history)
 * Every coin movement is recorded. Never just mutate a number.
 */

const LEDGER_KEY = 'tribestream_ledger_v1';
const BALANCE_KEY = 'tribestream_balance_v1';

export class CoinLedger {
  constructor() {
    this.entries = [];
    this.balance = 0;
  }

  async load(userId) {
    if (!userId) return;
    try {
      const raw = await puter.kv.get(`${LEDGER_KEY}:${userId}`);
      this.entries = raw ? JSON.parse(raw) : [];
      const bal = await puter.kv.get(`${BALANCE_KEY}:${userId}`);
      this.balance = bal ? Number(bal) : 0;
    } catch (e) {
      console.warn('Ledger load fallback', e);
      this.entries = [];
      this.balance = 0;
    }
  }

  async _save(userId) {
    if (!userId) return;
    await puter.kv.set(`${LEDGER_KEY}:${userId}`, JSON.stringify(this.entries.slice(-200)));
    await puter.kv.set(`${BALANCE_KEY}:${userId}`, String(this.balance));
  }

  /**
   * Mint coins (Reservoir) for real engagement
   */
  async earn(userId, amount, reason, meta = {}) {
    if (!userId || amount <= 0) return this.balance;
    const entry = {
      id: crypto.randomUUID(),
      type: 'earn',
      amount,
      reason,
      meta,
      ts: Date.now()
    };
    this.entries.push(entry);
    this.balance += amount;
    await this._save(userId);
    return this.balance;
  }

  /**
   * Transfer to another user (Storage movement)
   */
  async transfer(fromId, toUsername, amount) {
    if (!fromId || amount <= 0 || amount > this.balance) {
      throw new Error('Insufficient balance or invalid amount');
    }
    const entry = {
      id: crypto.randomUUID(),
      type: 'transfer_out',
      amount: -amount,
      reason: `Transfer to ${toUsername}`,
      meta: { to: toUsername },
      ts: Date.now()
    };
    this.entries.push(entry);
    this.balance -= amount;
    await this._save(fromId);

    // Note: In full system a Worker would credit the receiver.
    // For MVP we record the outgoing transfer only.
    return this.balance;
  }

  getRecent(limit = 20) {
    return [...this.entries].reverse().slice(0, limit);
  }
}

// Simple earn rates (policy – tunable later)
export const EARN_RATES = {
  watch_complete: 8,
  like: 2,
  comment: 3,
  share: 4,
  subscribe: 5,
  join_tribe: 6,
  chat_message: 1
};
