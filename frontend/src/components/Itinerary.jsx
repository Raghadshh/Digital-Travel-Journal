// src/components/Itinerary.jsx
import React, { useState } from 'react';
import '../styles/Itinerary.css';

export default function Itinerary() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ date: '', time: '', activity: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', activity: '', location: '' });

  // Handle Input Changes for adding
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Input Changes for editing
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Add Activity
  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!form.date || !form.activity.trim()) return;

    const newActivity = {
      id: Date.now(),
      ...form
    };

    setActivities([...activities, newActivity]);
    setForm({ date: '', time: '', activity: '', location: '' }); // Clear form
  };

  // Delete Activity
  const handleDelete = (id) => {
    setActivities(activities.filter(act => act.id !== id));
  };

  // Start Editing
  const startEdit = (act) => {
    setEditingId(act.id);
    setEditForm({ date: act.date, time: act.time, activity: act.activity, location: act.location });
  };

  // Save Edit
  const handleSaveEdit = (id) => {
    if (!editForm.date || !editForm.activity.trim()) return;
    
    setActivities(activities.map(act => act.id === id ? { ...act, ...editForm } : act));
    setEditingId(null);
  };

  // Sort activities chronologically by Date, then by Time
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateA - dateB;
  });

  return (
    <div className="itinerary-container">
      <h2 className="itinerary-title">Trip Itinerary Timeline</h2>

      {/* Input Form Box */}
      <form onSubmit={handleAddActivity} className="itinerary-form-box">
        <div className="form-row-top">
          <input 
            type="date" 
            name="date" 
            value={form.date} 
            onChange={handleChange} 
            className="itinerary-input" 
            required 
          />
          <input 
            type="time" 
            name="time" 
            value={form.time} 
            onChange={handleChange} 
            className="itinerary-input" 
          />
        </div>
        <div className="form-row-bottom">
          <input 
            type="text" 
            name="activity" 
            placeholder="What are you doing? (e.g. Sushi Dinner)" 
            value={form.activity} 
            onChange={handleChange} 
            className="itinerary-input text-field" 
            required 
          />
          <input 
            type="text" 
            name="location" 
            placeholder="Where? (optional)" 
            value={form.location} 
            onChange={handleChange} 
            className="itinerary-input text-field" 
          />
          <button type="submit" className="btn-add-activity">Add to Timeline</button>
        </div>
      </form>

      {/* Itinerary Timeline Display */}
      <div className="timeline-wrapper">
        {sortedActivities.length === 0 ? (
          <p className="empty-state">Your schedule is wide open! Add an activity above to map your journey.</p>
        ) : (
          <div className="timeline">
            {sortedActivities.map((act) => (
              <div key={act.id} className="timeline-item">
                
                {/* Visual Connector Dot */}
                <div className="timeline-badge"></div>

                <div className="timeline-card">
                  {editingId === act.id ? (
                    /* Inline Editing Mode Fields */
                    <div className="edit-mode-grid">
                      <input type="date" name="date" value={editForm.date} onChange={handleEditChange} className="itinerary-input" />
                      <input type="time" name="time" value={editForm.time} onChange={handleEditChange} className="itinerary-input" />
                      <input type="text" name="activity" value={editForm.activity} onChange={handleEditChange} className="itinerary-input text-field" />
                      <input type="text" name="location" value={editForm.location} onChange={handleEditChange} className="itinerary-input text-field" />
                      <div className="action-buttons">
                        <button type="button" className="btn-save-act" onClick={() => handleSaveEdit(act.id)}>Save</button>
                        <button type="button" className="btn-cancel-act" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Reading Mode View */
                    <div className="view-mode-flex">
                      <div className="activity-details">
                        <span className="activity-timestamp">
                          📅 {act.date} {act.time && `⏰ ${act.time}`}
                        </span>
                        <h3 className="activity-name">{act.activity}</h3>
                        {act.location && <span className="activity-venue">📍 {act.location}</span>}
                      </div>
                      
                      <div className="action-buttons">
                        <button type="button" className="btn-edit-act" onClick={() => startEdit(act)}>Edit</button>
                        <button type="button" className="btn-delete-act" onClick={() => handleDelete(act.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}