const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./notes.db', (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
    } else {
        console.log('✅ Connected to SQLite');
        db.run(`
            CREATE TABLE IF NOT EXISTS notes (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 title TEXT,
                                                 body TEXT,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

// ---------------- API ROUTES ----------------

// Get all notes
app.get('/api/notes', (req, res) => {
    db.all(`SELECT * FROM notes ORDER BY updated_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single note
app.get('/api/notes/:id', (req, res) => {
    db.get(`SELECT * FROM notes WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Note not found' });
        res.json(row);
    });
});

// Create note
app.post('/api/notes', (req, res) => {
    const { title = '', body = '' } = req.body;
    const stmt = db.prepare(`INSERT INTO notes (title, body) VALUES (?, ?)`);
    stmt.run(title, body, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT * FROM notes WHERE id = ?`, [this.lastID], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json(row);
        });
    });
});

// Update note
app.put('/api/notes/:id', (req, res) => {
    const { title = '', body = '' } = req.body;
    const q = `UPDATE notes 
               SET title = ?, body = ?, updated_at = datetime('now','localtime') 
               WHERE id = ?`;
    db.run(q, [title, body, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Note not found' });
        db.get(`SELECT * FROM notes WHERE id = ?`, [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row);
        });
    });
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
    db.run(`DELETE FROM notes WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Note not found' });
        res.json({ success: true });
    });
});

// ---------------- STATIC FILES ----------------
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

