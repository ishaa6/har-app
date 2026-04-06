import React from "react";
import { GROUP_COLORS, getGroup } from "../../data/actions";
import "./Overview.css";
import "./Activities.css";

export default function Activities({ history }) {
  const total = history.length || 1;

  // Activity frequency map
  const actCounts = {};
  history.forEach((h) => { actCounts[h.activity] = (actCounts[h.activity] || 0) + 1; });
  const topActivities = Object.entries(actCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxAct = topActivities[0]?.[1] || 1;

  // Avg confidence per activity
  const actConfMap = {};
  history.forEach((h) => {
    if (!actConfMap[h.activity]) actConfMap[h.activity] = [];
    actConfMap[h.activity].push(h.confidence);
  });
  const actAvgConf = Object.entries(actConfMap).map(([act, confs]) => ({
    act,
    avg: Math.round(confs.reduce((s, c) => s + c, 0) / confs.length),
    group: getGroup(act),
  })).sort((a, b) => b.avg - a.avg);

  // Group pie data
  const groupCounts = {};
  history.forEach((h) => { groupCounts[h.group] = (groupCounts[h.group] || 0) + 1; });

  return (
    <div className="dash-page">
      {/* Top activities ranked list */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">Top Activities</h3>
          <span className="card-badge">{Object.keys(actCounts).length} unique</span>
        </div>
        <div className="top-acts">
          {topActivities.map(([act, count], i) => {
            const group = getGroup(act);
            const color = GROUP_COLORS[group] || "#7a8899";
            const pct   = Math.round((count / total) * 100);
            return (
              <div className="act-row" key={act} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="act-rank" style={{ color }}>#{i + 1}</div>
                <div className="act-info">
                  <div className="act-name-row">
                    <span className="act-name">{act}</span>
                    <span className="act-pct">{pct}%</span>
                  </div>
                  <div className="act-track">
                    <div className="act-fill" style={{ width: `${(count / maxAct) * 100}%`, background: color }} />
                  </div>
                </div>
                <div className="act-meta">
                  <span className="act-count">{count}×</span>
                  <span className="act-group-tag" style={{ color }}>{group}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Avg confidence per activity */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">Avg Confidence per Activity</h3>
          <span className="card-badge">sorted high → low</span>
        </div>
        <div className="conf-acts">
          {actAvgConf.map(({ act, avg, group }) => {
            const color = avg >= 70 ? "#00e5ff" : avg >= 50 ? "#f5c518" : "#ff3d57";
            return (
              <div className="ca-row" key={act}>
                <div className="ca-left">
                  <span className="ca-dot" style={{ background: GROUP_COLORS[group] || "#7a8899" }} />
                  <span className="ca-name">{act}</span>
                </div>
                <div className="ca-track">
                  <div className="ca-fill" style={{ width: `${avg}%`, background: color }} />
                </div>
                <span className="ca-pct" style={{ color }}>{avg}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group summary cards */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">Activity Category Summary</h3>
        </div>
        <div className="group-summary">
          {Object.entries(groupCounts).sort((a, b) => b[1] - a[1]).map(([group, count]) => {
            const color = GROUP_COLORS[group] || "#7a8899";
            const pct   = Math.round((count / total) * 100);
            return (
              <div className="gs-card" key={group} style={{ "--gc": color }}>
                <div className="gs-top">
                  <span className="gs-icon">◈</span>
                  <span className="gs-count">{count}</span>
                </div>
                <div className="gs-name">{group}</div>
                <div className="gs-pct">{pct}% of all</div>
                <div className="gs-bar">
                  <div className="gs-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}