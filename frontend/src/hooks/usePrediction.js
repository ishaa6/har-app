import { useState } from "react";
import axios from "axios";
import { buildHistoryEntry } from "../utils/helpers";

const MOCK_ACTIVITIES = [
  "Basketball Shooting","Jumping Jack","Push Ups","Playing Guitar","Cliff Diving",
  "Yoga","Drumming","Skateboarding","Rowing","Knitting",
];

export function usePrediction(threshold) {
  const [result, setResult]       = useState("");
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [history, setHistory]     = useState([]);

  const addEntry = (pred, conf) => {
    const entry = buildHistoryEntry(pred, conf, threshold);
    setHistory((prev) => [entry, ...prev].slice(0, 100));
  };

  const runPrediction = async (formData) => {
    setLoading(true);
    try {
      const res  = await axios.post("http://127.0.0.1:8000/predict", formData);
      const pred = res.data.prediction;
      const conf = res.data.confidence ?? 0.72;
      setResult(pred);
      setConfidence(conf);
      addEntry(pred, conf);
    } catch {
      // Demo / offline fallback
      const pred = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
      const conf = Math.random() * 0.5 + 0.45;
      setResult(pred);
      setConfidence(conf);
      addEntry(pred, conf);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => { setResult(""); setConfidence(null); };

  return { result, confidence, loading, history, runPrediction, clearResult };
}