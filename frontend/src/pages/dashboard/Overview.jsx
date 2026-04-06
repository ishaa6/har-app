import React from "react";
import { GROUP_COLORS } from "../../data/actions";
import "./Overview.css";

export default function Overview({ history, threshold }) {
  const total        = history.length;
  const anomalies    = history.filter((h) => h.anomaly);
  const avgConf      = total ? Math.round(history.reduce((s, h) => s + h.confidence, 0) / total) : 0;
  const anomalyRate  = total ? Math.round((anomalies.length / total) * 100) : 0;
  const uniqueActs   = new Set(history.map((h) => h.activity)).size;

  const groupCounts  = {};
  history.forEach((h) => { groupCounts[h.group] = (groupCounts[h.group] || 0) + 1; });
  const sortedGroups = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]);
  const maxGroup     = sortedGroups[0]?.[1] || 1;

  const buckets = [0, 0, 0, 0, 0];
  history.forEach((h) => { buckets[Math.min(Math.floor(h.confidence / 20), 4)]++; });
  const maxBucket = Math.max(...buckets, 1);

  const recent20 = [...history].reverse().slice(0, 20);

  const kpis = [
    { label: "Total Predictions", value: total,        unit: "",  color: "#00e5ff", icon: "▶" },
    { label: "Avg Confidence",    value: avgConf,      unit: "%", color: "#00e5a0", icon: "◎" },
    { label: "Anomaly Rate",      value: anomalyRate,  unit: "%", color: anomalyRate > 30 ? "#ff3d57" : "#f5c518", icon: "⚠" },
    { label: "Unique Activities", value: uniqueActs,   unit: "",  color: "#c77dff", icon: "◈" },
  ];

  return (
    <div className="dash-page">
      {/* KPIs */}
      <div className="kpi-row">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card" style={{ "--kc": k.color, animationDelay: `${i * 0.08}s` }}>
            <span className="kpi-icon">{k.icon}</span>
            <div className="kpi-val">{k.value}<span className="kpi-unit">{k.unit}</span></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-bar" style={{ width: `${Math.min((k.value / (total || 1)) * 100, 100)}%` }} />
          </div>
        ))}
      </div>

      {/* Confidence Histogram */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">Confidence Distribution</h3>
          <span className="card-badge">Histogram</span>
        </div>
        <div className="histogram">
          {["0–20%","20–40%","40–60%","60–80%","80–100%"].map((lbl, i) => {
            const colors = ["#ff3d57","#ff8c42","#f5c518","#00e5a0","#00e5ff"];
            return (
              <div className="hist-col" key={i}>
                <div className="hist-bar-wrap">
                  <div className="hist-bar" style={{ height: `${(buckets[i] / maxBucket) * 100}%`, background: colors[i] }}>
                    {buckets[i] > 0 && <span className="hist-count">{buckets[i]}</span>}
                  </div>
                </div>
                <span className="hist-label">{lbl}</span>
              </div>
            );
          })}
          <div className="hist-threshold" style={{ left: `${threshold}%` }}>
            <div className="thresh-line" /><span className="thresh-marker">T</span>
          </div>
        </div>
      </div>

      {/* Donut + Category bars */}
      <div className="two-col">
        <div className="dash-card">
          <div className="card-header"><h3 className="card-title">Category Split</h3></div>
          <div className="donut-wrap">
            <svg viewBox="0 0 160 160" className="donut-svg">
              {(() => {
                let offset = 0;
                const tot = sortedGroups.reduce((s,[,c]) => s+c, 0) || 1;
                const r = 60, circ = 2 * Math.PI * r;
                return sortedGroups.map(([g, c]) => {
                  const dash = (c/tot) * circ;
                  const el = (
                    <circle key={g} cx="80" cy="80" r={r} fill="none"
                      stroke={GROUP_COLORS[g]||"#7a8899"} strokeWidth="22"
                      strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset}
                      transform="rotate(-90 80 80)" />
                  );
                  offset += dash; return el;
                });
              })()}
              <text x="80" y="76" textAnchor="middle" fill="white" fontSize="18" fontFamily="'Bebas Neue'">{total}</text>
              <text x="80" y="90" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="'DM Mono'" letterSpacing="1">TOTAL</text>
            </svg>
            <div className="donut-legend">
              {sortedGroups.map(([g, c]) => (
                <div className="legend-row" key={g}>
                  <span className="legend-dot" style={{ background: GROUP_COLORS[g]||"#7a8899" }} />
                  <span className="legend-name">{g}</span>
                  <span className="legend-val">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header"><h3 className="card-title">Category Bars</h3></div>
          <div className="cat-bars">
            {sortedGroups.map(([g, c]) => (
              <div className="cat-row" key={g}>
                <span className="cat-name">{g}</span>
                <div className="cat-track">
                  <div className="cat-fill" style={{ width: `${(c/maxGroup)*100}%`, background: GROUP_COLORS[g] }} />
                </div>
                <span className="cat-count">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {recent20.length > 2 && (
        <div className="dash-card">
          <div className="card-header">
            <h3 className="card-title">Confidence Over Time</h3>
            <span className="card-badge">Last {recent20.length}</span>
          </div>
          <div className="sparkline-wrap">
            <svg viewBox={`0 0 ${recent20.length*28} 80`} className="sparkline-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1={80-(threshold/100)*70} x2={recent20.length*28} y2={80-(threshold/100)*70}
                stroke="rgba(245,197,24,0.4)" strokeWidth="1" strokeDasharray="4 3" />
              <polygon fill="url(#sparkGrad)"
                points={[
                  ...recent20.map((h,i) => `${i*28+14},${80-(h.confidence/100)*70}`),
                  `${(recent20.length-1)*28+14},80`, "14,80"
                ].join(" ")} />
              <polyline fill="none" stroke="#00e5ff" strokeWidth="2"
                points={recent20.map((h,i) => `${i*28+14},${80-(h.confidence/100)*70}`).join(" ")} />
              {recent20.map((h,i) => (
                <circle key={i} cx={i*28+14} cy={80-(h.confidence/100)*70} r="3"
                  fill={h.anomaly?"#ff3d57":"#00e5ff"} />
              ))}
            </svg>
            <div className="spark-labels">
              <span>Earliest</span>
              <span style={{ color: "#f5c518" }}>— Threshold ({threshold}%)</span>
              <span>Latest</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}