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
  LogOut,
  Eye,
  EyeOff
} from "lucide-react";
import PhotoGallery from "./components/PhotoGallery";
import LandingPage from "./components/LandingPage";
import Checklist from "./components/Checklist";
import Itinerary from "./components/Itinerary";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [currentView, setCurrentView] = useState("create");
  const [photos, setPhotos] = useState([]);
  const [showLanding, setShowLanding] = useState(true);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
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

  if (showLanding && !token) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLanding(false);
          setAuthMode("register");
        }}
        onLogIn={() => {
          setShowLanding(false);
          setAuthMode("login");
        }}
      />
    );
  }

  if (!token) {
    return (
      <div className="auth-page">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/images/mini_plane_landingpg.png" alt="Plane" className="auth-plane" />
            <span>Digital Travel Journal</span>
          </div>
          <button 
            className="auth-toggle-link"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthMessage("");
            }}
          >
            {authMode === "login" 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Log in"}
          </button>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>
              {authMode === "login" ? "Welcome Back! ❤" : "Create Account"}
            </h1>
            <p>
              {authMode === "login" 
                ? "Log in to continue your journey" 
                : "Start documenting your adventures"}
            </p>
          </div>

          <form className="auth-form" onSubmit={submitAuth}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={authMode === "login" ? (showPasswordLogin ? "text" : "password") : (showPasswordRegister ? "text" : "password")}
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => {
                    if (authMode === "login") {
                      setShowPasswordLogin(!showPasswordLogin);
                    } else {
                      setShowPasswordRegister(!showPasswordRegister);
                    }
                  }}
                >
                  {authMode === "login" ? (
                    showPasswordLogin ? <EyeOff size={18} /> : <Eye size={18} />
                  ) : (
                    showPasswordRegister ? <EyeOff size={18} /> : <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {authMode === "login" && (
              <a href="#" className="forgot-password">Forgot password?</a>
            )}

            <button type="submit" className="auth-submit">
              {authMode === "login" ? "Log In" : "Create Account"}
              {authMode === "login" && <span className="arrow">→</span>}
            </button>
          </form>

          {authMessage && <p className="auth-message">{authMessage}</p>}

          {authMode === "register" && (
            <p className="auth-help">
              Passwords must be at least 8 characters and include upper, lower, number, and a special character.
            </p>
          )}
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
          <a href="#checklist" className={currentView === "checklist" ? "active-nav" : ""} onClick={() => setCurrentView("checklist")}>
    <ListTree size={18} /> Checklist
  </a>
          <a><Map size={18} /> Map</a>
          <a><LockKeyhole size={18} /> Capsule</a>
          <a href="#itinerary" className={currentView === "itinerary" ? "active-nav" : ""} onClick={() => setCurrentView("itinerary")}>
  <CalendarDays size={18} /> Itinerary
</a>
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
        {currentView === "create" && (
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
        )}

        {currentView === "memories" && (
          <section className="entry-card">
            <h1>Gallery <span></span></h1>
            <PhotoGallery photos={photos} setPhotos={setPhotos} Icon={Camera} onlyUploadBox={false} />
          </section>
        )}

        {currentView === "checklist" && (
          <section className="entry-card">
            <Checklist />
          </section>
        )}
        {currentView === "itinerary" && (
          <section className="entry-card">
            <Itinerary />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;