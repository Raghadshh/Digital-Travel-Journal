import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import "../styles/Checklist.css";

export default function Checklist({ storageKey = "travel_journal_checklist" }) {
  const [items, setItems] = useState(() => {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  function handleAddItem(event) {
    event.preventDefault();
    if (!inputValue.trim()) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        completed: false
      }
    ]);
    setInputValue("");
  }

  function handleDeleteItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function handleToggleComplete(id) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditValue(item.text);
  }

  function handleSaveEdit(id) {
    if (!editValue.trim()) {
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, text: editValue.trim() } : item))
    );
    setEditingId(null);
    setEditValue("");
  }

  return (
    <div className="checklist-panel">
      <div className="feature-panel-header">
        <h2>Trip Checklist</h2>
        <span>{items.filter((item) => item.completed).length}/{items.length}</span>
      </div>

      <form className="checklist-form" onSubmit={handleAddItem}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Add a checklist item..."
        />
        <button type="submit" aria-label="Add checklist item">
          <Plus size={18} />
        </button>
      </form>

      <div className="feature-table-wrap">
        <table className="feature-table">
          <thead>
            <tr>
              <th>Done</th>
              <th>Task</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-table-cell">No checklist items yet.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={item.completed ? "completed-row" : ""}>
                  <td>
                    <button
                      type="button"
                      className={`check-toggle ${item.completed ? "checked" : ""}`}
                      onClick={() => handleToggleComplete(item.id)}
                      aria-label="Toggle checklist item"
                    >
                      {item.completed && <Check size={14} />}
                    </button>
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <input
                        className="inline-edit-input"
                        value={editValue}
                        onChange={(event) => setEditValue(event.target.value)}
                      />
                    ) : (
                      <span className={item.completed ? "completed-text" : ""}>{item.text}</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      {editingId === item.id ? (
                        <button type="button" onClick={() => handleSaveEdit(item.id)}>Save</button>
                      ) : (
                        <button type="button" onClick={() => startEdit(item)} disabled={item.completed}>
                          <Pencil size={14} />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
