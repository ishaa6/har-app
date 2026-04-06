import React from "react";
import "./ResultCard.css";
import { getGroup } from "../data/actions";
import { confidenceColor, confidenceLabel } from "../utils/helpers";

export default function ResultCard({ result, confidence, loading, threshold }) {
  const confPct    = confidence !== null ? Math.round(confidence * 100) : null;
  const isAnomaly  = result && confPct !== null && confPct < threshold;
  const color      = confPct !== null ? confidenceColor(confPct, threshold) : "#7a8899";
  const statusText = confPct !== null ? confidenceLabel(confPct, threshold) : "";

  // Gauge arc math
  const ARC_LEN   = 251;
  const fillLen   = confPct !== null ? (confPct / 100) * ARC_LEN : 0;
  const tAngle    = Math.PI - (threshold / 100) * Math.PI;
  const markerX1  = 100 + 80 * Math.cos(tAngle);
  const markerY1  = 100 - 80 * Math.sin(tAngle);
  const markerX2  = 100 + 68 * Math.cos(tAngle);
  const markerY2  = 100 - 68 * Math.sin(tAngle);

  return (
    <div className={`result-panel ${result || loading ? "visible" : ""}`}>
      {/* Loading */}
      {loading && (
        <div className="result-loading">
          <div className="loading-bars">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="rc-loading-text">Analyzing video frames…</p>
        </div>
      )}

      {/* Result */}
      {!loading && result && (
        <div className={`result-card ${isAnomaly ? "anomaly" : ""}`}>
          {isAnomaly && (
            <div className="anomaly-badge">
              <span className="anomaly-pulse" />⚠ ANOMALY DETECTED
            </div>
          )}

          <p className="rc-label">{isAnomaly ? "Unrecognized Activity" : "Detected Activity"}</p>
          <h2 className="rc-value" style={{ color: isAnomaly ? "var(--red)" : "var(--accent)" }}>
            {result}
          </h2>

          {/* Semicircle Gauge */}
          <div className="gauge-wrap">
            <svg className="gauge-svg" viewBox="0 0 200 110">
              <defs>
                <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#ff3d57" />
                  <stop offset="50%"  stopColor="#f5c518" />
                  <stop offset="100%" stopColor="#00e5ff" />
                </linearGradient>
              </defs>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gGrad)"
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${fillLen} ${ARC_LEN}`} />
              <line x1={markerX1} y1={markerY1} x2={markerX2} y2={markerY2}
                stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="3 2" />
              <text x="100" y="82" textAnchor="middle" fill="white"
                fontSize="28" fontFamily="'Bebas Neue',sans-serif" letterSpacing="2">{confPct}%</text>
              <text x="100" y="98" textAnchor="middle" fill="rgba(255,255,255,0.4)"
                fontSize="9" fontFamily="'DM Mono',monospace" letterSpacing="2">CONFIDENCE</text>
              <text x="20"  y="114" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="'DM Mono',monospace">0%</text>
              <text x="180" y="114" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="'DM Mono',monospace">100%</text>
            </svg>
            <p className="gauge-status" style={{ color }}>{statusText}</p>
          </div>

          <div className="group-tag">{getGroup(result)}</div>
        </div>
      )}

      {/* Empty */}
      {!loading && !result && (
        <div className="result-empty">
          <span>◌</span>
          <p>No prediction yet</p>
        </div>
      )}
    </div>
  );
}