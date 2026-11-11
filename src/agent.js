/**
 * AI Support Agent
 * Rika Manifestation Cast — on-demand full form with residual knowledge
 */

export class SupportAgent {
  constructor() {
    this.history = [];
  }

  async ask(message, context = {}) {
    const systemPrompt = `You are the official Support Agent for TribeStream — a high-tech social video + tribe platform with its own Coin economy.

Platform facts:
- Users earn ◆ Coins from watch time, likes, comments, shares, joins and chat.
- Coins are ledger-backed utility points (not legal tender in MVP).
- Tribes are community rooms with safe mode.
- Features: content feed, watch, tribes, wallet, create, AI help.

Be concise, helpful, friendly and honest. If asked about real cash-out or universal currency, explain that Phase 1 focuses on in-platform utility and partner discounts come later. Never invent fake balances or promises.

User context: ${JSON.stringify(context)}`;

    try {
      const response = await puter.ai.chat([
        { role: 'system', content: systemPrompt },
        ...this.history.slice(-6),
        { role: 'user', content: message }
      ], { model: 'gpt-4.1-nano' }); // fast & cheap for support

      const reply = typeof response === 'string'
        ? response
        : (response?.message?.content?.[0]?.text || response?.text || 'I am here to help.');

      this.history.push({ role: 'user', content: message });
      this.history.push({ role: 'assistant', content: reply });

      return reply;
    } catch (err) {
      console.error('Agent error', err);
      return 'Sorry, I could not reach the AI right now. Please try again in a moment or raise a query via the team later.';
    }
  }

  clear() {
    this.history = [];
  }
}
