"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

// دالة debounce بسيطة
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function Home() {
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // جلب البيانات من localStorage
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("daily-notes")) || [];
    setNotes(storedNotes);
  }, []);

  // حفظ البيانات في localStorage مع تأخير (debounce)
  useEffect(() => {
    const saveNotes = debounce(() => {
      localStorage.setItem("daily-notes", JSON.stringify(notes));
    }, 500);
    saveNotes();
  }, [notes]);

  const handleAddNote = () => {
    if (note.trim() === "" && title.trim() === "") return;
    const newNote = {
      id: Date.now(),
      title: title || "بدون عنوان",
      mood: mood || "😐",
      text: note,
      date: new Date().toLocaleString(),
      image,
    };
    setNotes([newNote, ...notes]);
    setNote("");
    setTitle("");
    setMood("");
    setImage(null);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleEdit = (id) => {
    const noteToEdit = notes.find((n) => n.id === id);
    if (noteToEdit) {
      setNote(noteToEdit.text);
      setTitle(noteToEdit.title);
      setMood(noteToEdit.mood);
      setImage(noteToEdit.image || null);
      handleDelete(id);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles.main}>
      <h1>📔 My Daily Diary</h1>

      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="🧠 Title"
        />
        <select
          className={styles.input}
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="">😐 Choose your mood</option>
          <option value="😊 Happy">😊 Happy</option>
          <option value="😔 Sad">😔 Sad</option>
          <option value="😡 Angry">😡 Angry</option>
          <option value="🤔 Pensive">🤔 Pensive</option>
          <option value="😴 Tired">😴 Tired</option>
        </select>

        <textarea
          className={styles.textarea}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
        />

        <label className={styles.uploadButton}>
          📸 Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>

        <button className={styles.button} onClick={handleAddNote}>
          Add
        </button>
      </div>

      <input
        type="text"
        className={styles.search}
        placeholder="🔍 Search the notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <p> Number of notes: {filteredNotes.length}</p>

      <ul className={styles.notes}>
        {filteredNotes.map((n) => (
          <li key={n.id} className={styles.noteItem}>
            <div
              className={styles.noteHeader}
              onClick={() => toggleExpand(n.id)}
            >
              <strong>
                {n.title} - {n.mood}
              </strong>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(n.id);
                }}
              >
                Delete
              </button>
            </div>
            {expanded[n.id] && (
              <div className={styles.noteContent}>
                <div>
                  <strong>✍️:</strong> {n.text}
                </div>
                <small>📅 {n.date}</small>
                {n.image && (
                  <img
                    src={n.image}
                    alt="Note"
                    className={styles.imagePreview}
                  />
                )}
                <div></div>
                <button
                  className={styles.editButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(n.id);
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
