const apiBase = '/api/notes';

const notesList = document.getElementById('notesList');
const searchEl = document.getElementById('search');
const titleEl = document.getElementById('title');
const bodyEl = document.getElementById('body');
const noteForm = document.getElementById('noteForm');
const newBtn = document.getElementById('newBtn');
const deleteBtn = document.getElementById('deleteBtn');

let current = null;
let notes = [];

// Fetch all notes
async function fetchNotes() {
    const res = await fetch(apiBase);
    if (!res.ok) {
        alert("Failed to fetch notes");
        return;
    }
    notes = await res.json();
    renderNotes();
}

// Render notes list
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

// Load note into editor
async function loadNote(id) {
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) return;
    const note = await res.json();
    current = note.id;
    titleEl.value = note.title;
    bodyEl.value = note.body;
}

// New note
newBtn.addEventListener('click', () => {
    current = null;
    titleEl.value = '';
    bodyEl.value = '';
    titleEl.focus();
});

// Save note (create/update)
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { title: titleEl.value.trim(), body: bodyEl.value };

    if (current) {
        const res = await fetch(`${apiBase}/${current}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            await fetchNotes();
            alert('Saved');
        } else alert('Save failed');
    } else {
        const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const created = await res.json();
            current = created.id;
            await fetchNotes();
            alert('Created');
        } else alert('Create failed');
    }
});

// Delete note
deleteBtn.addEventListener('click', async () => {
    if (!current) { alert('No note selected'); return; }
    if (!confirm('Delete this note?')) return;
    const res = await fetch(`${apiBase}/${current}`, { method: 'DELETE' });
    if (res.ok) {
        current = null;
        titleEl.value = '';
        bodyEl.value = '';
        await fetchNotes();
    } else alert('Delete failed');
});

// Search notes
searchEl.addEventListener('input', (e) => renderNotes(e.target.value));

// Initial load
fetchNotes();
