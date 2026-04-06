import React, { useState } from "react";
import Overview   from "./dashboard/Overview";
import Activities from "./dashboard/Activities";
import Anomalies  from "./dashboard/Anomalies";
import Timeline   from "./dashboard/Timeline";
import "./dashboard/Overview.css";
import "./Dashboard.css";

const PAGES = [
  { id: "overview",    label: "Overview",    icon: "◈" },
  { id: "activities",  label: "Activities",  icon: "▦" },
  { id: "anomalies",   label: "Anomalies",   icon: "⚠" },
  { id: "timeline",    label: "Timeline",    icon: "◷" },
];

export default function Dashboard({ history, threshold, onBack }) {
  const [activePage, setActivePage] = useState("overview");

  const totalPredictions = history.length;
  const anomalyCount     = history.filter((h) => h.anomaly).length;

  return (
    <div className="app dash-app">
      <div className="bg-grid" />
      <div className="bg-glow purple" />

      {/* Header */}
      <header className="dash-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="dash-title-wrap">
          <h1 className="dash-title">ANALYTICS<span className="dash-accent">.</span></h1>
          <p className="dash-sub">{totalPredictions} predictions · UCF101 Model</p>
        </div>
        <div className="dash-live">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
      </header>

      {/* Nav */}
      <nav className="dash-nav">
        {PAGES.map((p) => (
          <button
            key={p.id}
            className={`dash-nav-btn ${activePage === p.id ? "active" : ""}`}
            onClick={() => setActivePage(p.id)}
          >
            <span className="nav-icon">{p.icon}</span>
            <span>{p.label}</span>
            {p.id === "anomalies" && anomalyCount > 0 && (
              <span className="nav-badge">{anomalyCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="dash-content">
        {activePage === "overview"   && <Overview   history={history} threshold={threshold} />}
        {activePage === "activities" && <Activities history={history} />}
        {activePage === "anomalies"  && <Anomalies  history={history} threshold={threshold} />}
        {activePage === "timeline"   && <Timeline   history={history} threshold={threshold} />}
      </div>
    </div>
  );
}