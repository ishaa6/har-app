import React, { useRef, useState } from "react";
import "./UploadPanel.css";
import { formatMB } from "../utils/helpers";

export default function UploadPanel({ onPredict, loading }) {
  const [video, setVideo]       = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef            = useRef(null);

  const setFile = (file) => {
    if (file?.type.startsWith("video/")) setVideo(file);
  };

  const handleSubmit = async () => {
    if (!video) return;
    const fd = new FormData();
    fd.append("file", video);
    await onPredict(fd);
  };

  return (
    <div className="panel panel-in">
      {/* Drop zone */}
      <div
        className={`dropzone ${dragOver ? "dragover" : ""} ${video ? "has-file" : ""}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); setFile(e.dataTransfer.files[0]); }}
      >
        <input
          ref={fileInputRef} type="file" accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        {video ? (
          <div className="file-info">
            <span className="file-icon">▶</span>
            <span className="file-name">{video.name}</span>
            <span className="file-size">{formatMB(video.size)}</span>
          </div>
        ) : (
          <div className="dz-empty">
            <div className="dz-icon">⊕</div>
            <p className="dz-label">Drop video here or click to browse</p>
            <p className="dz-sub">MP4 · MOV · AVI · WEBM</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {video && (
        <div className="preview-wrap">
          <p className="label-xs">Preview</p>
          <video className="preview-video" controls>
            <source src={URL.createObjectURL(video)} />
          </video>
        </div>
      )}

      <button
        className={`action-btn ${loading ? "loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading || !video}
      >
        {loading ? <><span className="spinner" /> Analyzing…</> : <><span>▶</span> Run Prediction</>}
      </button>
    </div>
  );
}