import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// ─── Serve frontend in production ──────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
}

// ─── Auto-create the notes table if it doesn't exist ───────────────────────
async function initDB() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Notes table ready");
    } catch (err) {
        console.error("❌ Error creating notes table:", err.message);
    }
}

// ─── API Routes ────────────────────────────────────────────────────────────

// GET /api/notes — Fetch all notes
app.get("/api/notes", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notes ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// POST /api/notes — Create a new note
app.post("/api/notes", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const result = await pool.query(
            "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
            [title, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to create note" });
    }
});

// DELETE /api/notes/:id — Delete a note by ID
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM notes WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json({ message: "Note deleted", note: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

// ─── Catch-all: serve frontend for any non-API route (production) ──────────
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
    });
}

// ─── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await initDB();
});
