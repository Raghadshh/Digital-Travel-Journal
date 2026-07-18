import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import "../styles/Checklist.css";

export default function Checklist({ storageKey = "travel_journal_checklist", token = "", apiUrl = "" }) {
  const [items, setItems] = useState(() => {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isHydrated, setIsHydrated] = useState(!token);

  useEffect(() => {
    let ignore = false;

    async function fetchItems() {
      if (!token || !apiUrl) {
        const saved = window.localStorage.getItem(storageKey);
        setItems(saved ? JSON.parse(saved) : []);
        setIsHydrated(true);
        return;
      }

      setIsHydrated(false);
      try {
        const response = await fetch(`${apiUrl}/planning/checklist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Checklist sync failed.");
        }
        const data = await response.json();
        if (!ignore) {
          setItems(data);
          setIsHydrated(true);
        }
      } catch (error) {
        console.error("Using local checklist fallback:", error);
        if (!ignore) {
          const saved = window.localStorage.getItem(storageKey);
          setItems(saved ? JSON.parse(saved) : []);
          setIsHydrated(true);
        }
      }
    }

    fetchItems();

    return () => {
      ignore = true;
    };
  }, [apiUrl, storageKey, token]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));

    if (!token || !apiUrl) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await fetch(`${apiUrl}/planning/checklist`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(items.map(({ text, completed }) => ({ text, completed })))
        });
      } catch (error) {
        console.error("Checklist stayed local because backend sync failed:", error);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [apiUrl, isHydrated, items, storageKey, token]);

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

      <div className="checklist-items-card">
        {items.length === 0 ? (
          <p className="empty-checklist">No checklist items yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`checklist-line ${item.completed ? "completed-row" : ""}`}>
              <button
                type="button"
                className={`check-toggle ${item.completed ? "checked" : ""}`}
                onClick={() => handleToggleComplete(item.id)}
                aria-label="Toggle checklist item"
              >
                {item.completed && <Check size={15} />}
              </button>

              {editingId === item.id ? (
                <input
                  className="inline-edit-input"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                />
              ) : (
                <span className={item.completed ? "completed-text" : ""}>{item.text}</span>
              )}

              <div className="table-actions">
                {editingId === item.id ? (
                  <button type="button" className="save-action" onClick={() => handleSaveEdit(item.id)}>Save</button>
                ) : (
                  <button type="button" onClick={() => startEdit(item)} disabled={item.completed} aria-label="Edit checklist item">
                    <Pencil size={14} />
                  </button>
                )}
                <button type="button" className="danger-action" onClick={() => handleDeleteItem(item.id)} aria-label="Delete checklist item">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
