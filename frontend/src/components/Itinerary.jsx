import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import "../styles/Itinerary.css";

const emptyActivity = {
  date: "",
  time: "",
  activity: "",
  location: ""
};

export default function Itinerary({ storageKey = "travel_journal_itinerary" }) {
  const [activities, setActivities] = useState(() => {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState(emptyActivity);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyActivity);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(activities));
  }, [activities, storageKey]);

  const sortedActivities = useMemo(
    () =>
      [...activities].sort((a, b) => {
        const first = new Date(`${a.date}T${a.time || "00:00"}`);
        const second = new Date(`${b.date}T${b.time || "00:00"}`);
        return first - second;
      }),
    [activities]
  );

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleEditChange(event) {
    setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleAddActivity(event) {
    event.preventDefault();
    if (!form.date || !form.activity.trim()) {
      return;
    }

    setActivities((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ...form,
        activity: form.activity.trim(),
        location: form.location.trim()
      }
    ]);
    setForm(emptyActivity);
  }

  function startEdit(activity) {
    setEditingId(activity.id);
    setEditForm({
      date: activity.date,
      time: activity.time,
      activity: activity.activity,
      location: activity.location
    });
  }

  function handleSaveEdit(id) {
    if (!editForm.date || !editForm.activity.trim()) {
      return;
    }

    setActivities((current) =>
      current.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              ...editForm,
              activity: editForm.activity.trim(),
              location: editForm.location.trim()
            }
          : activity
      )
    );
    setEditingId(null);
  }

  function handleDelete(id) {
    setActivities((current) => current.filter((activity) => activity.id !== id));
  }

  return (
    <div className="itinerary-panel">
      <div className="feature-panel-header">
        <h2>Trip Itinerary</h2>
        <span>{activities.length} plans</span>
      </div>

      <form className="itinerary-form-box" onSubmit={handleAddActivity}>
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="time" name="time" value={form.time} onChange={handleChange} />
        <input
          type="text"
          name="activity"
          placeholder="Activity"
          value={form.activity}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <button type="submit" aria-label="Add itinerary activity">
          <Plus size={18} />
        </button>
      </form>

      <div className="itinerary-list">
        {sortedActivities.length === 0 ? (
          <p className="empty-itinerary">No plans yet. Add an activity to start your trip timeline.</p>
        ) : (
          sortedActivities.map((activity) => (
            <article key={activity.id} className="itinerary-item">
              <div className="itinerary-dot" />
              <div className="itinerary-card">
                {editingId === activity.id ? (
                  <div className="itinerary-edit-grid">
                    <input type="date" name="date" value={editForm.date} onChange={handleEditChange} />
                    <input type="time" name="time" value={editForm.time} onChange={handleEditChange} />
                    <input type="text" name="activity" value={editForm.activity} onChange={handleEditChange} />
                    <input type="text" name="location" value={editForm.location} onChange={handleEditChange} />
                    <button type="button" onClick={() => handleSaveEdit(activity.id)}>Save</button>
                    <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="itinerary-time">
                        <Clock size={14} /> {activity.date}{activity.time ? ` at ${activity.time}` : ""}
                      </span>
                      <h3>{activity.activity}</h3>
                      {activity.location && (
                        <p>
                          <MapPin size={14} /> {activity.location}
                        </p>
                      )}
                    </div>
                    <div className="table-actions">
                      <button type="button" onClick={() => startEdit(activity)}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(activity.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
