import "../styles/LandingPage.css";

export default function LandingPage({ onGetStarted, onLogIn }) {
  return (
    <div className="landing-page">
      <div className="landing-wrapper">
        {/* Logo at top */}
        <div className="logo-section">
          <img src="/images/mini_plane_landingpg.png" alt="Plane" className="logo-plane" />
          <span>Digital Travel Journal</span>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Your adventures.<br />
            Your memories.<br />
            <span className="orange-text">Forever.</span>
          </h1>
          <p className="hero-subtitle">Save and relive your travel memories, one journey at a time.</p>
          
          <div className="button-group">
            <button className="get-started-btn" onClick={onGetStarted}>
              Get Started
            </button>
            <button className="log-in-btn" onClick={onLogIn}>
              Log In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <img src="/images/map_your_travelsicon.png" alt="Map Your Travels" className="feature-icon" />
            <div className="feature-content">
              <h3>Map Your Travels</h3>
              <p>Pin every place you've been</p>
            </div>
          </div>

          <div className="feature-card">
            <img src="/images/save_memoriesicon.png" alt="Save Memories" className="feature-icon" />
            <div className="feature-content">
              <h3>Save Memories</h3>
              <p>Photos, notes & more</p>
            </div>
          </div>

          <div className="feature-card">
            <img src="/images/Relive_moments.png" alt="Relive Moments" className="feature-icon" />
            <div className="feature-content">
              <h3>Relive Moments</h3>
              <p>Timelines & capsules</p>
            </div>
          </div>

          <div className="feature-card">
            <img src="/images/planaheadico.png" alt="Plan Ahead" className="feature-icon" />
            <div className="feature-content">
              <h3>Plan Ahead</h3>
              <p>Checklists & itineraries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
