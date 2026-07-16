import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Car,
  ChevronLeft,
  CircleX,
  Eye,
  EyeOff,
  Filter,
  Heart,
  Images,
  ListTree,
  LockKeyhole,
  LogOut,
  Map,
  MapPin,
  Music,
  Pencil,
  Send,
  PersonStanding,
  Plane,
  Play,
  Search,
  Trash2,
  Train,
  User,
  BarChart2
} from "lucide-react";
import PhotoGallery from "./components/PhotoGallery";
import LandingPage from "./components/LandingPage";
import Checklist from "./components/Checklist";
import Itinerary from "./components/Itinerary";
import TimelineView from "./components/TimelineView";
import CapsuleView from "./components/CapsuleView";
import TravelStats from "./components/TravelStats";
import WorldMap from "./components/WorldMap";
import "./App.css";
import MusicPicker from "./components/MusicPicker";

const API_URL = "http://127.0.0.1:8000";
const emptyEntry = {
  title: "",
  location: "",
  country: "",
  latitude: null,
  longitude: null,
  start_date: "",
  end_date: "",
  notes: "",
  transportation: "Plane",
  photos: [],
  musicId: null
};

const locationSuggestions = [
  "Tokyo, Japan",
  "Santorini, Greece",
  "Lucerne, Switzerland",
  "Paris, France",
  "Dubai, UAE",
  "Hawaii, USA",
  "Scotland, United Kingdom",
  "Portugal",
  "Kyoto, Japan",
  "Rome, Italy"
];

function entriesStorageKey(email) {
  return `travel_journal_entries:${email.trim().toLowerCase()}`;
}

function profileNameKey(email) {
  return `travel_journal_name:${email.trim().toLowerCase()}`;
}

function getStoredProfileName(email) {
  return email ? window.localStorage.getItem(profileNameKey(email)) : "";
}

function rememberProfileName(email, name) {
  if (email && name) {
    window.localStorage.setItem(profileNameKey(email), name);
  }
}

function getStoredEntries(email) {
  if (!email) {
    return [];
  }

  const saved = window.localStorage.getItem(entriesStorageKey(email));
  return saved ? JSON.parse(saved) : [];
}

function simplifyPlace(place) {
  const address = place.address || {};
  const parts = [
    place.name,
    address.city || address.town || address.village || address.municipality || address.county,
    address.state,
    address.country
  ].filter(Boolean);

  const uniqueParts = [...new Set(parts)];
  if (uniqueParts.length > 0) {
    return uniqueParts.join(", ");
  }

  return (place.display_name || "").split(",").slice(0, 3).map((part) => part.trim()).join(", ");
}

async function geocodeLocation(location) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(location)}`
  );

  const data = await response.json();

  if (!data.length) {
    return {
      country: "",
      latitude: null,
      longitude: null
    };
  }

  const place = data[0];

  return {
    country: place.address?.country || "",
    latitude: Number(place.lat),
    longitude: Number(place.lon)
  };
}

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.1-2 3.2-4.9 3.2-8.3z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.6l-3.7-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-2-6.2-4.6H2v2.9C3.8 20.5 7.6 23 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7H2c-.8 1.5-1.2 3.2-1.2 5s.4 3.5 1.2 5l3.8-2.9z" />
      <path fill="#EA4335" d="M12 5.3c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2 15 1 12 1 7.6 1 3.8 3.5 2 7l3.8 2.9C6.7 7.3 9.1 5.3 12 5.3z" />
    </svg>
  );
}

function App() {
  const [currentView, setCurrentView] = useState("memories");
  const [showLanding, setShowLanding] = useState(true);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [form, setForm] = useState(emptyEntry);
  const [entries, setEntries] = useState(() => {
    const email = window.localStorage.getItem("travel_journal_user") || "";
    return getStoredEntries(email);
  });
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(() => window.localStorage.getItem("travel_journal_token"));
  const [userEmail, setUserEmail] = useState(() => window.localStorage.getItem("travel_journal_user") || "");
  const [userName, setUserName] = useState(() => {
    const email = window.localStorage.getItem("travel_journal_user") || "";
    return getStoredProfileName(email) || window.localStorage.getItem("travel_journal_name") || "";
  });
  const [profilePicture, setProfilePicture] = useState(() => window.localStorage.getItem("travel_journal_pfp") || "");
  const [profileForm, setProfileForm] = useState({
    name: window.localStorage.getItem("travel_journal_name") || ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ full_name: "", email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");
  const [memorySearch, setMemorySearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [memoryFilters, setMemoryFilters] = useState({ location: "", startDate: "", endDate: "" });
  const [locationOptions, setLocationOptions] = useState([]);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    token
      ? window.localStorage.setItem("travel_journal_token", token)
      : window.localStorage.removeItem("travel_journal_token");
  }, [token]);

  useEffect(() => {
    userEmail
      ? window.localStorage.setItem("travel_journal_user", userEmail)
      : window.localStorage.removeItem("travel_journal_user");
  }, [userEmail]);

  useEffect(() => {
    if (userName) {
      window.localStorage.setItem("travel_journal_name", userName);
      rememberProfileName(userEmail, userName);
    } else {
      window.localStorage.removeItem("travel_journal_name");
    }
  }, [userEmail, userName]);

  useEffect(() => {
    profilePicture
      ? window.localStorage.setItem("travel_journal_pfp", profilePicture)
      : window.localStorage.removeItem("travel_journal_pfp");
  }, [profilePicture]);

  useEffect(() => {
    if (userEmail) {
      window.localStorage.setItem(entriesStorageKey(userEmail), JSON.stringify(entries));
    }
  }, [entries, userEmail]);

  useEffect(() => {
    async function fetchEntries() {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/journals`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        }
      } catch (error) {
        console.error("Failed to load records from backend server:", error);
      }
    }
    fetchEntries();
  }, [token, userEmail]);

  useEffect(() => {
    const query = form.location.trim();
    let ignore = false;

    if (query.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const fallbackOptions = locationSuggestions.filter((location) =>
        location.toLowerCase().includes(query.toLowerCase())
      );

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if (!ignore) {
          const apiOptions = data.map(simplifyPlace).filter(Boolean);
          const nextOptions = [...new Set([...fallbackOptions, ...apiOptions])].slice(0, 6);
          setLocationOptions(nextOptions);
          setShowLocationOptions(nextOptions.length > 0);
        }
      } catch {
        if (!ignore) {
          setLocationOptions(fallbackOptions);
          setShowLocationOptions(fallbackOptions.length > 0);
        }
      }
    }, 160);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [form.location]);

  const filteredEntries = useMemo(() => {
    const keyword = memorySearch.trim().toLowerCase();
    const location = memoryFilters.location.trim().toLowerCase();

    return entries
      .filter((entry) => entry.photos?.length)
      .filter((entry) => !entry.user_email || entry.user_email === userEmail)
      .filter((entry) => {
        const entryStart = entry.start_date || entry.entry_date || "";
        const matchesKeyword =
          !keyword ||
          [entry.title, entry.location, entryStart, entry.end_date, entry.notes]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(keyword));
        const matchesLocation = !location || (entry.location || "").toLowerCase().includes(location);
        const matchesStart = !memoryFilters.startDate || entryStart >= memoryFilters.startDate;
        const matchesEnd = !memoryFilters.endDate || entryStart <= memoryFilters.endDate;

        return matchesKeyword && matchesLocation && matchesStart && matchesEnd;
      });
  }, [entries, memoryFilters, memorySearch, userEmail]);

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

  function handleFilterChange(event) {
    setMemoryFilters({
      ...memoryFilters,
      [event.target.name]: event.target.value
    });
  }

  function handleProfileChange(event) {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value
    });
  }

  function handleLocationChange(event) {
    const nextLocation = event.target.value;
    setForm({
      ...form,
      location: nextLocation
    });
    if (nextLocation.trim().length < 2) {
      setLocationOptions([]);
      setShowLocationOptions(false);
      return;
    }
    setShowLocationOptions(true);
  }

  function selectLocationSuggestion(location) {
    setForm({
      ...form,
      location
    });
    setShowLocationOptions(false);
  }

  function handleProfilePictureChange(event) {
    const file = event.target.files?.[0];
    setProfileMessage("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function saveProfile(event) {
    event.preventDefault();
    const nextName = profileForm.name.trim();
    const nextDisplayName = nextName || userEmail.split("@")[0] || "Traveler";

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ full_name: nextDisplayName })
      });

      if (!response.ok) {
        throw new Error("Profile saved locally. Start the backend to sync it.");
      }

      const data = await response.json();
      const savedName = data.name || nextDisplayName;
      setUserName(savedName);
      setProfileForm({ name: savedName });
      rememberProfileName(userEmail, savedName);
      setProfileMessage("Profile updated.");
    } catch (error) {
      setUserName(nextDisplayName);
      setProfileForm({ name: nextDisplayName });
      rememberProfileName(userEmail, nextDisplayName);
      setProfileMessage(error.message || "Profile saved locally.");
    }
  }

  function openProfile() {
    setProfileForm({ name: userName });
    setProfileMessage("");
    setCurrentView("profile");
  }

  function clearFilters() {
    setMemorySearch("");
    setMemoryFilters({ location: "", startDate: "", endDate: "" });
  }

  function selectTransportation(type) {
    setForm({
      ...form,
      transportation: type
    });
  }

  function setEntryPhotos(photos) {
    setForm((current) => ({
      ...current,
      photos: typeof photos === "function" ? photos(current.photos) : photos
    }));
  }

  function selectMusicTrack(trackId) {
    setForm((current) => ({
      ...current,
      musicId: trackId
    }));
  }

  function openAuth(mode) {
    setShowLanding(false);
    setAuthMode(mode);
    setAuthMessage("");
  }

  function openDatePicker(ref) {
    if (ref.current?.showPicker) {
      ref.current.showPicker();
      return;
    }
    ref.current?.focus();
  }

  function formatDateRange(entry) {
    const start = entry.start_date || entry.entry_date || "";
    const end = entry.end_date || "";
    return end && end !== start ? `${start} - ${end}` : start;
  }

  async function saveEntry() {
    if (!form.title || !form.location || !form.start_date) {
      setMessage("Trip title, location, and start date are required.");
      return;
    }

    setMessage("Finding location on map...");
    const geo = await geocodeLocation(form.location);

    try {
      const response = await fetch(`${API_URL}/journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: form.title,
          location: form.location,
          country: geo.country,
          latitude: geo.latitude,
          longitude: geo.longitude,
          entry_date: form.start_date,
          end_date: form.end_date || null,
          notes: form.notes,
          transportation: form.transportation,
          music_id: form.musicId || null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create textual entry profile.");
      }

      const savedEntry = await response.json();

      if (form.photos && form.photos.length > 0) {
        const formData = new FormData();
        
        form.photos.forEach((photo, index) => {
          const dataUrl = typeof photo === "string" ? photo : photo.url;
          
          if (dataUrl && dataUrl.startsWith("data:")) {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            
            const extension = mime.split('/')[1] || 'jpg';
            const file = new File([u8arr], `photo_${index}.${extension}`, { type: mime });
            formData.append("files", file);
          } else {
            const targetBlob = photo.file || photo;
            if (targetBlob instanceof File) {
              formData.append("files", targetBlob);
            }
          }
        });

        if (formData.has("files")) {
          const photoResponse = await fetch(`${API_URL}/journals/${savedEntry.id}/photos`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData
          });

          if (!photoResponse.ok) {
            console.error("Database accepted entry text, but storage upload failed.");
          }
        }
      }

      const refreshResponse = await fetch(`${API_URL}/journals`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (refreshResponse.ok) {
        const structuralData = await refreshResponse.json();
        setEntries(structuralData);
      } else {
        const nextEntry = {
          ...form,
          country: geo.country,
          latitude: geo.latitude,
          longitude: geo.longitude,
          id: savedEntry.id,
          user_email: userEmail,
          musicId: form.musicId || null,
          createdAt: new Date().toISOString()
        };
        setEntries((current) => [nextEntry, ...current]);
      }

      setMessage("Journal entry saved successfully.");
      setForm(emptyEntry);
      setCurrentView("memories");

    } catch (error) {
      console.error("Backend offline fallback redirection triggered:", error);
      
      const nextEntry = {
      ...form,
      country: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      id: crypto.randomUUID(),
      user_email: userEmail,
      musicId: form.musicId || null,
      createdAt: new Date().toISOString()
      };
      setEntries((current) => [nextEntry, ...current]);
      setMessage("Saved locally. Start the backend to sync entries.");
      setForm(emptyEntry);
      setCurrentView("memories");
    }
  }

  async function deleteEntry(entry) {
    if (!entry?.id || !window.confirm(`Delete "${entry.title || "this trip"}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/journals/${entry.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error("Backend delete failed.");
      }
    } catch (error) {
      console.error("Backend delete failed, removing local entry only:", error);
    }

    setEntries((current) => current.filter((currentEntry) => currentEntry.id !== entry.id));
    setSelectedMemory(null);
    setMessage("Trip deleted.");
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthMessage("");

    const payload = {
      email: authForm.email,
      password: authForm.password,
      ...(authMode === "register" ? { full_name: authForm.full_name } : {})
    };

    try {
      const response = await fetch(`${API_URL}${authMode === "login" ? "/auth/login" : "/auth/register"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      const normalizedEmail = data.email || authForm.email.trim().toLowerCase();
      const fallbackName = data.name || authForm.full_name || normalizedEmail.split("@")[0];
      const savedName = getStoredProfileName(normalizedEmail);

      setToken(data.access_token);
      setUserEmail(normalizedEmail);
      setUserName(savedName || fallbackName);
      setEntries(getStoredEntries(normalizedEmail));
      setAuthMessage(data.message || "Authentication successful");
      setAuthForm({ full_name: "", email: "", password: "" });
      setCurrentView("memories");
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  async function continueWithGoogle() {
    setAuthMessage("");
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || !window.google?.accounts?.id) {
      setAuthMessage("Google sign-in needs VITE_GOOGLE_CLIENT_ID and the Google Identity script.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const response = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential })
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "Google authentication failed");
          }

          const savedName = getStoredProfileName(data.email);

          setToken(data.access_token);
          setUserEmail(data.email);
          setUserName(savedName || data.name || data.email.split("@")[0]);
          setEntries(getStoredEntries(data.email));
          setCurrentView("memories");
        } catch (error) {
          setAuthMessage(error.message);
        }
      }
    });
    window.google.accounts.id.prompt();
  }

  function logout() {
    setToken(null);
    setUserEmail("");
    setUserName("");
    setEntries([]);
    setCurrentView("memories");
    setShowLanding(true);
    setAuthMessage("You have been logged out.");
  }

  if (showLanding && !token) {
    return <LandingPage onGetStarted={() => openAuth("register")} onLogIn={() => openAuth("login")} />;
  }

  if (!token) {
    const isLogin = authMode === "login";

    return (
      <div className="auth-page">
        <div className="auth-header">
          <button className="back-home" onClick={() => setShowLanding(true)} aria-label="Back to landing page">
            <ChevronLeft size={22} />
          </button>
          <div className="auth-logo">
            <img src="/images/mini_plane_landingpg.png" alt="Plane" className="auth-plane" />
            <span>Digital Travel Journal</span>
          </div>
          <button
            className="auth-toggle-link"
            onClick={() => {
              setAuthMode(isLogin ? "register" : "login");
              setAuthMessage("");
            }}
          >
            <span>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
            <strong>{isLogin ? "Sign up" : "Log in"}</strong>
          </button>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1>
              {isLogin ? "Welcome Back!" : "Create Your Account"}
              <Heart className="auth-heart" size={17} fill="currentColor" />
            </h1>
            <p>{isLogin ? "Log in to continue your journey" : "Start your journey with us"}</p>
          </div>

          <form className="auth-form" onSubmit={submitAuth}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={authForm.full_name}
                  onChange={handleAuthChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

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

            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={isLogin ? (showPasswordLogin ? "text" : "password") : showPasswordRegister ? "text" : "password"}
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder={isLogin ? "........" : "Create a password"}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => {
                    isLogin
                      ? setShowPasswordLogin(!showPasswordLogin)
                      : setShowPasswordRegister(!showPasswordRegister);
                  }}
                  aria-label="Toggle password visibility"
                >
                  {isLogin ? (
                    showPasswordLogin ? <EyeOff size={17} /> : <Eye size={17} />
                  ) : showPasswordRegister ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit">
              <span>{isLogin ? "Log In" : "Sign Up"}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">Or continue with</div>
          <div className="social-row">
            <button type="button" className="social-btn" onClick={continueWithGoogle}>
              <GoogleIcon /> Google
            </button>
          </div>

          {authMessage && <p className="auth-message">{authMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <aside className="sidebar">
        <nav className="side-nav">
          <a
            href="#map"
            className={currentView === "map" ? "active-nav" : ""}
            onClick={() => setCurrentView("map")}
          >
            <Map size={18} /> Map
          </a>
          <a
            href="#create"
            className={currentView === "create" ? "active-nav" : ""}
            onClick={() => setCurrentView("create")}
          >
            <Plane size={18} /> New Entry
          </a>
          <a
            href="#memories"
            className={currentView === "memories" ? "active-nav" : ""}
            onClick={() => setCurrentView("memories")}
          >
            <Images size={18} /> My Memories
          </a>
          <a
            href="#timeline"
            className={currentView === "timeline" ? "active-nav" : ""}
            onClick={() => setCurrentView("timeline")}
          >
            <ListTree size={18} /> Timeline
          </a>
          <a
            href="#capsule"
            className={currentView === "capsule" ? "active-nav" : ""}
            onClick={() => setCurrentView("capsule")}
           >
            <LockKeyhole size={18} /> Capsule
           </a>
          <a
            href="#itinerary"
            className={currentView === "itinerary" ? "active-nav" : ""}
            onClick={() => setCurrentView("itinerary")}
          >
            <CalendarDays size={18} /> Itinerary
          </a>
          <a
            href="#stats"
            className={currentView === "stats" ? "active-nav" : ""}
            onClick={() => setCurrentView("stats")}
          >
            <BarChart2 size={18} /> My Stats
          </a>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className={`profile-card ${currentView === "profile" ? "active-profile" : ""}`} onClick={openProfile}>
            <div className="profile-avatar">
              {profilePicture ? <img src={profilePicture} alt="" /> : <User size={18} />}
            </div>
            <div>
              <strong>{userName || "Traveler"}</strong>
              <span className="profile-edit-icon" aria-label="Edit profile">
                <Pencil size={12} />
              </span>
            </div>
          </button>
          <button type="button" className="logout-btn" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="entry-area">
        {currentView === "map" ? (
          <section className="entry-card feature-page">
            <WorldMap entries={entries} onNewEntry={() => setCurrentView("create")} />
          </section>
        ) : currentView === "profile" ? (
          <section className="entry-card profile-page">
            <h1>Edit Profile</h1>

            <form className="profile-editor" onSubmit={saveProfile}>
              <div className="profile-photo-editor">
                <div className="profile-photo-preview">
                  {profilePicture ? <img src={profilePicture} alt="Profile preview" /> : <User size={44} />}
                </div>
                <div className="profile-photo-actions">
                  <label htmlFor="profile-picture" className="profile-picture-btn">
                    <Camera size={18} /> Change Photo
                  </label>
                  <input id="profile-picture" type="file" accept="image/*" onChange={handleProfilePictureChange} hidden />
                  {profilePicture && (
                    <button type="button" className="remove-photo-btn" onClick={() => setProfilePicture("")}>
                      <Trash2 size={18} /> Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-fields">
                <label>
                  Name
                  <input name="name" value={profileForm.name} onChange={handleProfileChange} placeholder="Your name" />
                </label>
              </div>

              {profileMessage && <p className="status-message">{profileMessage}</p>}

              <button type="submit" className="save-btn profile-save-btn">
                Save Profile <ArrowRight />
              </button>
            </form>
          </section>
        ) : currentView === "timeline" ? (
          <section className="entry-card feature-page">
            <TimelineView entries={entries} />
          </section>
        ) : currentView === "itinerary" ? (
          <section className="entry-card feature-page">
            <div className="planning-grid">
              <Checklist storageKey={`travel_journal_checklist:${userEmail}`} token={token} apiUrl={API_URL} />
              <Itinerary storageKey={`travel_journal_itinerary:${userEmail}`} token={token} apiUrl={API_URL} />
            </div>
          </section>
        ) : currentView === "capsule" ? (
          <section className="entry-card feature-page">
            <CapsuleView entries={entries} userEmail={userEmail} />
          </section>
        ) : currentView === "stats" ? (
          <section className="entry-card feature-page">
            <TravelStats token={token} apiUrl={API_URL} />
          </section>
        
        ) : currentView === "create" ? (
          <section className="entry-card">
            <h1>
              Create a New Journal Entry <Heart className="title-heart" size={22} fill="currentColor" />
            </h1>

            <div className="form-grid">
              <label>
                Trip Title
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Exploring Tokyo" />
              </label>

              <label>
                Location
                <div className="input-icon">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleLocationChange}
                    onBlur={() => window.setTimeout(() => setShowLocationOptions(false), 150)}
                    onFocus={() => setShowLocationOptions(locationOptions.length > 0)}
                    autoComplete="off"
                    placeholder="e.g. Tokyo, Japan"
                  />
                  <MapPin size={20} />
                  {showLocationOptions && locationOptions.length > 0 && (
                    <div className="location-suggestions">
                      {locationOptions.map((location) => (
                        <button key={location} type="button" onMouseDown={() => selectLocationSuggestion(location)}>
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              <label className="date-range-label">
                Date Range
                <div className="date-range">
                  <div className="date-field">
                    <input
                      ref={startDateRef}
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      type="date"
                      aria-label="Start date"
                    />
                    <button type="button" className="date-picker-btn" onClick={() => openDatePicker(startDateRef)} aria-label="Open start date calendar">
                      <CalendarDays size={18} />
                    </button>
                  </div>
                  <span>to</span>
                  <div className="date-field">
                    <input
                      ref={endDateRef}
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      type="date"
                      aria-label="End date"
                    />
                    <button type="button" className="date-picker-btn" onClick={() => openDatePicker(endDateRef)} aria-label="Open end date calendar">
                      <CalendarDays size={18} />
                    </button>
                  </div>
                </div>
              </label>

              <label>
                Transportation
                <div className="transport-row">
                  {[
                    ["Plane", Plane],
                    ["Car", Car],
                    ["Train", Train],
                    ["Walking", PersonStanding]
                  ].map(([type, Icon]) => (
                    <button
                      key={type}
                      type="button"
                      className={`transport ${form.transportation === type ? "active" : ""}`}
                      onClick={() => selectTransportation(type)}
                      aria-label={type}
                    >
                      <Icon />
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="bottom-row">
              <PhotoGallery photos={form.photos} setPhotos={setEntryPhotos} iconSrc="/images/mini_camera_newentry.png" />

              <MusicPicker selectedMusicId={form.musicId} onSelect={selectMusicTrack} />
            </div>

            <label className="notes-label">
              Journal Description
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Write about your trip..." />
            </label>

            {message && <p className="status-message">{message}</p>}

            <button type="button" className="save-btn" onClick={saveEntry}>
              Save Entry <Send />
            </button>
          </section>
        ) : (
          <section className="entry-card memories-card">
            <div className="page-heading">
              <h1>
                My Memories <Heart className="title-heart" size={22} fill="currentColor" />
              </h1>
              <button type="button" className="new-entry-btn" onClick={() => setCurrentView("create")}>
                + New Entry
              </button>
            </div>

            <div className="memory-toolbar">
              <div className="memory-search">
                <Search size={18} />
                <input
                  type="search"
                  value={memorySearch}
                  onChange={(event) => setMemorySearch(event.target.value)}
                  placeholder="Search memories..."
                />
              </div>
              <button className={`filter-btn ${showFilters ? "active-filter" : ""}`} type="button" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={17} /> Filter
              </button>
            </div>

            {showFilters && (
              <div className="filter-panel">
                <label>
                  Location
                  <input
                    name="location"
                    value={memoryFilters.location}
                    onChange={handleFilterChange}
                    placeholder="Filter by location..."
                  />
                </label>
                <label>
                  From
                  <input name="startDate" type="date" value={memoryFilters.startDate} onChange={handleFilterChange} />
                </label>
                <label>
                  To
                  <input name="endDate" type="date" value={memoryFilters.endDate} onChange={handleFilterChange} />
                </label>
                <button type="button" className="clear-filter-btn" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            )}

            {filteredEntries.length === 0 ? (
              <div className="empty-gallery">
                <p>No photo memories yet. Create a new entry with photos to see it here.</p>
              </div>
            ) : (
              <div className="memory-grid">
                {filteredEntries.map((entry) => (
                  <article key={entry.id} className="memory-card">
                    <button type="button" className="memory-card-button" onClick={() => setSelectedMemory(entry)}>
                    <img src={entry.photos[0].url} alt={entry.title || "Travel memory"} />
                    <div className="memory-details">
                      <h2>{entry.title}</h2>
                      <p>{entry.location}</p>
                      <span>{formatDateRange(entry)}</span>
                      {entry.notes && <small>{entry.notes}</small>}
                    </div>
                    </button>
                  </article>
                ))}
              </div>
            )}

            {selectedMemory && (
              <div className="memory-modal" role="dialog" aria-modal="true" aria-label={`${selectedMemory.title} details`}>
                <div className="memory-modal-card">
                  <button type="button" className="memory-close-btn" onClick={() => setSelectedMemory(null)} aria-label="Close memory details">
                    <CircleX />
                  </button>
                  <div className="memory-modal-header">
                    <div>
                      <h2>{selectedMemory.title}</h2>
                      <p>{selectedMemory.location}</p>
                    </div>
                    <span>{formatDateRange(selectedMemory)}</span>
                  </div>
                  <div className="memory-modal-grid">
                    {selectedMemory.photos.map((photo) => (
                      <img key={photo.id} src={photo.url} alt={photo.name || selectedMemory.title || "Travel memory"} />
                    ))}
                  </div>
                  <dl className="memory-meta">
                    <div>
                      <dt>Transportation</dt>
                      <dd>{selectedMemory.transportation || "Not added"}</dd>
                    </div>
                    <div>
                      <dt>Photos</dt>
                      <dd>{selectedMemory.photos.length}</dd>
                    </div>
                  </dl>
                  {selectedMemory.notes && <p className="memory-description">{selectedMemory.notes}</p>}
                  <div className="memory-modal-actions">
                    <button type="button" className="delete-trip-btn" onClick={() => deleteEntry(selectedMemory)}>
                      <Trash2 size={16} /> Delete Trip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
