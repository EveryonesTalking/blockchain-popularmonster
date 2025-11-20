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

// ------------------------
// FONT HANDLING
// ------------------------

// Fonts list with their respective CSS values
const fonts = {
  "Inter": "'Inter', sans-serif",
  "Roboto": "'Roboto', sans-serif",
  "Arial": "Arial, sans-serif",
  "Georgia": "Georgia, serif",
  "Courier New": "'Courier New', monospace"
};

// Populate dropdown with sample fonts
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
    alert('MetaMask not detected!');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];
    walletAddressEl.textContent = walletAddress;
    connectWalletBtn.textContent = 'Connected';
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    console.log('Wallet connected:', walletAddress);
    statusEl.textContent = 'Wallet connected.';
  } catch (err) {
    console.error(err);
    alert('Failed to connect wallet');
  }
}

connectWalletBtn.addEventListener('click', connectWallet);

// ------------------------
// NOTES FUNCTIONS
// ------------------------
async function fetchNotes() {
  const res = await fetch(apiBase);
  if (!res.ok) { alert('Failed to fetch notes'); return; }
  notes = await res.json();

  // Ensure favorites exist even if backend has no field yet
  notes = notes.map(n => ({ ...n, favorite: n.favorite ?? false, font: n.font ?? fonts["Inter"] }));

  renderNotes();
}

function renderNotes(filter = '') {
  notesList.innerHTML = '';

  const filtered = notes
    .filter(n =>
      n.title.toLowerCase().includes(filter.toLowerCase()) ||
      n.body.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => Number(b.favorite) - Number(a.favorite));

  if (filtered.length === 0) {
    notesList.innerHTML = '<li class="empty">No notes found</li>';
    return;
  }

  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    if (note.favorite) li.classList.add('favorite');

    const star = note.favorite ? '⭐' : '☆';

    li.innerHTML = `
      <div class="title" style="font-family:${note.font}">${note.title || 'Untitled'}</div>
      <div class="meta">${new Date(note.updated_at).toLocaleString()}</div>
      <button class="fav-btn" data-id="${note.id}" title="Toggle Favorite">${star}</button>
    `;

    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('fav-btn')) return;
      loadNote(note.id);
    });

    notesList.appendChild(li);
  });

  document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', toggleFavorite);
  });
}

// ⭐ FAVORITE FUNCTION (Sidebar)
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
  } catch (err) {
    alert('Failed to update favorite');
  }
}

// ⭐ LOAD NOTE
async function loadNote(id) {
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
});

// ------------------------
// SAVE NOTE
// ------------------------
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!walletAddress) { alert('Connect wallet before blockchain operations'); return; }

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
      alert(current ? 'Saved & blockchain updated' : 'Created & blockchain updated');
    } else alert('Save failed');
  } catch (err) {
    console.error(err);
    alert('Error saving note');
  }
});

// ------------------------
// DELETE NOTE
// ------------------------
deleteBtn.addEventListener('click', async () => {
  if (!current) { alert('No note selected'); return; }
  if (!walletAddress) { alert('Connect wallet before blockchain operations'); return; }
  if (!confirm('Delete this note?')) return;

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
  } else alert('Delete failed');
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
    alert('Save the note first before marking as favorite');
    return;
  }

  const note = notes.find(n => n.id === current);
  if (!note) return;

  note.favorite = !note.favorite;

  try {
    await fetch(`${apiBase}/${current}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });

    favoriteBtn.textContent = note.favorite ? '⭐ Favorite' : '☆ Favorite';
    renderNotes(searchEl.value);
  } catch (err) {
    console.error(err);
    alert('Failed to update favorite');
  }
});

// ------------------------
// INITIAL LOAD
// ------------------------
fetchNotes();

// ------------------------
// DARK MODE
// ------------------------
const darkToggle = document.getElementById('darkModeToggle');
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
