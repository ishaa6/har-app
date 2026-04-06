import React from "react";
import "./HistoryStrip.css";

export default function HistoryStrip({ history }) {
  if (!history.length) return null;
  return (
    <div className="history-strip">
      <p className="label-xs">Recent Predictions</p>
      <div className="hs-scroll">
        {history.slice(0, 8).map((h) => (
          <div key={h.id} className={`hs-chip ${h.anomaly ? "chip-anomaly" : ""}`}>
            <span className="chip-name">{h.activity}</span>
            <span className="chip-conf" style={{ color: h.anomaly ? "var(--red)" : "var(--green)" }}>
              {h.confidence}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}