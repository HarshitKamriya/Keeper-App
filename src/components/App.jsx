import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";

// In production, API is on the same origin (served by Express)
// In development, API is on localhost:5000
const API_URL =
  import.meta.env.MODE === "production"
    ? "/api/notes"
    : "http://localhost:5000/api/notes";

function App() {
  const [notes, setNotes] = useState([]);

  // Fetch all notes from the backend when the component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  }

  async function addNote(newNote) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      const savedNote = await response.json();
      setNotes((prevNotes) => [savedNote, ...prevNotes]);
    } catch (err) {
      console.error("Error adding note:", err);
    }
  }

  async function deleteNote(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem) => {
        return (
          <Note
            key={noteItem.id}
            id={noteItem.id}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        );
      })}
      <Footer />
    </div>
  );
}

export default App;
