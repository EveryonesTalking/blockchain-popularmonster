// =========================
// app.js — Full Wallet Next to Favorite
// =========================

const apiBase = '/api/notes';
let notes = [];
let current = null;
let provider, signer, walletAddress = null;

// DOM elements
const notesList = document.getElementById('notesList');
const searchEl = document.getElementById('search');
const titleEl = document.getElementById('title');
const bodyEl = document.getElementById('body');
const noteForm = document.getElementById('noteForm') || document.querySelector('.editor');
const newBtn = document.getElementById('newBtn');
const deleteBtn = document.getElementById('deleteBtn');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressEl = document.getElementById('walletAddress');
const statusEl = document.getElementById('status');
const favoriteBtn = document.getElementById('favoriteBtn');
const fontSelector = document.getElementById('fontSelector');
const darkToggle = document.getElementById('darkModeToggle');

// Fonts
const fonts = {
  "Inter": "'Inter', sans-serif",
  "Roboto": "'Roboto', sans-serif",
  "Arial": "Arial, sans-serif",
  "Georgia": "Georgia, serif",
  "Courier New": "'Courier New', monospace"
};

// Populate font selector
if (fontSelector) {
  fontSelector.innerHTML = Object.entries(fonts)
    .map(([name, val]) => `<option value="${val}">${name}</option>`).join('');
}

// Load saved font
const savedFont = localStorage.getItem('noteFont');
if (savedFont && titleEl && bodyEl) {
  fontSelector.value = savedFont;
  titleEl.style.fontFamily = savedFont;
  bodyEl.style.fontFamily = savedFont;
}

// Change font
if (fontSelector) {
  fontSelector.addEventListener('change', () => {
    const font = fontSelector.value;
    titleEl.style.fontFamily = font;
    bodyEl.style.fontFamily = font;
    localStorage.setItem('noteFont', font);
  });
}

// ------------------------
// Status helper
// ------------------------
function showStatus(msg, success = true, timeout = 3000) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = success ? '#FDB927' : '#FF6B6B';
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => { statusEl.textContent = ''; }, timeout);
}

// ------------------------
// Wallet
// ------------------------
async function connectWallet() {
  if (!window.ethereum) {
    showStatus('MetaMask not detected', false);
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];
    if (walletAddressEl) {
      walletAddressEl.textContent = walletAddress; // FULL address
      walletAddressEl.style.display = 'inline';
    }
    if (connectWalletBtn) {
      connectWalletBtn.textContent = 'Connected';
      connectWalletBtn.disabled = true;
      connectWalletBtn.classList.add('disabled');
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    showStatus('Wallet connected');
  } catch (err) {
    console.error(err);
    showStatus('Failed to connect wallet', false);
  }
}
connectWalletBtn && connectWalletBtn.addEventListener('click', connectWallet);

// ------------------------
// Fetch notes
// ------------------------
async function fetchNotes() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) { showStatus('Failed to fetch notes', false); return; }
    notes = await res.json();
    notes = notes.map(n => ({ ...n, favorite: n.favorite ?? false, font: n.font ?? fonts.Inter }));
    renderNotes();
  } catch (err) {
    console.error(err);
    showStatus('Error fetching notes', false);
  }
}

// ------------------------
// Render notes
// ------------------------
function renderNotes(filter = '') {
  if (!notesList) return;
  notesList.innerHTML = '';

  const q = (filter || '').toLowerCase();
  const filtered = notes
    .filter(n => (n.title || '').toLowerCase().includes(q) || (n.body || '').toLowerCase().includes(q))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || new Date(b.updated_at || 0) - new Date(a.updated_at || 0));

  if (!filtered.length) {
    notesList.innerHTML = `<li class="empty">No notes yet — create your first idea ✨</li>`;
    return;
  }

  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item' + (note.favorite ? ' favorite' : '') + (note.id === current ? ' selected' : '');
    li.innerHTML = `
      <div style="flex:1; min-width:0;">
        <div class="title" style="font-family:${note.font}">${escapeHtml(note.title || 'Untitled')}</div>
        <div class="meta">${new Date(note.updated_at || Date.now()).toLocaleString()}</div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="fav-btn" data-id="${note.id}">${note.favorite ? '⭐' : '☆'}</button>
      </div>
    `;
    li.addEventListener('click', e => {
      if (e.target.closest('.fav-btn')) return;
      loadNote(note.id);
      renderNotes(searchEl.value);
      scrollIntoViewIfNeeded(li);
    });
    notesList.appendChild(li);
  });

  document.querySelectorAll('.fav-btn').forEach(btn => btn.addEventListener('click', toggleFavorite));
}

// ------------------------
// Escape HTML
// ------------------------
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

// ------------------------
// Toggle favorite
// ------------------------
async function toggleFavorite(e) {
  const id = e.currentTarget.dataset.id;
  const note = notes.find(n => n.id == id);
  if (!note) return;
  note.favorite = !note.favorite;
  try {
    await fetch(`${apiBase}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    showStatus(note.favorite ? 'Favorited' : 'Unfavorited');
    renderNotes(searchEl.value);
  } catch (err) {
    console.error(err);
    showStatus('Failed to update', false);
  }
}

// ------------------------
// Load note
// ------------------------
async function loadNote(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) { showStatus('Failed to load note', false); return; }
    const note = await res.json();
    current = note.id;

    titleEl.value = note.title || '';
    bodyEl.value = note.body || '';

    const font = note.font || fonts.Inter;
    fontSelector.value = font;
    titleEl.style.fontFamily = font;
    bodyEl.style.fontFamily = font;

    favoriteBtn.textContent = note.favorite ? '⭐ Favorite' : '☆ Favorite';

    // FULL wallet address display
    if (walletAddressEl) {
      walletAddressEl.textContent = walletAddress || '';
      walletAddressEl.style.display = walletAddress ? 'inline' : 'none';
      walletAddressEl.style.whiteSpace = 'nowrap';
      walletAddressEl.style.overflow = 'visible';
      walletAddressEl.style.textOverflow = 'clip';
      walletAddressEl.style.fontFamily = 'monospace';
    }

    renderNotes(searchEl.value);
    showStatus('Note loaded');
  } catch (err) {
    console.error(err);
    showStatus('Failed to load note', false);
  }
}

// ------------------------
// New note
// ------------------------
newBtn && newBtn.addEventListener('click', () => {
  current = null;
  titleEl.value = '';
  bodyEl.value = '';
  favoriteBtn.textContent = '☆ Favorite';
  const font = fonts.Inter;
  fontSelector.value = font;
  titleEl.style.fontFamily = font;
  bodyEl.style.fontFamily = font;

  if (walletAddressEl) {
    walletAddressEl.textContent = '';
    walletAddressEl.style.display = 'none';
  }

  titleEl.focus();
  renderNotes(searchEl.value);
});

// ------------------------
// Save note
// ------------------------
noteForm && noteForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!walletAddress) { showStatus('Connect wallet first', false); return; }
  const existing = notes.find(n => n.id === current);
  const payload = {
    title: titleEl.value.trim(),
    body: bodyEl.value,
    favorite: existing ? existing.favorite : false,
    font: fontSelector.value
  };
  try {
    const res = current
      ? await fetch(`${apiBase}/${current}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch(apiBase, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if (!res.ok) { showStatus('Save failed', false); return; }
    await fetchNotes();
    showStatus(current ? 'Saved' : 'Created');
  } catch (err) {
    console.error(err);
    showStatus('Error saving', false);
  }
});

// ------------------------
// Delete note
// ------------------------
deleteBtn && deleteBtn.addEventListener('click', async () => {
  if (!current) { showStatus('No note selected', false); return; }
  if (!walletAddress) { showStatus('Connect wallet', false); return; }
  if (!confirm('Delete this note?')) return;
  try {
    const res = await fetch(`${apiBase}/${current}`, { method: 'DELETE' });
    if (!res.ok) { showStatus('Delete failed', false); return; }
    current = null;
    titleEl.value = '';
    bodyEl.value = '';
    favoriteBtn.textContent = '☆ Favorite';

    if (walletAddressEl) {
      walletAddressEl.textContent = '';
      walletAddressEl.style.display = 'none';
    }

    await fetchNotes();
    showStatus('Deleted');
  } catch (err) {
    console.error(err);
    showStatus('Error deleting', false);
  }
});

// ------------------------
// Favorite button in editor
// ------------------------
favoriteBtn && favoriteBtn.addEventListener('click', async () => {
  if (!current) { showStatus('Save note first', false); return; }
  const note = notes.find(n => n.id === current);
  if (!note) return;
  note.favorite = !note.favorite;

  favoriteBtn.classList.add('favorite-btn-animate');
  setTimeout(() => favoriteBtn.classList.remove('favorite-btn-animate'), 350);

  try {
    await fetch(`${apiBase}/${current}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) });
    favoriteBtn.textContent = note.favorite ? '⭐ Favorite' : '☆ Favorite';
    renderNotes(searchEl.value);
    showStatus(note.favorite ? 'Favorited' : 'Unfavorited');
  } catch (err) {
    console.error(err);
    showStatus('Failed to update', false);
  }
});

// ------------------------
// Search
// ------------------------
searchEl && searchEl.addEventListener('input', e => renderNotes(e.target.value));

// ------------------------
// Dark mode
// ------------------------
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  darkToggle && (darkToggle.textContent = '☀️');
}
darkToggle && darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ------------------------
// Utility
// ------------------------
function scrollIntoViewIfNeeded(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  if (rect.top < 0 || rect.bottom > viewHeight) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ------------------------
// Initialize
// ------------------------
window.addEventListener('DOMContentLoaded', () => {
  try { fetchNotes(); } catch (e) { console.error(e); showStatus('Init error', false); }
});
