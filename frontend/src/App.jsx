import { useEffect, useState } from "react";
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
  Send,
  LogOut
} from "lucide-react";
import PhotoGallery from "./components/PhotoGallery";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [currentView, setCurrentView] = useState("create");
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    title: "",
    location: "",
    entry_date: "",
    notes: "",
    transportation: "Plane"
  });
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(() => window.localStorage.getItem("travel_journal_token"));
  const [userEmail, setUserEmail] = useState(() => window.localStorage.getItem("travel_journal_user") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("travel_journal_token", token);
    } else {
      window.localStorage.removeItem("travel_journal_token");
    }
  }, [token]);

  useEffect(() => {
    if (userEmail) {
      window.localStorage.setItem("travel_journal_user", userEmail);
    } else {
      window.localStorage.removeItem("travel_journal_user");
    }
  }, [userEmail]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  function handleAuthChange(event) {
    setAuthForm({
      ...authForm,
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
      const response = await fetch(`${API_URL}/journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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

  async function submitAuth(event) {
    event.preventDefault();
    setAuthMessage("");

    try {
      const response = await fetch(`${API_URL}${authMode === "login" ? "/auth/login" : "/auth/register"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      setToken(data.access_token);
      setUserEmail(authForm.email.trim().toLowerCase());
      setAuthMessage(data.message || "Authentication successful");
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  function logout() {
    setToken(null);
    setUserEmail("");
    setCurrentView("create");
    setAuthMessage("You have been logged out.");
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Travel Journal</h1>
            <p>Capture memories, protect your stories, and revisit them anytime.</p>
          </div>

          <div className="auth-switcher">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => {
                setAuthMode("login");
                setAuthMessage("");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => {
                setAuthMode("register");
                setAuthMessage("");
              }}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={submitAuth}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="Use a strong password"
                required
              />
            </label>

            <button type="submit" className="auth-submit">
              {authMode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          {authMessage && <p className="auth-message">{authMessage}</p>}

          <p className="auth-help">
            {authMode === "login"
              ? "Need an account? Switch to register."
              : "Passwords must be at least 8 characters and include upper, lower, number, and a special character."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
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

        <div className="sidebar-footer">
          <div className="profile">
            <User size={18} />
            <span>{userEmail || "Profile"}</span>
          </div>
          <button type="button" className="logout-btn" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

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
                    type="date"
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
            <PhotoGallery photos={photos} setPhotos={setPhotos} Icon={Camera} onlyUploadBox={false} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;