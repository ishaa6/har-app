import React, { useState } from "react";

// Styles
import "./styles/globals.css";
import "./styles/layout.css";

// Hooks
import { usePrediction } from "./hooks/usePrediction";

// Components
import UploadPanel  from "./components/UploadPanel";
import CameraPanel  from "./components/CameraPanel";
import ResultCard   from "./components/ResultCard";
import HistoryStrip from "./components/HistoryStrip";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Anomaly threshold is internal — not exposed to the user
const ANOMALY_THRESHOLD = 60;

export default function App() {
  const [activeTab,     setActiveTab]     = useState("upload");
  const [showDashboard, setShowDashboard] = useState(false);

  const { result, confidence, loading, history, runPrediction, clearResult } =
    usePrediction(ANOMALY_THRESHOLD);

  if (showDashboard) {
    return (
      <Dashboard
        history={history}
        threshold={ANOMALY_THRESHOLD}
        onBack={() => setShowDashboard(false)}
      />
    );
  }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">HAR<span className="logo-dot">.</span></span>
          </div>
          <p className="header-sub">Human Activity Recognition · UCF101</p>
        </div>

        <button className="dash-btn" onClick={() => setShowDashboard(true)}>
          <span>▦</span> Analytics
          {history.length > 0 && <span className="badge">{history.length}</span>}
        </button>
      </header>

      <main className="app-main">
        {/* Tab switcher */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => { setActiveTab("upload"); clearResult(); }}
          >
            <span className="tab-icon">↑</span> Upload Video
          </button>
          <button
            className={`tab-btn ${activeTab === "camera" ? "active" : ""}`}
            onClick={() => { setActiveTab("camera"); clearResult(); }}
          >
            <span className="tab-icon">◉</span> Live Camera
          </button>
        </div>

        {/* Input panel */}
        {activeTab === "upload"
          ? <UploadPanel onPredict={runPrediction} loading={loading} />
          : <CameraPanel onPredict={runPrediction} loading={loading} />
        }

        {/* Result */}
        <ResultCard
          result={result}
          confidence={confidence}
          loading={loading}
          threshold={ANOMALY_THRESHOLD}
        />

        {/* History */}
        <HistoryStrip history={history} />
      </main>

      <footer className="app-footer">
        <span>{history.length} predictions logged</span>
        {history.length >= 3 && (
          <button className="footer-dash-btn" onClick={() => setShowDashboard(true)}>
            Open Analytics →
          </button>
        )}
      </footer>
    </div>
  );
}