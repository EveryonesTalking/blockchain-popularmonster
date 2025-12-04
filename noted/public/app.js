// ------------------------
// GLOBAL VARIABLES
// ------------------------
const apiBase = '/api/notes';
let notes = [];
let current = null;

// Wallet variables
let provider, signer, walletAddress = null;

// DOM elements
const notesList = document.getElementById('notesList');
const searchEl = document.getElementById('search');
const titleEl = document.getElementById('title');
const bodyEl = document.getElementById('body');
const noteForm = document.getElementById('noteForm');
const newBtn = document.getElementById('newBtn');
const deleteBtn = document.getElementById('deleteBtn');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressEl = document.getElementById('walletAddress');
const statusEl = document.getElementById('status');
const favoriteBtn = document.getElementById('favoriteBtn');
const fontSelector = document.getElementById('fontSelector');
const darkToggle = document.getElementById('darkModeToggle');

// ------------------------
// FONTS
// ------------------------
const fonts = {
  "Inter": "'Inter', sans-serif",
  "Roboto": "'Roboto', sans-serif",
  "Arial": "Arial, sans-serif",
  "Georgia": "Georgia, serif",
  "Courier New": "'Courier New', monospace"
};

// Populate dropdown
fontSelector.innerHTML = Object.entries(fonts)
  .map(([name, value]) => `<option value="${value}" style="font-family:${value}">${name}</option>`)
  .join('');

// Load saved font
const savedFont = localStorage.getItem('noteFont');
if (savedFont) {
  fontSelector.value = savedFont;
  titleEl.style.fontFamily = savedFont;
  bodyEl.style.fontFamily = savedFont;
}

// Change font event
fontSelector.addEventListener('change', () => {
  const font = fontSelector.value;
  titleEl.style.fontFamily = font;
  bodyEl.style.fontFamily = font;
  localStorage.setItem('noteFont', font);
});

// ------------------------
// WALLET FUNCTIONS
// ------------------------
async function connectWallet() {
  if (!window.ethereum) {
    showStatus('MetaMask not detected!', false);
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];
    walletAddressEl.textContent = walletAddress;
    connectWalletBtn.textContent = 'Connected';
    connectWalletBtn.disabled = true;
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    console.log('Wallet connected:', walletAddress);
    showStatus('Wallet connected.');
  } catch (err) {
    console.error(err);
    showStatus('Failed to connect wallet', false);
  }
}

connectWalletBtn.addEventListener('click', connectWallet);

// ------------------------
// NOTES FUNCTIONS
// ------------------------
async function fetchNotes() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) { showStatus('Failed to fetch notes', false); return; }
    notes = await res.json();
    notes = notes.map(n => ({ ...n, favorite: n.favorite ?? false, font: n.font ?? fonts["Inter"] }));
    renderNotes();
  } catch (err) {
    console.error(err);
    showStatus('Error fetching notes', false);
  }
}

function renderNotes(filter = '') {
  notesList.innerHTML = '';

  const filtered = notes
    .filter(n => n.title.toLowerCase().includes(filter.toLowerCase()) || n.body.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite));

  if (filtered.length === 0) {
    notesList.innerHTML = '<li class="empty">No notes found</li>';
    return;
  }

  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    if (note.favorite) li.classList.add('favorite');
    if (note.id === current) li.classList.add('selected');

    const star = note.favorite ? '⭐' : '☆';

    li.innerHTML = `
      <div class="title" style="font-family:${note.font}">${note.title || 'Untitled'}</div>
      <div class="meta">${new Date(note.updated_at).toLocaleString()}</div>
      <button class="fav-btn" data-id="${note.id}" title="Toggle Favorite">${star}</button>
    `;

    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('fav-btn')) return;
      loadNote(note.id);
      renderNotes(searchEl.value);
    });

    notesList.appendChild(li);
  });

  document.querySelectorAll('.fav-btn').forEach(btn => btn.addEventListener('click', toggleFavorite));
}

// ------------------------
// FAVORITE FUNCTIONS
// ------------------------
async function toggleFavorite(e) {
  const id = e.target.dataset.id;
  const note = notes.find(n => n.id == id);
  if (!note) return;

  note.favorite = !note.favorite;

  try {
    await fetch(`${apiBase}/${id}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...note })
    });
    renderNotes(searchEl.value);
    showStatus(`Note ${note.favorite ? 'favorited' : 'unfavorited'}`);
  } catch (err) {
    console.error(err);
    showStatus('Failed to update favorite', false);
  }
}

// ------------------------
// LOAD NOTE
// ------------------------
async function loadNote(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) return;
    const note = await res.json();
    current = note.id;
    titleEl.value = note.title;
    bodyEl.value = note.body;

    const font = note.font ?? fonts["Inter"];
    fontSelector.value = font;
    titleEl.style.fontFamily = font;
    bodyEl.style.fontFamily = font;

    favoriteBtn.textContent = note.favorite ? '⭐ Favorite' : '☆ Favorite';
    renderNotes(searchEl.value);
  } catch (err) {
    console.error(err);
    showStatus('Failed to load note', false);
  }
}

// ------------------------
// NEW NOTE
// ------------------------
newBtn.addEventListener('click', () => {
  current = null;
  titleEl.value = '';
  bodyEl.value = '';
  favoriteBtn.textContent = '☆ Favorite';
  const font = fonts["Inter"];
  fontSelector.value = font;
  titleEl.style.fontFamily = font;
  bodyEl.style.fontFamily = font;
  titleEl.focus();
  renderNotes(searchEl.value);
});

// ------------------------
// SAVE NOTE
// ------------------------
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!walletAddress) { showStatus('Connect wallet before blockchain operations', false); return; }

  const existing = notes.find(n => n.id === current);
  const payload = {
    title: titleEl.value.trim(),
    body: bodyEl.value,
    favorite: existing ? existing.favorite : false,
    font: fontSelector.value
  };

  try {
    let res;
    if (current) {
      res = await fetch(`${apiBase}/${current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      await fetchNotes();
      showStatus(current ? 'Saved & blockchain updated' : 'Created & blockchain updated');
    } else showStatus('Save failed', false);
  } catch (err) {
    console.error(err);
    showStatus('Error saving note', false);
  }
});

// ------------------------
// DELETE NOTE
// ------------------------
deleteBtn.addEventListener('click', async () => {
  if (!current) { showStatus('No note selected', false); return; }
  if (!walletAddress) { showStatus('Connect wallet before blockchain operations', false); return; }
  if (!confirm('Delete this note?')) return;

  try {
    const res = await fetch(`${apiBase}/${current}`, { method: 'DELETE' });
    if (res.ok) {
      current = null;
      titleEl.value = '';
      bodyEl.value = '';
      favoriteBtn.textContent = '☆ Favorite';
      const font = fonts["Inter"];
      fontSelector.value = font;
      titleEl.style.fontFamily = font;
      bodyEl.style.fontFamily = font;
      await fetchNotes();
      showStatus('Note deleted');
    } else showStatus('Delete failed', false);
  } catch (err) {
    console.error(err);
    showStatus('Error deleting note', false);
  }
});

// ------------------------
// SEARCH
// ------------------------
searchEl.addEventListener('input', (e) => renderNotes(e.target.value));

// ------------------------
// EDITOR FAVORITE BUTTON
// ------------------------
favoriteBtn.addEventListener('click', async () => {
  if (!current) {
    showStatus('Save the note first before marking as favorite', false);
    return;
  }

  const note = notes.find(n => n.id === current);
  if (!note) return;

  note.favorite = !note.favorite;
  favoriteBtn.classList.add('favorite-btn-animate');
  setTimeout(() => favoriteBtn.classList.remove('favorite-btn-animate'), 300);

  try {
    await fetch(`${apiBase}/${current}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });

    favoriteBtn.textContent = note.favorite ? '⭐ Favorite' : '☆ Favorite';
    renderNotes(searchEl.value);
    showStatus(`Note ${note.favorite ? 'favorited' : 'unfavorited'}`);
  } catch (err) {
    console.error(err);
    showStatus('Failed to update favorite', false);
  }
});

// ------------------------
// DARK MODE
// ------------------------
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  darkToggle.textContent = '☀️';
}

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ------------------------
// STATUS MESSAGE
// ------------------------
function showStatus(message, success = true) {
  statusEl.textContent = message;
  statusEl.style.color = success ? '#00B3C6' : '#FF4500';
  setTimeout(() => statusEl.textContent = '', 3000);
}

// ------------------------
// INITIAL LOAD
// ------------------------
fetchNotes();
