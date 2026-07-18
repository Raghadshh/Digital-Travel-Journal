import React, { useEffect, useRef, useState } from 'react';
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
  const [musicTracks, setMusicTracks] = useState([]);
  const [playingCapsuleId, setPlayingCapsuleId] = useState(null);
  const audioRef = useRef(null);

  // Keep saved capsules synchronized with active user instance cache 
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`memory_capsules:${userEmail.trim().toLowerCase()}`, JSON.stringify(capsules));
    }
  }, [capsules, userEmail]);

  useEffect(() => {
    async function loadMusicManifest() {
      try {
        const response = await fetch('/music-manifest.json');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setMusicTracks(data);
        }
      } catch (error) {
        console.error('Failed to load capsule music manifest:', error);
      }
    }

    loadMusicManifest();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

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
      musicId: sourceEntry.music_id || sourceEntry.musicId || null,
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

  const playCapsuleMusic = async (capsule) => {
    const selectedTrack = musicTracks.find((track) => track.id === capsule.musicId) || null;
    const sourceUrl = selectedTrack?.filePath;

    if (!sourceUrl) {
      return;
    }

    if (playingCapsuleId === capsule.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingCapsuleId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const nextAudio = new Audio(sourceUrl);
    audioRef.current = nextAudio;
    setPlayingCapsuleId(capsule.id);

    try {
      await nextAudio.play();
      nextAudio.onended = () => setPlayingCapsuleId(null);
    } catch (error) {
      console.error('Failed to play capsule soundtrack:', error);
      setPlayingCapsuleId(null);
    }
  };

  const handleSchedulerKeyDown = (event, capsuleId) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setActiveSchedulerId(null);
    }
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
          <label className="sr-only" htmlFor="capsule-memory-select">Choose a memory to turn into a capsule</label>
          <select 
            id="capsule-memory-select"
            value={selectedMemoryId} 
            onChange={e => setSelectedMemoryId(e.target.value)} 
            className="memory-select"
            aria-label="Choose a memory to turn into a capsule"
          >
            <option value="">-- Choose from My Memories --</option>
            {userMemories.map(m => (
            <option key={m.id} value={String(m.id)}>
              {m.title || "Untitled"} ({m.location || "No Location"})
            </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="capsule-frequency-select">Choose reminder frequency</label>
          <select id="capsule-frequency-select" value={freqType} onChange={e => setFreqType(e.target.value)} aria-label="Choose reminder frequency">
            <option value="daily">Everyday</option>
            <option value="weekly">Once a Week</option>
            <option value="monthly">Once a Month</option>
          </select>

          {freqType === 'weekly' && (
            <>
              <label className="sr-only" htmlFor="capsule-weekly-day">Choose reminder weekday</label>
              <select id="capsule-weekly-day" value={weeklyDay} onChange={e => setWeeklyDay(e.target.value)} aria-label="Choose reminder weekday">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </>
          )}

          {freqType === 'monthly' && (
            <>
              <label className="sr-only" htmlFor="capsule-monthly-day">Choose reminder day of month</label>
              <select id="capsule-monthly-day" value={monthlyDay} onChange={e => setMonthlyDay(parseInt(e.target.value))} aria-label="Choose reminder day of month">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Day {num}</option>
                ))}
              </select>
            </>
          )}

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={isLockedInitially} 
              onChange={e => setIsLockedInitially(e.target.checked)} 
              aria-label="Lock capsule immediately"
            />
            Lock Initially
          </label>

          <button type="submit" className="create-capsule-btn" aria-label="Create capsule from selected memory"> Create Capsule</button>
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
                aria-label={`Delete capsule ${capsule.title}`}
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

                {capsule.musicId && (
                  <div className="capsule-music-box">
                    <button
                      type="button"
                      className={`capsule-music-btn ${playingCapsuleId === capsule.id ? 'playing' : ''}`}
                      onClick={() => playCapsuleMusic(capsule)}
                    >
                      {playingCapsuleId === capsule.id ? 'Pause' : 'Play'}
                    </button>
                    <div>
                      <small>Memory Soundtrack</small>
                      <p>{musicTracks.find((track) => track.id === capsule.musicId)?.title || 'Selected track'}</p>
                    </div>
                  </div>
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
                    aria-label={capsule.isLocked ? `Unlock capsule ${capsule.title}` : `Lock capsule ${capsule.title}`}
                  >
                    {capsule.isLocked ? 'Unlock Memory' : 'Lock Capsule'}
                  </button>

                  <button 
                    className="schedule-trigger-btn" 
                    onClick={() => { setActiveSchedulerId(capsule.id); setFreqType('daily'); }}
                    aria-label={`Open reminder settings for ${capsule.title}`}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {/* Inline Schedule Configuration overlay panel */}
              {activeSchedulerId === capsule.id && (
                <div className="scheduler-inline-modal" role="dialog" aria-modal="true" aria-labelledby={`scheduler-title-${capsule.id}`} onKeyDown={(event) => handleSchedulerKeyDown(event, capsule.id)}>
                  <h3 id={`scheduler-title-${capsule.id}`}>Adjust Reminders</h3>
                  <div className="input-row">
                    <label htmlFor={`capsule-frequency-${capsule.id}`}>Frequency Type:</label>
                    <select id={`capsule-frequency-${capsule.id}`} value={freqType} onChange={(e) => setFreqType(e.target.value)}>
                      <option value="daily">Everyday</option>
                      <option value="weekly">Once a Week</option>
                      <option value="monthly">Once a Month</option>
                    </select>
                  </div>

                  {freqType === 'weekly' && (
                    <div className="input-row">
                      <label htmlFor={`capsule-weekday-${capsule.id}`}>Target Weekday:</label>
                      <select id={`capsule-weekday-${capsule.id}`} value={weeklyDay} onChange={(e) => setWeeklyDay(e.target.value)}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {freqType === 'monthly' && (
                    <div className="input-row">
                      <label htmlFor={`capsule-monthday-${capsule.id}`}>Day of the Month (1-30):</label>
                      <select id={`capsule-monthday-${capsule.id}`} value={monthlyDay} onChange={(e) => setMonthlyDay(parseInt(e.target.value))}>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => (
                          <option key={dayNum} value={dayNum}>Day {dayNum}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="scheduler-actions">
                    <button className="confirm-btn" onClick={() => saveReminderSettings(capsule.id)} aria-label={`Apply reminder settings for ${capsule.title}`}>Apply Settings</button>
                    <button className="cancel-btn" onClick={() => setActiveSchedulerId(null)} aria-label={`Close reminder settings for ${capsule.title}`}>Close</button>
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

