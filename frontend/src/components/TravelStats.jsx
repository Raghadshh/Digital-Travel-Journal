import { useEffect, useState } from "react";
import { Camera, MapPin, Globe, Plane, Loader2, Car, CalendarDays, Hourglass } from "lucide-react";
import "../styles/TimelineView.css";

export default function TravelStats({ token, apiUrl, refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/journals/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to load your travel metrics.");
        const data = await response.json();
        setStats(data);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [token, apiUrl, refreshKey]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} style={{ opacity: 0.6 }} />
      </div>
    );
  }

  if (error) return <div className="status-message" style={{ color: "red" }}>{error}</div>;

  return (
    <div id="travel-stats-dashboard" className="timeline-view-container">

      <div className="feature-panel-header timeline-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>My Travel Statistics</h2>
          <p>A summary of your travels and memories.</p>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
        marginTop: "2rem"
      }}>
        {/* Total Trips */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#e0f2fe" }}>
            <Plane color="#0284c7" size={24} />
          </div>
          <h3 style={labelStyle}>Total Trips</h3>
          <p style={numberStyle}>{stats?.total_trips || 0}</p>
        </div>

        {/* Photos Saved */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#fef3c7" }}>
            <Camera color="#d97706" size={24} />
          </div>
          <h3 style={labelStyle}>Photos Saved</h3>
          <p style={numberStyle}>{stats?.total_photos || 0}</p>
        </div>

        {/* Total Cities */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#dcfce7" }}>
            <MapPin color="#16a34a" size={24} />
          </div>
          <h3 style={labelStyle}>Total Cities</h3>
          <p style={numberStyle}>{stats?.total_cities || 0}</p>
        </div>

        {/* Total Countries */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#f3e8ff" }}>
            <Globe color="#9333ea" size={24} />
          </div>
          <h3 style={labelStyle}>Total Countries</h3>
          <p style={numberStyle}>{stats?.total_countries || 0}</p>
        </div>

        {/* Favorite Transport */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#fee2e2" }}>
            <Car color="#dc2626" size={24} />
          </div>
          <h3 style={labelStyle}>Favorite Transport</h3>
          <p style={{ ...numberStyle, fontSize: "1.5rem", textTransform: "capitalize" }}>{stats?.favorite_transport || "None"}</p>
        </div>

        {/* Most Traveled Month */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#ffedd5" }}>
            <CalendarDays color="#ea580c" size={24} />
          </div>
          <h3 style={labelStyle}>Most Traveled Month</h3>
          <p style={{ ...numberStyle, fontSize: "1.5rem" }}>{stats?.most_traveled_month || "None"}</p>
        </div>

        {/* Longest Trip Span */}
        <div style={cardStyle}>
          <div className="metric-icon-holder" style={{ ...iconContainerStyle, backgroundColor: "#ccfbf1" }}>
            <Hourglass color="#0d9488" size={24} />
          </div>
          <h3 style={labelStyle}>Longest Trip Span</h3>
          <p style={numberStyle}>{stats?.longest_trip_days || 0} <span style={{ fontSize: "1rem", color: "#6b7280" }}>Days</span></p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #eadfce",
  borderRadius: "16px",
  padding: "1.5rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};

const iconContainerStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box"
};

const labelStyle = {
  fontSize: "0.9rem",
  color: "#665d53",
  fontWeight: "800",
  margin: "0 0 0.5rem 0"
};

const numberStyle = {
  fontSize: "2rem",
  fontWeight: "900",
  color: "#073c3b",
  margin: "0"
};