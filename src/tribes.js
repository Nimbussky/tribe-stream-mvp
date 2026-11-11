/**
 * Tribes & Rooms
 * Rika: Storage (persistent membership) + Manifestation (active room session)
 */

const TRIBES_KEY = 'tribestream_tribes_v1';
const MEMBERSHIP_KEY = 'tribestream_membership_v1';

export const DEMO_TRIBES = [
  { id: 't1', name: 'Cinematic Creators', icon: '🎬', members: 1284, desc: 'Film, reels & storytelling' },
  { id: 't2', name: 'Night Coders', icon: '💻', members: 892, desc: 'Build in public, share progress' },
  { id: 't3', name: 'Daily Ritual', icon: '🕉️', members: 2103, desc: 'Devotional & calm spaces' },
  { id: 't4', name: 'Design Lab', icon: '✦', members: 674, desc: 'Glass UI, motion, product' },
  { id: 't5', name: 'Earn & Share', icon: '◆', members: 1540, desc: 'Coin economy & growth' },
  { id: 't6', name: 'Safe Tribe', icon: '🛡️', members: 987, desc: 'Tribe-safe mode enabled' }
];

export class TribeSystem {
  constructor() {
    this.joined = new Set();
    this.currentRoom = null;
    this.messages = [];
  }

  async load(userId) {
    if (!userId) return;
    try {
      const raw = await puter.kv.get(`${MEMBERSHIP_KEY}:${userId}`);
      this.joined = new Set(raw ? JSON.parse(raw) : []);
    } catch {
      this.joined = new Set();
    }
  }

  async join(userId, tribeId) {
    this.joined.add(tribeId);
    if (userId) {
      await puter.kv.set(`${MEMBERSHIP_KEY}:${userId}`, JSON.stringify([...this.joined]));
    }
  }

  isJoined(tribeId) {
    return this.joined.has(tribeId);
  }

  enterRoom(tribe) {
    this.currentRoom = tribe;
    this.messages = [
      { id: 1, user: 'System', text: `Welcome to ${tribe.name}. Tribe-safe mode is active.`, mine: false }
    ];
  }

  leaveRoom() {
    this.currentRoom = null;
    this.messages = [];
  }

  sendMessage(text, username) {
    if (!this.currentRoom || !text.trim()) return;
    this.messages.push({
      id: Date.now(),
      user: username || 'You',
      text: text.trim(),
      mine: true
    });
  }
}
