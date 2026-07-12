import React, { useState, useEffect } from 'react';
import '../styles/CapsuleView.css';

  const AutoSlideshow = ({ photos = [], isLocked }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isLocked || !photos || photos.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [photos, isLocked]);

  if (isLocked) {
    return (
      <div className="slideshow-placeholder locked-bg">
        <span className="lock-icon"></span>
        <p>Capsule Encrypted</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return <div className="slideshow-placeholder">No Images Found</div>;
  }

  const currentPhoto = photos[index];

  const rawPhotoUrl =
    typeof currentPhoto === "string"
      ? currentPhoto
      : currentPhoto?.url ||
        currentPhoto?.photo_url ||
        currentPhoto?.file_url ||
        currentPhoto?.path ||
        currentPhoto?.file_path ||
        currentPhoto?.filename ||
        "";

  const currentPhotoUrl =
    rawPhotoUrl &&
    !rawPhotoUrl.startsWith("http") &&
    !rawPhotoUrl.startsWith("data:")
      ? `http://127.0.0.1:8000/${rawPhotoUrl.replace(/^\/+/, "")}`
      : rawPhotoUrl;

  return (
    <div className="slideshow-frame">
      <img
        src={currentPhotoUrl}
        alt="Memory Preview"
        className="slideshow-img"
        onError={() => {
          console.log("Broken photo object:", currentPhoto);
          console.log("Resolved photo URL:", currentPhotoUrl);
        }}
      />

      <span className="image-counter">
        {index + 1}/{photos.length}
      </span>
    </div>
  );
};

export default function CapsuleView({ entries = [], userEmail = "" }) {
  // Account Isolation: Filter down entries belonging strictly to this user profile
  const userMemories = entries.filter(entry => !entry.user_email || entry.user_email === userEmail);

  // Local state container for configured capsules, isolated by unique account keys
  const [capsules, setCapsules] = useState(() => {
    const saved = localStorage.getItem(`memory_capsules:${userEmail.trim().toLowerCase()}`);
    return saved ? JSON.parse(saved) : [];
  });

  // UI interaction controllers
  const [selectedMemoryId, setSelectedMemoryId] = useState('');
  const [freqType, setFreqType] = useState('daily');
  const [weeklyDay, setWeeklyDay] = useState('Monday');
  const [monthlyDay, setMonthlyDay] = useState(1);
  const [isLockedInitially, setIsLockedInitially] = useState(false);
  const [activeSchedulerId, setActiveSchedulerId] = useState(null);

  // Keep saved capsules synchronized with active user instance cache 
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`memory_capsules:${userEmail.trim().toLowerCase()}`, JSON.stringify(capsules));
    }
  }, [capsules, userEmail]);

  // Handle turning a chosen journal entry into a Capsule
  const handleCreateCapsule = (e) => {
    e.preventDefault();
    if (!selectedMemoryId) return alert("Please pick an entry from your memory log to capsule!");

    // Stop duplication entries
  if (
    capsules.some(
      cap => String(cap.memoryId) === String(selectedMemoryId)
    )
  ) {
      return alert("This memory log has already been locked inside a capsule!");
    }

    const sourceEntry = userMemories.find(
      m => String(m.id) === String(selectedMemoryId)
    );
  if (!sourceEntry) {
    console.log("Selected ID:", selectedMemoryId);
    console.log("Available memories:", userMemories);
    return alert("The selected journal entry could not be found.");
  }

    let detailString = 'Every day';
    if (freqType === 'weekly') detailString = `Every ${weeklyDay}`;
    if (freqType === 'monthly') detailString = `Day ${monthlyDay} of the month`;

    const newCapsule = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      memoryId: sourceEntry.id,
      title: sourceEntry.title,
      location: sourceEntry.location,
      startDate: sourceEntry.start_date || sourceEntry.entry_date || "",
      endDate: sourceEntry.end_date || "",
      notes: sourceEntry.notes || "",
      transportation: sourceEntry.transportation || "Plane",
      photos: sourceEntry.photos || [],
      isLocked: isLockedInitially,
      reminder: { type: freqType.charAt(0).toUpperCase() + freqType.slice(1), detail: detailString }
    };

    setCapsules([newCapsule, ...capsules]);
    setSelectedMemoryId('');
    setIsLockedInitially(false);
  };

  const toggleLock = (id) => {
    setCapsules(prev => prev.map(c => c.id === id ? { ...c, isLocked: !c.isLocked } : c));
  };

  const deleteCapsule = (id) => {
    if (window.confirm("Are you sure you want to delete this capsule wrapper?")) {
      setCapsules(prev => prev.filter(c => c.id !== id));
    }
  };

  const saveReminderSettings = (id) => {
    let detailString = '';
    if (freqType === 'daily') detailString = 'Every day';
    if (freqType === 'weekly') detailString = `Every ${weeklyDay}`;
    if (freqType === 'monthly') detailString = `Day ${monthlyDay} of the month`;

    setCapsules(prev => prev.map(c => c.id === id ? {
      ...c,
      reminder: { type: freqType.charAt(0).toUpperCase() + freqType.slice(1), detail: detailString }
    } : c));
    setActiveSchedulerId(null);
  };

  return (
    <div className="vault-page-container">
      <div className="vault-header">
        <h1>Capsule</h1>
      </div>

      {/* CAPSULE INTEGRATION BUILDER */}
      <form className="quick-capsule-creator" onSubmit={handleCreateCapsule}>
        <h3>Wrap an Entry from Your Memories</h3>
        <div className="creator-row">
          <select 
            value={selectedMemoryId} 
            onChange={e => setSelectedMemoryId(e.target.value)} 
            className="memory-select"
          >
            <option value="">-- Choose from My Memories --</option>
            {userMemories.map(m => (
            <option key={m.id} value={String(m.id)}>
              {m.title || "Untitled"} ({m.location || "No Location"})
            </option>
            ))}
          </select>

          <select value={freqType} onChange={e => setFreqType(e.target.value)}>
            <option value="daily">Everyday</option>
            <option value="weekly">Once a Week</option>
            <option value="monthly">Once a Month</option>
          </select>

          {freqType === 'weekly' && (
            <select value={weeklyDay} onChange={e => setWeeklyDay(e.target.value)}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {freqType === 'monthly' && (
            <select value={monthlyDay} onChange={e => setMonthlyDay(parseInt(e.target.value))}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Day {num}</option>
              ))}
            </select>
          )}

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={isLockedInitially} 
              onChange={e => setIsLockedInitially(e.target.checked)} 
            />
            Lock Initially
          </label>

          <button type="submit" className="create-capsule-btn"> Create Capsule</button>
        </div>
      </form>

      {/* GRID DISPLAY */}
      {capsules.length === 0 ? (
        <div className="empty-vault-message">
          <p>No capsules created yet. Choose a trip memory above to lock it away into a capsule tracker!</p>
        </div>
      ) : (
        <div className="capsules-table-grid">
          {capsules.map((capsule) => (
            <div key={capsule.id} className={`capsule-card ${capsule.isLocked ? 'card-locked' : ''}`}>
              
              {/* Delete Pin */}
              <button
                type="button"
                className="delete-corner-btn"
                onClick={() => deleteCapsule(capsule.id)}
                title="Delete Capsule"
                aria-label="Delete capsule"
              >
                ×
              </button>
                

              <div className="card-slideshow-area">
                <AutoSlideshow photos={capsule.photos} isLocked={capsule.isLocked} />
              </div>

              <div className="card-body">
                <div className="card-meta">
                  <span className="transport-badge">
                    {capsule.transportation === 'Plane'}
                    {capsule.transportation === 'Car'}
                    {capsule.transportation === 'Train'}
                    {capsule.transportation === 'Walking'}
                  </span>
                  <span className="date-badge">
                    {capsule.endDate && capsule.endDate !== capsule.startDate 
                      ? `${capsule.startDate} - ${capsule.endDate}` 
                      : capsule.startDate}
                  </span>
                </div>

                <h2 className="card-title">{capsule.title}</h2>
                <p className="card-location"> {capsule.location}</p>

                {!capsule.isLocked ? (
                  <p className="card-desc">{capsule.notes}</p>
                ) : (
                  <p className="card-desc locked-text">This item is encrypted. Unlock capsule to inspect journal memories.</p>
                )}

                <div className="reminder-info-box">
                  <span className="bell-icon"></span>
                  <div>
                    <small>Recurrence Reminder</small>
                    <p>{capsule.reminder.type}: {capsule.reminder.detail}</p>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className={`lock-btn ${capsule.isLocked ? 'unlock-style' : 'lock-style'}`}
                    onClick={() => toggleLock(capsule.id)}
                  >
                    {capsule.isLocked ? 'Unlock Memory' : 'Lock Capsule'}
                  </button>

                  <button 
                    className="schedule-trigger-btn" 
                    onClick={() => { setActiveSchedulerId(capsule.id); setFreqType('daily'); }}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {/* Inline Schedule Configuration overlay panel */}
              {activeSchedulerId === capsule.id && (
                <div className="scheduler-inline-modal">
                  <h3>Adjust Reminders</h3>
                  <div className="input-row">
                    <label>Frequency Type:</label>
                    <select value={freqType} onChange={(e) => setFreqType(e.target.value)}>
                      <option value="daily">Everyday</option>
                      <option value="weekly">Once a Week</option>
                      <option value="monthly">Once a Month</option>
                    </select>
                  </div>

                  {freqType === 'weekly' && (
                    <div className="input-row">
                      <label>Target Weekday:</label>
                      <select value={weeklyDay} onChange={(e) => setWeeklyDay(e.target.value)}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {freqType === 'monthly' && (
                    <div className="input-row">
                      <label>Day of the Month (1-30):</label>
                      <select value={monthlyDay} onChange={(e) => setMonthlyDay(parseInt(e.target.value))}>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => (
                          <option key={dayNum} value={dayNum}>Day {dayNum}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="scheduler-actions">
                    <button className="confirm-btn" onClick={() => saveReminderSettings(capsule.id)}>Apply Settings</button>
                    <button className="cancel-btn" onClick={() => setActiveSchedulerId(null)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

