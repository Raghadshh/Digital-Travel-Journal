import { CalendarDays, Car, MapPin, PersonStanding, Plane, Train } from "lucide-react";
import "../styles/TimelineView.css";

function getTransportIcon(type) {
  switch (type) {
    case "Car":
      return <Car size={16} />;
    case "Train":
      return <Train size={16} />;
    case "Walking":
      return <PersonStanding size={16} />;
    default:
      return <Plane size={16} />;
  }
}

function getEntryDate(entry) {
  return entry.start_date || entry.entry_date || "";
}

export default function TimelineView({ entries = [] }) {
  const sortedEntries = [...entries].sort((a, b) => new Date(getEntryDate(a)) - new Date(getEntryDate(b)));

  return (
    <div className="timeline-view-container">
      <div className="feature-panel-header timeline-heading">
        <div>
          <h2>My Travel Timeline</h2>
          <p>A chronological story of your saved memories.</p>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="empty-timeline-state">No journal entries yet. Create a new entry to start your timeline.</div>
      ) : (
        <div className="storyline">
          {sortedEntries.map((entry) => (
            <article key={entry.id} className="storyline-item">
              <div className="storyline-badge">{getTransportIcon(entry.transportation)}</div>
              <div className="storyline-card">
                <div className="storyline-card-header">
                  <span>
                    <CalendarDays size={14} /> {getEntryDate(entry)}
                  </span>
                  {entry.location && (
                    <span>
                      <MapPin size={14} /> {entry.location}
                    </span>
                  )}
                </div>
                <h3>{entry.title || "Untitled Adventure"}</h3>
                {entry.notes && <p>{entry.notes}</p>}
                <small>Traveled via {entry.transportation || "Plane"}</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
