import { CalendarDays, Car, CircleX, MapPin, PersonStanding, Plane, Train } from "lucide-react";
import { useMemo, useState } from "react";
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

function getYear(dateValue) {
  return dateValue ? new Date(`${dateValue}T00:00:00`).getFullYear() : "Upcoming";
}

function getDayLabel(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function formatDateRange(entry) {
  const start = getEntryDate(entry);
  const end = entry.end_date || "";
  if (!start) {
    return "";
  }
  return end && end !== start ? `${start} - ${end}` : start;
}

export default function TimelineView({ entries = [] }) {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(getEntryDate(b)) - new Date(getEntryDate(a))),
    [entries]
  );
  const groupedEntries = useMemo(
    () => {
      const groups = new Map();
      sortedEntries.forEach((entry) => {
        const year = getYear(getEntryDate(entry));
        groups.set(year, [...(groups.get(year) || []), entry]);
      });
      return [...groups.entries()];
    },
    [sortedEntries]
  );

  return (
    <div className="timeline-view-container">
      <div className="feature-panel-header timeline-heading">
        <div>
          <h2>My Travel Timeline</h2>
          <p>A chronological story of your saved memories.</p>
        </div>
        <img className="timeline-plane-art" src="/images/orange_plane_timelinepage.png" alt="" />
      </div>

      {sortedEntries.length === 0 ? (
        <div className="empty-timeline-state">No journal entries yet. Create a new entry to start your timeline.</div>
      ) : (
        <div className="storyline">
          {groupedEntries.map(([year, yearEntries], yearIndex) => (
            <section className={`storyline-year year-tone-${yearIndex % 3}`} key={year}>
              <div className="storyline-year-label">
                <strong>{year}</strong>
                <span />
              </div>
              {yearEntries.map((entry, entryIndex) => (
                <article key={entry.id} className="storyline-item">
                  <div className="storyline-date">{getDayLabel(getEntryDate(entry))}</div>
                  <div className={`storyline-badge badge-tone-${entryIndex % 3}`}>{getTransportIcon(entry.transportation)}</div>
                  <button type="button" className="storyline-card" onClick={() => setSelectedEntry(entry)}>
                    {entry.photos?.[0]?.url && (
                      <img className="storyline-thumb" src={entry.photos[0].url} alt={entry.title || "Travel memory"} />
                    )}
                    <div className="storyline-copy">
                      <h3>{entry.title || "Untitled Adventure"}</h3>
                      {entry.location && <p>{entry.location}</p>}
                      {entry.notes && <small>{entry.notes}</small>}
                    </div>
                  </button>
                </article>
              ))}
            </section>
          ))}
        </div>
      )}

      {selectedEntry && (
        <div className="timeline-modal" role="dialog" aria-modal="true" aria-label={`${selectedEntry.title} timeline details`}>
          <div className="timeline-modal-card">
            <button type="button" className="timeline-close-btn" onClick={() => setSelectedEntry(null)} aria-label="Close timeline details">
              <CircleX />
            </button>
            <div className="timeline-modal-header">
              <div>
                <h3>{selectedEntry.title || "Untitled Adventure"}</h3>
                <p>
                  <MapPin size={15} /> {selectedEntry.location || "No location added"}
                </p>
              </div>
              <span>
                <CalendarDays size={15} /> {formatDateRange(selectedEntry)}
              </span>
            </div>
            {selectedEntry.photos?.length > 0 && (
              <div className="timeline-modal-gallery">
                {selectedEntry.photos.map((photo) => (
                  <img key={photo.id || photo.url} src={photo.url} alt={selectedEntry.title || "Travel memory"} />
                ))}
              </div>
            )}
            <div className="timeline-modal-meta">
              <span>{getTransportIcon(selectedEntry.transportation)} {selectedEntry.transportation || "Plane"}</span>
              <span>{selectedEntry.photos?.length || 0} photos</span>
            </div>
            {selectedEntry.notes && <p className="timeline-modal-notes">{selectedEntry.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
