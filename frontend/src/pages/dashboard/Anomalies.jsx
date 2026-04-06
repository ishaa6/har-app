import React from "react";
import { GROUP_COLORS } from "../../data/actions";
import "./Overview.css";
import "./Anomalies.css";

export default function Anomalies({ history, threshold }) {
  const total      = history.length;
  const anomalies  = history.filter((h) => h.anomaly);
  const normals    = history.filter((h) => !h.anomaly);
  const anomalyRate = total ? Math.round((anomalies.length / total) * 100) : 0;
  const riskLevel   = anomalyRate > 50 ? "HIGH" : anomalyRate > 20 ? "MEDIUM" : "LOW";
  const riskColor   = anomalyRate > 50 ? "#ff3d57" : anomalyRate > 20 ? "#f5c518" : "#00e5a0";

  // Which activities anomalies cluster in
  const anomActCounts = {};
  anomalies.forEach((h) => { anomActCounts[h.activity] = (anomActCounts[h.activity] || 0) + 1; });
  const topAnomalyActs = Object.entries(anomActCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Anomaly confidence spread
  const avgAnomalyConf = anomalies.length
    ? Math.round(anomalies.reduce((s, h) => s + h.confidence, 0) / anomalies.length)
    : 0;
  const worstAnomaly = anomalies.reduce((min, h) => (!min || h.confidence < min.confidence ? h : min), null);

  const ARC = 408;
  const arcFill = (anomalyRate / 100) * ARC;

  return (
    <div className="dash-page">
      {/* Hero circle + stat row */}
      <div className="anomaly-hero">
        <div className="an-circle-wrap">
          <svg viewBox="0 0 160 160" className="an-svg">
            <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,61,87,0.1)" strokeWidth="20" />
            <circle cx="80" cy="80" r="65" fill="none" stroke="#ff3d57"
              strokeWidth="20" strokeDasharray={`${arcFill} ${ARC}`}
              transform="rotate(-90 80 80)" strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 14px #ff3d57)" }} />
            <text x="80" y="70"  textAnchor="middle" fill="#ff3d57"  fontSize="28" fontFamily="'Bebas Neue'">{anomalyRate}%</text>
            <text x="80" y="86"  textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="'DM Mono'" letterSpacing="2">ANOMALY RATE</text>
            <text x="80" y="102" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="'DM Mono'">{anomalies.length} of {total}</text>
          </svg>
        </div>

        <div className="an-stats">
          {[
            { val: anomalies.length,  label: "Anomalies",    color: "#ff3d57" },
            { val: normals.length,    label: "Normal",        color: "#00e5a0" },
            { val: `${threshold}%`,   label: "Threshold",     color: "#f5c518" },
            { val: riskLevel,         label: "Risk Level",    color: riskColor },
          ].map((s, i) => (
            <div className="an-stat" key={i}>
              <span className="an-val" style={{ color: s.color }}>{s.val}</span>
              <span className="an-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary insight cards */}
      <div className="an-insight-row">
        <div className="insight-card">
          <p className="insight-label">Avg Anomaly Confidence</p>
          <p className="insight-val" style={{ color: "#ff3d57" }}>{avgAnomalyConf}%</p>
          <p className="insight-sub">{threshold - avgAnomalyConf}% below threshold</p>
        </div>
        {worstAnomaly && (
          <div className="insight-card">
            <p className="insight-label">Lowest Confidence</p>
            <p className="insight-val" style={{ color: "#ff3d57" }}>{worstAnomaly.confidence}%</p>
            <p className="insight-sub">{worstAnomaly.activity}</p>
          </div>
        )}
        <div className="insight-card">
          <p className="insight-label">Normal Predictions</p>
          <p className="insight-val" style={{ color: "#00e5a0" }}>{normals.length}</p>
          <p className="insight-sub">{100 - anomalyRate}% of total</p>
        </div>
      </div>

      {/* Top anomaly activities */}
      {topAnomalyActs.length > 0 && (
        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">Most Flagged Activities</h3>
            <span className="card-badge anomaly-badge-sm">{anomalies.length} total anomalies</span>
          </div>
          <div className="top-acts">
            {topAnomalyActs.map(([act, count], i) => (
              <div className="an-act-row" key={act} style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="an-alert-icon">⚠</span>
                <div className="an-act-info">
                  <span className="an-act-name">{act}</span>
                  <div className="an-act-track">
                    <div className="an-act-fill" style={{ width: `${(count / (topAnomalyActs[0]?.[1] || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="an-act-count">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly log */}
      {anomalies.length > 0 ? (
        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">Anomaly Log</h3>
            <span className="card-badge anomaly-badge-sm">{anomalies.length} flagged</span>
          </div>
          <div className="anomaly-log">
            {anomalies.map((h, i) => (
              <div className="ae-entry" key={h.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="ae-left">
                  <span className="ae-alert">⚠</span>
                  <div>
                    <div className="ae-name">{h.activity}</div>
                    <div className="ae-time">{h.date} · {h.timestamp}</div>
                  </div>
                </div>
                <div className="ae-right">
                  <div className="ae-conf">{h.confidence}%</div>
                  <div className="ae-diff">−{threshold - h.confidence}% below</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-anomalies">
          <span className="no-icon">✓</span>
          <p>No anomalies detected</p>
          <p className="no-sub">All predictions are above the {threshold}% threshold</p>
        </div>
      )}
    </div>
  );
}