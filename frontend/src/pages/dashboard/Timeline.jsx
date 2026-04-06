import React, { useState } from "react";
import { GROUP_COLORS } from "../../data/actions";
import "./Overview.css";
import "./Timeline.css";

export default function Timeline({ history, threshold }) {
  const [filter, setFilter] = useState("all"); // all | anomaly | normal

  const filtered = history.filter((h) => {
    if (filter === "anomaly") return h.anomaly;
    if (filter === "normal")  return !h.anomaly;
    return true;
  });

  return (
    <div className="dash-page">
      {/* Filter bar */}
      <div className="tl-filters">
        {[
          { id: "all",     label: `All  (${history.length})` },
          { id: "normal",  label: `Normal  (${history.filter(h => !h.anomaly).length})` },
          { id: "anomaly", label: `Anomalies  (${history.filter(h => h.anomaly).length})` },
        ].map((f) => (
          <button
            key={f.id}
            className={`tl-filter-btn ${filter === f.id ? "active" : ""} ${f.id === "anomaly" ? "fil-anomaly" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline list */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">Prediction Timeline</h3>
          <span className="card-badge">{filtered.length} entries</span>
        </div>

        {filtered.length === 0 ? (
          <div className="tl-empty">
            <span>◌</span><p>No entries match this filter</p>
          </div>
        ) : (
          <div className="timeline">
            {filtered.map((h, i) => {
              const color = h.anomaly ? "#ff3d57" : GROUP_COLORS[h.group] || "#7a8899";
              return (
                <div className="tl-entry" key={h.id} style={{ animationDelay: `${Math.min(i, 20) * 0.03}s` }}>
                  {/* Spine */}
                  <div className="tl-spine">
                    <div className="tl-dot" style={{ borderColor: color, boxShadow: `0 0 8px ${color}40` }} />
                    {i < filtered.length - 1 && <div className="tl-line" />}
                  </div>

                  {/* Card */}
                  <div className="tl-card" style={{ "--tc": color }}>
                    <div className="tl-card-top">
                      <span className="tl-activity">{h.activity}</span>
                      <span className="tl-conf" style={{ color }}>{h.confidence}%</span>
                    </div>

                    <div className="tl-conf-bar">
                      <div className="tl-conf-fill" style={{ width: `${h.confidence}%`, background: color }} />
                      {/* Threshold marker */}
                      <div className="tl-thresh-mark" style={{ left: `${threshold}%` }} />
                    </div>

                    <div className="tl-card-bot">
                      <span className="tl-group" style={{ color }}>{h.group}</span>
                      <span className="tl-time">{h.date} · {h.timestamp}</span>
                      {h.anomaly && <span className="tl-anom-tag">⚠ ANOMALY</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}