const apiBase = '/api/notes';
let notes = [];
let current = null;

// Wallet variables
let provider, signer, walletAddress = null;

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
    renderNotes();
}

function renderNotes(filter = '') {
    notesList.innerHTML = '';
    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(filter.toLowerCase()) ||
        n.body.toLowerCase().includes(filter.toLowerCase())
    );
    if (filtered.length === 0) {
        notesList.innerHTML = '<li class="empty">No notes found</li>';
        return;
    }
    filtered.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-item';
        li.innerHTML = `
            <div class="title">${note.title || 'Untitled'}</div>
            <div class="meta">${new Date(note.updated_at).toLocaleString()}</div>
        `;
        li.addEventListener('click', () => loadNote(note.id));
        notesList.appendChild(li);
    });
}

async function loadNote(id) {
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) return;
    const note = await res.json();
    current = note.id;
    titleEl.value = note.title;
    bodyEl.value = note.body;
}

// ------------------------
// NEW NOTE
// ------------------------
newBtn.addEventListener('click', () => {
    current = null;
    titleEl.value = '';
    bodyEl.value = '';
    titleEl.focus();
});

// ------------------------
// SAVE NOTE
// ------------------------
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!walletAddress) { alert('Connect wallet before blockchain operations'); return; }

    const payload = { title: titleEl.value.trim(), body: bodyEl.value };

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
        await fetchNotes();
    } else alert('Delete failed');
});

// ------------------------
// SEARCH
// ------------------------
searchEl.addEventListener('input', (e) => renderNotes(e.target.value));

// ------------------------
// INITIAL LOAD
// ------------------------
fetchNotes();
