/**
 * TribeStream Core Application
 * End-to-end MVP loop: Auth → Feed → Watch → Earn → Tribe → Wallet → Agent
 */

import { CoinLedger, EARN_RATES } from './ledger.js';
import { TribeSystem, DEMO_TRIBES } from './tribes.js';
import { SupportAgent } from './agent.js';

// ---------- State ----------
const state = {
  user: null,
  currentView: 'home',
  currentVideo: null,
  ledger: new CoinLedger(),
  tribes: new TribeSystem(),
  agent: new SupportAgent()
};

// Demo content (replace with real puter.fs later)
const DEMO_VIDEOS = [
  { id: 'v1', title: 'Glass UI Motion Study', creator: 'DesignLab', views: '12.4K', thumb: '✦', tribe: 't4' },
  { id: 'v2', title: 'Night Coding Session #47', creator: 'NightCoders', views: '8.1K', thumb: '💻', tribe: 't2' },
  { id: 'v3', title: 'Cinematic Color Grade', creator: 'FilmForge', views: '21.0K', thumb: '🎬', tribe: 't1' },
  { id: 'v4', title: 'Daily Calm Ritual', creator: 'QuietMind', views: '34.2K', thumb: '🕉️', tribe: 't3' },
  { id: 'v5', title: 'How Coins Actually Work', creator: 'TribeStream', views: '56.7K', thumb: '◆', tribe: 't5' },
  { id: 'v6', title: 'Safe Tribe Guidelines', creator: 'ModTeam', views: '9.8K', thumb: '🛡️', tribe: 't6' }
];

// ---------- DOM Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showView(name) {
  state.currentView = name;
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#view-${name}`)?.classList.add('active');
  $$('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });
}

function updateUserUI() {
  const signedIn = !!state.user;
  $('#btn-signin').classList.toggle('hidden', signedIn);
  $('#user-info').classList.toggle('hidden', !signedIn);
  if (signedIn) {
    $('#user-name').textContent = state.user.username || state.user.uuid?.slice(0, 8) || 'User';
    $('#coin-balance').textContent = `${state.ledger.balance} ◆`;
    $('#wallet-balance').textContent = state.ledger.balance;
  }
}

function renderFeed() {
  const container = $('#feed-container');
  container.innerHTML = DEMO_VIDEOS.map(v => `
    <article class="card" data-id="${v.id}">
      <div class="card-thumb">${v.thumb}</div>
      <div class="card-body">
        <div class="card-title">${v.title}</div>
        <div class="card-meta">${v.creator} · ${v.views} views</div>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openWatch(card.dataset.id));
  });
}

function openWatch(id) {
  const video = DEMO_VIDEOS.find(v => v.id === id);
  if (!video) return;
  state.currentVideo = video;
  $('#watch-title').textContent = video.title;
  $('#player .play-icon').textContent = '▶';
  showView('watch');

  // Related
  $('#related-list').innerHTML = DEMO_VIDEOS
    .filter(v => v.id !== id)
    .slice(0, 4)
    .map(v => `<div class="card-meta" style="margin-bottom:12px;cursor:pointer" data-id="${v.id}">${v.thumb} ${v.title}</div>`)
    .join('');

  $('#related-list').querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => openWatch(el.dataset.id));
  });
}

function renderTribes() {
  const grid = $('#tribes-grid');
  grid.innerHTML = DEMO_TRIBES.map(t => `
    <div class="tribe-card glass" data-id="${t.id}">
      <div class="tribe-icon">${t.icon}</div>
      <h3>${t.name}</h3>
      <p style="color:var(--text-dim);font-size:0.85rem;margin:6px 0">${t.desc}</p>
      <p style="color:var(--text-muted);font-size:0.8rem">${t.members.toLocaleString()} members</p>
      <button class="btn ${state.tribes.isJoined(t.id) ? '' : 'primary'}" style="margin-top:12px">
        ${state.tribes.isJoined(t.id) ? 'Enter Room' : 'Join'}
      </button>
    </div>
  `).join('');

  grid.querySelectorAll('.tribe-card').forEach(card => {
    card.addEventListener('click', async () => {
      const tribe = DEMO_TRIBES.find(t => t.id === card.dataset.id);
      if (!tribe) return;

      if (!state.tribes.isJoined(tribe.id)) {
        if (!state.user) {
          alert('Please sign in first');
          return;
        }
        await state.tribes.join(state.user.uuid || state.user.username, tribe.id);
        await state.ledger.earn(
          state.user.uuid || state.user.username,
          EARN_RATES.join_tribe,
          'Joined tribe',
          { tribe: tribe.name }
        );
        updateUserUI();
        renderTribes();
        return;
      }

      // Enter room
      state.tribes.enterRoom(tribe);
      $('#room-name').textContent = tribe.name;
      $('#room-view').classList.remove('hidden');
      renderRoomMessages();
    });
  });
}

function renderRoomMessages() {
  const box = $('#room-chat');
  box.innerHTML = state.tribes.messages.map(m => `
    <div class="msg ${m.mine ? 'mine' : ''}">
      <strong style="font-size:0.75rem;opacity:0.7">${m.user}</strong><br/>
      ${m.text}
    </div>
  `).join('');
  box.scrollTop = box.scrollHeight;
}

function renderLedger() {
  const list = $('#ledger-list');
  const items = state.ledger.getRecent(15);
  if (!items.length) {
    list.innerHTML = '<p style="color:var(--text-dim)">No activity yet. Watch, like or join a tribe to earn.</p>';
    return;
  }
  list.innerHTML = items.map(e => `
    <div class="ledger-item">
      <span>${e.reason}</span>
      <span class="${e.amount > 0 ? 'positive' : 'negative'}">
        ${e.amount > 0 ? '+' : ''}${e.amount} ◆
      </span>
    </div>
  `).join('');
}

// ---------- Auth ----------
async function handleSignIn() {
  try {
    await puter.auth.signIn();
    const user = await puter.auth.getUser();
    state.user = user;
    await state.ledger.load(user.uuid || user.username);
    await state.tribes.load(user.uuid || user.username);
    updateUserUI();
    renderTribes();
    renderLedger();
  } catch (e) {
    console.error(e);
    alert('Sign-in failed or was cancelled.');
  }
}

async function handleSignOut() {
  await puter.auth.signOut();
  state.user = null;
  state.ledger = new CoinLedger();
  state.tribes = new TribeSystem();
  updateUserUI();
  renderTribes();
  renderLedger();
}

// ---------- Engagement Actions ----------
async function doEarn(action) {
  if (!state.user) {
    alert('Sign in to earn Coins');
    return;
  }
  const amount = EARN_RATES[action] || 1;
  await state.ledger.earn(
    state.user.uuid || state.user.username,
    amount,
    action.replace('_', ' '),
    { video: state.currentVideo?.title }
  );
  updateUserUI();
  renderLedger();
}

// ---------- Agent ----------
function toggleAgent(show) {
  $('#agent-panel').classList.toggle('hidden', !show);
  if (show && state.agent.history.length === 0) {
    addAgentMsg('bot', 'Hi! I am the TribeStream Support Agent. Ask me about Coins, Tribes, how to earn, or raise any query.');
  }
}

function addAgentMsg(role, text) {
  const box = $('#agent-messages');
  const div = document.createElement('div');
  div.className = `agent-msg ${role}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendAgent() {
  const input = $('#agent-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addAgentMsg('user', text);

  const reply = await state.agent.ask(text, {
    balance: state.ledger.balance,
    signedIn: !!state.user,
    currentView: state.currentView
  });
  addAgentMsg('bot', reply);
}

// ---------- Init ----------
async function init() {
  // Navigation
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  // Auth
  $('#btn-signin').addEventListener('click', handleSignIn);
  $('#btn-signout').addEventListener('click', handleSignOut);

  // Check existing session
  if (puter.auth.isSignedIn()) {
    try {
      state.user = await puter.auth.getUser();
      await state.ledger.load(state.user.uuid || state.user.username);
      await state.tribes.load(state.user.uuid || state.user.username);
    } catch {}
  }
  updateUserUI();

  // Feed & Tribes
  renderFeed();
  renderTribes();
  renderLedger();

  // Watch actions
  $('#btn-like').addEventListener('click', () => doEarn('like'));
  $('#btn-share').addEventListener('click', () => doEarn('share'));
  $('#btn-subscribe').addEventListener('click', () => doEarn('subscribe'));
  $('#btn-join-tribe').addEventListener('click', () => {
    if (state.currentVideo?.tribe) {
      showView('tribes');
    }
  });
  $('#btn-comment').addEventListener('click', async () => {
    const text = $('#comment-text').value.trim();
    if (!text) return;
    $('#comments-list').innerHTML += `<div style="margin:8px 0;padding:8px;background:rgba(255,255,255,0.04);border-radius:8px">${text}</div>`;
    $('#comment-text').value = '';
    await doEarn('comment');
  });

  // Room
  $('#btn-leave-room').addEventListener('click', () => {
    state.tribes.leaveRoom();
    $('#room-view').classList.add('hidden');
  });
  $('#btn-send-msg').addEventListener('click', async () => {
    const text = $('#room-message').value;
    state.tribes.sendMessage(text, state.user?.username || 'You');
    $('#room-message').value = '';
    renderRoomMessages();
    if (state.user) {
      await state.ledger.earn(
        state.user.uuid || state.user.username,
        EARN_RATES.chat_message,
        'Tribe chat'
      );
      updateUserUI();
      renderLedger();
    }
  });

  // Wallet transfer
  $('#btn-transfer').addEventListener('click', async () => {
    if (!state.user) return alert('Sign in first');
    const to = $('#transfer-to').value.trim();
    const amount = Number($('#transfer-amount').value);
    if (!to || !amount) return alert('Enter username and amount');
    try {
      await state.ledger.transfer(state.user.uuid || state.user.username, to, amount);
      updateUserUI();
      renderLedger();
      alert(`Transferred ${amount} ◆ to ${to} (recorded in your ledger)`);
    } catch (e) {
      alert(e.message);
    }
  });

  // Create demo
  $('#btn-publish').addEventListener('click', () => {
    const title = $('#create-title').value.trim() || 'Untitled';
    alert(`Demo published: "${title}". Real puter.fs upload will be added next.`);
  });

  // Agent
  $('#btn-agent').addEventListener('click', () => toggleAgent(true));
  $('#btn-close-agent').addEventListener('click', () => toggleAgent(false));
  $('#btn-agent-send').addEventListener('click', sendAgent);
  $('#agent-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendAgent();
  });

  console.log('TribeStream MVP ready — Rika modular architecture active');
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
