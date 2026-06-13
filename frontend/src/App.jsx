import { useState } from "react";
import {
  Map,
  Images,
  ListTree,
  LockKeyhole,
  CalendarDays,
  User,
  MapPin,
  Calendar,
  Plane,
  Car,
  Train,
  PersonStanding,
  Camera,
  Music,
  Play,
  Send
} from "lucide-react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    entry_date: "",
    notes: "",
    transportation: "Plane"
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function selectTransportation(type) {
    setForm({
      ...form,
      transportation: type
    });
  }

  async function saveEntry() {
    try {
      const response = await fetch("http://127.0.0.1:8000/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Failed to save entry");
      }

      setMessage("Journal entry saved successfully.");

      setForm({
        title: "",
        location: "",
        entry_date: "",
        notes: "",
        transportation: "Plane"
      });
    } catch (error) {
      setMessage("Could not save entry. Make sure the backend is running.");
    }
  }

  return (
    <div className="journal-page">
      <aside className="sidebar">
        <nav className="side-nav">
          <a><Map size={18} /> Map</a>
          <a><Images size={18} /> My Memories</a>
          <a><ListTree size={18} /> Timeline</a>
          <a><LockKeyhole size={18} /> Capsule</a>
          <a><CalendarDays size={18} /> Itinerary</a>
        </nav>

        <div className="profile">
          <User size={18} />
          <span>Profile</span>
        </div>
      </aside>

      <main className="entry-area">
        <section className="entry-card">
          <h1>Create a New Journal Entry <span>❤</span></h1>

          <div className="form-grid">
            <label>
              Trip Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Exploring Tokyo"
              />
            </label>

            <label>
              Location
              <div className="input-icon">
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Tokyo, Japan"
                />
                <MapPin size={20} />
              </div>
            </label>

            <label>
              Date
              <div className="input-icon">
                <input
                  name="entry_date"
                  value={form.entry_date}
                  onChange={handleChange}
                  type="text"
                  placeholder="mm/dd/yyyy"
                />
                <Calendar size={20} />
              </div>
            </label>

            <label>
              Transportation
              <div className="transport-row">
                <button
                  type="button"
                  className={`transport ${form.transportation === "Plane" ? "active" : ""}`}
                  onClick={() => selectTransportation("Plane")}
                >
                  <Plane />
                </button>

                <button
                  type="button"
                  className={`transport ${form.transportation === "Car" ? "active" : ""}`}
                  onClick={() => selectTransportation("Car")}
                >
                  <Car />
                </button>

                <button
                  type="button"
                  className={`transport ${form.transportation === "Train" ? "active" : ""}`}
                  onClick={() => selectTransportation("Train")}
                >
                  <Train />
                </button>

                <button
                  type="button"
                  className={`transport ${form.transportation === "Walking" ? "active" : ""}`}
                  onClick={() => selectTransportation("Walking")}
                >
                  <PersonStanding />
                </button>
              </div>
            </label>
          </div>

          <div className="bottom-row">
            <div className="photo-box">
              <Camera />
              <h3>Add Photos</h3>
              <p>Upload your photos</p>
            </div>

            <div className="music-box">
              <Music className="music-note" />
              <div>
                <h2>Music Memory</h2>
                <p>Add a song that<br />reminds you of this trip</p>
                <div className="slider">
                  <div></div>
                </div>
              </div>
              <button type="button" className="play-btn">
                <Play />
              </button>
            </div>
          </div>

          <label className="notes-label">
            Journal Description
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Write about your trip..."
            />
          </label>

          {message && <p className="status-message">{message}</p>}

          <button type="button" className="save-btn" onClick={saveEntry}>
            Save Entry <Send />
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;