import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { MapPin, Plus, X, Eye, CalendarDays } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({ entries, onNewEntry }) {
  const [selectedEntry, setSelectedEntry] = useState(null);

  const pinnedEntries = entries.filter(
    (entry) => entry.latitude && entry.longitude
  );

  function formatDate(entry) {
    const start = entry.start_date || entry.entry_date || "";
    const end = entry.end_date || "";
    return end && end !== start ? `${start} - ${end}` : start;
  }

  return (
    <div className="world-map-page">
      <div className="page-heading">
        <div>
          <h1>Where to next?</h1>
          <p>Your adventures on the map</p>
        </div>

        <button type="button" className="new-entry-btn" onClick={onNewEntry}>
          <Plus size={16} /> New Entry
        </button>
      </div>

      <div className="world-map-card">
        <ComposableMap projectionConfig={{ scale: 145 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#F5E7B8"
                  stroke="#D9BF8F"
                  strokeWidth={0.55}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#EFD99D", outline: "none" },
                    pressed: { fill: "#EFD99D", outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {pinnedEntries.map((entry) => (
            <Marker
              key={entry.id}
              coordinates={[entry.longitude, entry.latitude]}
              onClick={() => setSelectedEntry(entry)}
            >
              <g className="map-pin" transform="translate(-12, -28)">
                <path
                  d="M12 0C5.8 0 1 4.8 1 10.8C1 18.9 12 28 12 28C12 28 23 18.9 23 10.8C23 4.8 18.2 0 12 0Z"
                  fill="#F97316"
                  stroke="white"
                  strokeWidth="3"
                />
                <circle cx="12" cy="10.5" r="4.5" fill="white" />
              </g>
            </Marker>
          ))}
        </ComposableMap>

        {selectedEntry && (
          <div className="map-popup">
            <button
              type="button"
              className="map-popup-close"
              onClick={() => setSelectedEntry(null)}
            >
              <X size={18} />
            </button>

            {selectedEntry.photos?.[0]?.url && (
              <img
                src={selectedEntry.photos[0].url}
                alt={selectedEntry.title}
                className="map-popup-img"
              />
            )}

            <div className="map-popup-content">
              <h2>{selectedEntry.title}</h2>
              <p>
                <MapPin size={15} /> {selectedEntry.location}
              </p>
              <p>
                <CalendarDays size={15} /> {formatDate(selectedEntry)}
              </p>
              {selectedEntry.notes && <span>{selectedEntry.notes}</span>}

            
            </div>
          </div>
        )}

        {pinnedEntries.length === 0 && (
          <div className="map-empty-message">
            Save an entry to see pins here.
          </div>
        )}
      </div>
    </div>
  );
}