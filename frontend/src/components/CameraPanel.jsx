import React from "react";
import { useCamera } from "../hooks/useCamera";
import "./CameraPanel.css";

export default function CameraPanel({ onPredict, loading }) {
  const { videoRef, isRecording, cameraActive, startCamera, startRecording, stopRecording } = useCamera();

  const handleStop = async () => {
    const fd = await stopRecording();
    if (fd) await onPredict(fd);
  };

  return (
    <div className="panel panel-in">
      <div className="camera-wrap">
        <video ref={videoRef} autoPlay className="camera-feed" />
        {isRecording && (
          <div className="rec-badge"><span className="rec-dot" /> REC</div>
        )}
        {!cameraActive && (
          <div className="camera-overlay">
            <span className="cam-icon">◉</span>
            <p>Camera not started</p>
          </div>
        )}
      </div>

      <div className="cam-controls">
        <button
          className={`ctrl-btn ${cameraActive ? "on" : ""}`}
          onClick={startCamera} disabled={cameraActive}
        >
          {cameraActive ? "Camera On" : "Start Camera"}
        </button>
        <button
          className={`ctrl-btn rec-btn ${isRecording ? "recording" : ""}`}
          onClick={startRecording} disabled={!cameraActive || isRecording}
        >
          {isRecording ? "Recording…" : "Start Rec"}
        </button>
        <button
          className="ctrl-btn stop-btn"
          onClick={handleStop} disabled={!isRecording || loading}
        >
          Stop & Predict
        </button>
      </div>
    </div>
  );
}