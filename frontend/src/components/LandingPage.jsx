import "../styles/LandingPage.css";

const features = [
  { image: "/images/map_your_travelsicon.png", title: "Map Your Travels", text: "Pin every place you've been" },
  { image: "/images/save_memoriesicon.png", title: "Save Memories", text: "Photos, notes & more" },
  { image: "/images/Relive_moments.png", title: "Relive Moments", text: "Timelines & capsules" },
  { image: "/images/planaheadico.png", title: "Plan Ahead", text: "Checklists & itineraries" }
];

export default function LandingPage({ onGetStarted, onLogIn }) {
  return (
    <div className="landing-page">
      <div className="landing-wrapper">
        <div className="logo-section">
          <img src="/images/mini_plane_landingpg.png" alt="Plane" className="logo-plane" />
          <span>Digital Travel Journal</span>
        </div>

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

        <div className="features-grid">
          {features.map(({ image, title, text }) => (
            <div className="feature-card" key={title}>
              <img className="feature-icon" src={image} alt="" />
              <div className="feature-content">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
