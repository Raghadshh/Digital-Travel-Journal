// src/components/TimelineView.jsx
import React from "react";
import { MapPin, Calendar, Plane, Car, Train, PersonStanding } from "lucide-react";
import "../styles/TimelineView.css";

export default function TimelineView({ entries = [] }) {
  // Sort entries chronologically by date (Oldest to Newest)
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.entry_date) - new Date(b.entry_date);
  });

  // Helper to render the correct transportation icon
  const getTransportIcon = (type) => {
    switch (type) {
      case "Plane": return <Plane size={16} />;
      case "Car": return <Car size={16} />;
      case "Train": return <Train size={16} />;
      case "Walking": return <PersonStanding size={16} />;
      default: return null;
    }
  };

  return (
    <div className="timeline-view-container">
      <h2 className="timeline-view-title">My Adventure Storyline</h2>
      <p className="timeline-view-subtitle">A chronological journey through your documented travels.</p>

      <div className="storyline-wrapper">
        {sortedEntries.length === 0 ? (
          <p className="empty-timeline-state">
            No journal entries found. Go to "New Entry" to start pinning memories to your timeline!
          </p>
        ) : (
          <div className="storyline">
            {sortedEntries.map((entry, index) => (
              <div key={entry.id || index} className="storyline-item">
                
                {/* Center Node / Dot */}
                <div className="storyline-badge">
                  {getTransportIcon(entry.transportation)}
                </div>

                {/* Content Card */}
                <div className="storyline-card">
                  <div className="storyline-card-header">
                    <span className="storyline-date">
                      <Calendar size={14} style={{ marginRight: '4px' }} />
                      {entry.entry_date}
                    </span>
                    {entry.location && (
                      <span className="storyline-location">
                        <MapPin size={14} style={{ marginRight: '2px' }} />
                        {entry.location}
                      </span>
                    )}
                  </div>

                  <h3 className="storyline-entry-title">{entry.title || "Untitled Adventure"}</h3>
                  
                  {entry.notes && (
                    <p className="storyline-notes">{entry.notes}</p>
                  )}
                  
                  <div className="storyline-footer">
                    <span className="transport-badge-label">
                      Traveled via {entry.transportation || "Plane"}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}