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
import PhotoGallery from "./components/PhotoGallery";
import "./App.css"; // Referencing App.css verbatim

function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState("create");
  
  // share media state between views
  const [photos, setPhotos] = useState([]);

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
      {/* Sidebar navigation and profile section */}
      <aside className="sidebar">
        <nav className="side-nav">
          <a href="#create" className={currentView === "create" ? "active-nav" : ""} onClick={() => setCurrentView("create")}>
            <ListTree size={18} /> New Entry
          </a>
          <a href="#memories" className={currentView === "memories" ? "active-nav" : ""} onClick={() => setCurrentView("memories")}>
            <Images size={18} /> Gallery 
          </a>
          <a><Map size={18} /> Map</a>
          <a><LockKeyhole size={18} /> Capsule</a>
          <a><CalendarDays size={18} /> Itinerary</a>
        </nav>

      <div className="profile">
        <User size={18} />
        <span>Profile</span>
    </div>
</aside>
      {/* main application area */}
      <main className="entry-area">
        {currentView === "create" ? (
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
              {/* Photo Box upload mechanism */}
              <PhotoGallery photos={photos} setPhotos={setPhotos} Icon={Camera} onlyUploadBox={true} />

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
        ) : (
          <section className="entry-card">
            <h1>Gallery <span></span></h1>
            {/* Renders the full grid layout */}
            <PhotoGallery photos={photos} setPhotos={setPhotos} Icon={Camera} onlyUploadBox={false} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;