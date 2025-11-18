/* app.js
   - MetaMask + ethers.js (CDN) integration
   - For every CREATE/UPDATE/DELETE we execute a blockchain tx,
     then update the local REST API so on-chain ID and DB stay in sync.
*/

/* ============ CONFIG ============ */
// Replace with your contract address & ABI
const CONTRACT_ADDRESS = "REPLACE_WITH_YOUR_CONTRACT_ADDRESS";

// Minimal example ABI: adjust to your contract.
// Must include the create/update/delete function signatures and NoteCreated event (or adapt parsing logic).
const ABI = [
  "function createNote(string title, string body) public returns (uint256)",
  "function updateNote(uint256 id, string title, string body) public",
  "function deleteNote(uint256 id) public",
  "event NoteCreated(uint256 indexed id)"
];

/* ============ Ethers + Wallet ============ */
let provider = null;
let signer = null;
let contract = null;
let connectedAddress = null;

const connectWalletBtn = document.getElementById('connectWalletBtn');
const addressBadge = document.getElementById('addressBadge');
const statusEl = document.getElementById('status');

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("MetaMask not detected.");

    // request accounts
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // ethers v5/v6 CDN variation: window.ethers likely exists
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    connectedAddress = await signer.getAddress();

    // Create contract connected to signer
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    addressBadge.textContent = truncateAddress(connectedAddress);
    connectWalletBtn.textContent = "Connected";
    connectWalletBtn.disabled = true;
    logStatus("Wallet connected: " + connectedAddress);
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed: " + (err.message || err));
  }
}

function truncateAddress(addr) {
  if (!addr) return "Not connected";
  return addr.slice(0,6) + "…" + addr.slice(-4);
}

connectWalletBtn.addEventListener('click', connectWallet);

/* ============ APP (local REST) ============ */
const apiBase = '/api/notes';

const notesList = document.getElementById('notesList');
const searchEl = document.getElementById('search');
const titleEl = document.getElementById('title');
const bodyEl = document.getElementById('body');
const noteForm = document.getElementById('noteForm');
const newBtn = document.getElementById('newBtn');
const deleteBtn = document.getElementById('deleteBtn');

let current = null; // current note id (local DB id)
let notes = [];     // local notes array

/* Utility to show status messages */
function logStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#b91c1c' : '#0f172a';
}

/* Fetch all notes (READ does NOT perform blockchain tx) */
async function fetchNotes() {
  try {
    const res = await fetch(apiBase);
    if (!res.ok) throw new Error("Failed to fetch notes: " + res.statusText);
    notes = await res.json();
    renderNotes();
  } catch (err) {
    console.error(err);
    logStatus("Failed to fetch notes", true);
  }
}

/* Render notes list */
function renderNotes(filter = '') {
  notesList.innerHTML = '';
  const filtered = notes.filter(n =>
    (n.title || '').toLowerCase().includes(filter.toLowerCase()) ||
    (n.body || '').toLowerCase().includes(filter.toLowerCase())
  );
  if (filtered.length === 0) {
    notesList.innerHTML = '<li class="empty">No notes found</li>';
    return;
  }
  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    li.innerHTML = `
      <div class="title">${escapeHtml(note.title) || 'Untitled'}</div>
      <div class="meta">${new Date(note.updated_at).toLocaleString()}</div>
    `;
    li.addEventListener('click', () => loadNote(note.id));
    notesList.appendChild(li);
  });
}

/* Escaping helper to avoid injection when rendering simple text */
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

/* Load note into the editor (READ - no blockchain) */
async function loadNote(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) throw new Error('Failed to load note');
    const note = await res.json();
    current = note.id;
    titleEl.value = note.title || '';
    bodyEl.value = note.body || '';
    logStatus("Loaded note " + current);
  } catch (err) {
    console.error(err);
    logStatus("Failed to load note", true);
  }
}

/* New note button */
newBtn.addEventListener('click', () => {
  current = null;
  titleEl.value = '';
  bodyEl.value = '';
  titleEl.focus();
});

/* Save note (Create or Update) -> Blockchain TX then local API */
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleEl.value.trim();
  const body = bodyEl.value;
  const payload = { title, body };

  if (!contract) {
    return alert("Connect wallet before performing blockchain operations.");
  }

  // Disable UI while processing
  setUIEnabled(false);
  try {
    if (current) {
      // UPDATE path:
      logStatus("Sending update transaction to chain...");
      const tx = await contract.updateNote(current, title, body);
      logStatus("Waiting for update tx confirmation...");
      await tx.wait();

      // After on-chain success, update local DB
      const res = await fetch(`${apiBase}/${current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Local update failed');
      await fetchNotes();
      logStatus("Note updated on chain and local DB");
      alert("Saved (on-chain + local)");
    } else {
      // CREATE path:
      logStatus("Sending create transaction to chain...");
      const tx = await contract.createNote(title, body);
      logStatus("Waiting for create tx confirmation...");
      const receipt = await tx.wait();

      // Parse logs to find NoteCreated event and id
      let onChainId = null;
      try {
        // Iterate logs and attempt to parse with contract.interface
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === "NoteCreated") {
              // assume event has first arg as id
              onChainId = parsed.args[0].toString();
              break;
            }
          } catch (e) {
            // not this event log; continue
          }
        }
      } catch (err) {
        console.warn("Event parsing failed", err);
      }

      if (!onChainId) {
        // If event parsing fails, optionally ask user to input chain id or fallback
        console.warn("Could not parse NoteCreated event. Please verify contract emits it.");
        // We'll still proceed but without onChainId — backend may generate its own id.
      }

      // Include onChainId in payload if available so backend can store it
      if (onChainId) payload.on_chain_id = onChainId;

      // Save in local DB
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Local create failed');
      const created = await res.json();

      // If DB returns its own id, set current to it
      current = created.id;
      await fetchNotes();
      logStatus("Created on chain and stored locally (DB id: " + current + ")");
      alert("Created (on-chain + local)");
    }
  } catch (err) {
    console.error(err);
    logStatus("Operation failed: " + (err.message || err), true);
    alert("Transaction or local operation failed. See console for details.");
  } finally {
    setUIEnabled(true);
  }
});

/* Delete note -> Blockchain TX then local API delete */
deleteBtn.addEventListener('click', async () => {
  if (!current) { alert('No note selected'); return; }
  if (!confirm('Delete this note? This will send a blockchain transaction.')) return;
  if (!contract) return alert("Connect wallet before performing blockchain operations.");

  setUIEnabled(false);
  try {
    logStatus("Sending delete transaction to chain...");
    const tx = await contract.deleteNote(current);
    logStatus("Waiting for delete tx confirmation...");
    await tx.wait();

    // Delete in local DB
    const res = await fetch(`${apiBase}/${current}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Local delete failed');

    current = null;
    titleEl.value = '';
    bodyEl.value = '';
    await fetchNotes();
    logStatus("Deleted on chain and local DB");
    alert("Deleted (on-chain + local)");
  } catch (err) {
    console.error(err);
    logStatus("Delete failed: " + (err.message || err), true);
    alert("Delete failed. See console.");
  } finally {
    setUIEnabled(true);
  }
});

/* Local search */
searchEl.addEventListener('input', (e) => renderNotes(e.target.value));

/* UI enable/disable while performing transactions */
function setUIEnabled(enabled) {
  const inputs = [searchEl, titleEl, bodyEl, newBtn, deleteBtn];
  inputs.forEach(i => i.disabled = !enabled);
  connectWalletBtn.disabled = !enabled ? true : connectWalletBtn.disabled; // keep connect disabled while busy
}

/* Initial load */
fetchNotes();
logStatus("App ready");

/* Optional: react to account change or network change in MetaMask */
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      addressBadge.textContent = 'Not connected';
      connectWalletBtn.disabled = false;
      connectWalletBtn.textContent = 'Connect Wallet';
      contract = null;
      logStatus("Wallet disconnected", true);
    } else {
      // reload to reflect the new account; simpler than trying to swap signer mid-session
      window.location.reload();
    }
  });

  window.ethereum.on('chainChanged', () => {
    // network changed — reload to keep things simple and consistent
    window.location.reload();
  });
}
