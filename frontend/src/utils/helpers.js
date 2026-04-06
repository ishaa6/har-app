import { getGroup } from "../data/actions";

export function buildHistoryEntry(prediction, conf, threshold) {
  return {
    id: Date.now(),
    activity: prediction,
    confidence: Math.round(conf * 100),
    timestamp: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    anomaly: Math.round(conf * 100) < threshold,
    group: getGroup(prediction),
  };
}

export function confidenceColor(confPct, threshold) {
  if (confPct >= threshold) return "#00e5ff";
  if (confPct >= threshold * 0.7) return "#f5c518";
  return "#ff3d57";
}

export function confidenceLabel(confPct, threshold) {
  if (confPct >= threshold) return "✓ Within Normal Range";
  if (confPct >= threshold * 0.7) return "△ Borderline";
  return "✗ Below Threshold";
}

export function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}