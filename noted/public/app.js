// -----------------------------
// GLOBALS
// -----------------------------
const apiBase = "/api/notes";
let notes = [];
let current = null;

// Wallet
let provider, signer, walletAddress = null;

// DOM
const notesGrid = document.getElementById("notesGrid");
const searchEl = document.getElementById("search");
const addNoteBtn = document.getElementById("addNoteBtn");
const editorDrawer = document.getElementById("editorDrawer");
const closeEditor = document.getElementById("closeEditor");
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const noteForm = document.getElementById("noteForm");
const deleteBtn = document.getElementById("deleteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const fontSelector = document.getElementById("fontSelector");
const walletAddressEl = document.getElementById("walletAddress");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const statusEl = document.getElementById("status");
const editorTitle = document.getElementById("editorTitle");

// -----------------------------
// FONT SELECTOR
// -----------------------------
const fonts = {
    "Inter": "'Inter', sans-serif",
    "Roboto": "'Roboto', sans-serif",
    "Arial": "Arial, sans-serif",
    "Georgia": "Georgia, serif",
    "Courier New": "'Courier New', monospace",
};

if (fontSelector) {
    Object.entries(fonts).forEach(([name, value]) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = name;
        fontSelector.appendChild(opt);
    });

    fontSelector.addEventListener("change", () => {
        bodyEl.style.fontFamily = fontSelector.value;
        titleEl.style.fontFamily = fontSelector.value;
    });
}

// -----------------------------
// WALLET CONNECT
// -----------------------------
async function connectWallet() {
    if (!window.ethereum) return alert("MetaMask not found!");
    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        walletAddress = accounts[0];
        walletAddressEl.textContent = walletAddress;
        connectWalletBtn.textContent = "Connected";
    } catch (e) {
        alert("Wallet connect failed");
    }
}
connectWalletBtn.onclick = connectWallet;

// -----------------------------
// DRAWER
// -----------------------------
function openDrawer() {
    editorDrawer.classList.add("open");
}
function closeDrawer() {
    editorDrawer.classList.remove("open");
}
closeEditor.onclick = closeDrawer;

// -----------------------------
// API: FETCH NOTES
// -----------------------------
async function fetchNotes() {
    try {
        const res = await fetch(apiBase);
        notes = await res.json();
        renderGrid(notes);
    } catch (err) {
        console.error(err);
        alert("Failed to load notes");
    }
}

// -----------------------------
// GRID RENDERING
// -----------------------------
function renderGrid(list) {
    notesGrid.innerHTML = "";

    if (!list.length) {
        notesGrid.innerHTML = `<p class="empty">No notes found</p>`;
        return;
    }

    list.forEach(note => {
        const preview = note.body.split("\n").slice(0, 5).join("\n");

        const card = document.createElement("div");
        card.className = "note-card";
        card.innerHTML = `
      <h3 class="note-title">${note.title || "Untitled"}</h3>
      <pre class="note-preview">${preview}</pre>
      <div class="note-footer">
        <span>${note.favorite ? "⭐" : ""}</span>
      </div>
    `;

        card.onclick = () => loadNote(note.id);

        notesGrid.appendChild(card);
    });
}

// LOAD A NOTE INTO DRAWER
async function loadNote(id) {
    try {
        const res = await fetch(`${apiBase}/${id}`);
        const note = await res.json();

        current = note.id;
        editorTitle.textContent = "Edit Note";

        titleEl.value = note.title;
        bodyEl.value = note.body;
        fontSelector.value = note.font || fonts["Inter"];
        bodyEl.style.fontFamily = fontSelector.value;
        titleEl.style.fontFamily = fontSelector.value;

        favoriteBtn.textContent = note.favorite ? "⭐ Favorite" : "☆ Favorite";
        openDrawer();
    } catch (err) {
        alert("Failed to load note");
    }
}

// DELETE
deleteBtn.onclick = async () => {
    if (!current) return alert("No note selected");
    if (!confirm("Delete this note?")) return;

    try {
        const res = await fetch(`${apiBase}/${current}`, { method: "DELETE" });
        if (res.ok) {
            closeDrawer();
            fetchNotes();
        } else {
            alert("Delete failed");
        }
    } catch (err) {
        alert("Error deleting note");
    }
};



// -----------------------------
// NEW NOTE
// -----------------------------
addNoteBtn.onclick = () => {
    current = null;
    editorTitle.textContent = "New Note";
    titleEl.value = "";
    bodyEl.value = "";
    favoriteBtn.textContent = "☆ Favorite";
    openDrawer();
};

// -----------------------------
// SAVE (CREATE OR UPDATE)
// -----------------------------
noteForm.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
        title: titleEl.value.trim(),
        body: bodyEl.value.trim(),
        font: fontSelector.value,
        favorite: favoriteBtn.textContent.includes("⭐")
    };

    try {
        let res;
        if (current) {
            res = await fetch(`${apiBase}/${current}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } else {
            res = await fetch(apiBase, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        }

        if (res.ok) {
            closeDrawer();
            fetchNotes();
        } else {
            alert("Save failed");
        }
    } catch (err) {
        console.error(err);
        alert("Error saving note");
    }
};



// -----------------------------
// FAVORITE FROM EDITOR
// -----------------------------
favoriteBtn.onclick = async () => {
    if (!current) return alert("Save the note first");

    const note = notes.find(n => n.id === current);
    note.favorite = !note.favorite;

    favoriteBtn.textContent = note.favorite ? "⭐ Favorite" : "☆ Favorite";

    await fetch(`${apiBase}/${current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
    });

    fetchNotes();
};

// -----------------------------
// SEARCH
// -----------------------------
searchEl.oninput = () => {
    const q = searchEl.value.toLowerCase();
    const filtered = notes.filter(n =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.body || "").toLowerCase().includes(q)
    );
    renderGrid(filtered);
};

// -----------------------------
// INIT
// -----------------------------
fetchNotes();

const darkBtn = document.getElementById("darkModeToggle");

darkBtn.onclick = () => {
    document.body.classList.toggle("dark");

    // Swap icon
    if (document.body.classList.contains("dark")) {
        darkBtn.textContent = "☀️";
    } else {
        darkBtn.textContent = "🌙";
    }
};
