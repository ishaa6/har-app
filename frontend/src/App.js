import React, { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const videoRef = useRef(null);

  // ---------------- FILE UPLOAD ----------------
  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
    setResult("");
  };

  const handleUpload = async () => {
    if (!video) return;

    const formData = new FormData();
    formData.append("file", video);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData
      );

      setResult(res.data.prediction);

    } catch (err) {
      console.error(err);
      alert("Error predicting video");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CAMERA ----------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((prev) => [...prev, e.data]);
        }
      };

      setMediaRecorder(recorder);

    } catch (err) {
      console.error(err);
      alert("Camera access denied");
    }
  };

  // ---------------- RECORDING ----------------
  const startRecording = () => {
    if (!mediaRecorder) {
      alert("Start camera first");
      return;
    }

    if (mediaRecorder.state === "recording") {
      alert("Already recording!");
      return;
    }

    setRecordedChunks([]);
    mediaRecorder.start();
  };

  const stopRecordingAndPredict = () => {
    if (!mediaRecorder) return;

    if (mediaRecorder.state !== "recording") {
      alert("Not recording!");
      return;
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });

      const file = new File([blob], "recorded.webm");

      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);

        const res = await axios.post(
          "http://127.0.0.1:8000/predict",
          formData
        );

        setResult(res.data.prediction);

      } catch (err) {
        console.error(err);
        alert("Error predicting recorded video");
      } finally {
        setLoading(false);
      }
    };

    mediaRecorder.stop(); // triggers onstop AFTER data is ready
  };

  // ---------------- UI ----------------
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Human Activity Recognition</h1>

      {/* -------- Upload Section -------- */}
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />

      {video && (
        <div>
          <h3>Preview</h3>
          <video width="400" controls>
            <source src={URL.createObjectURL(video)} />
          </video>
        </div>
      )}

      <br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Predict Uploaded Video"}
      </button>

      <hr style={{ margin: "40px" }} />

      {/* -------- Camera Section -------- */}
      <h2>Record from Camera</h2>

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecordingAndPredict}>
        Stop & Predict
      </button>

      <div>
        <video ref={videoRef} autoPlay width="400"></video>
      </div>

      <br />

      {/* -------- Result -------- */}
      <h2>Prediction:</h2>

      {loading && <p>Processing video...</p>}

      {!loading && result && (
        <p style={{ fontSize: "22px", fontWeight: "bold", color: "green" }}>
          {result}
        </p>
      )}

      {!loading && !result && <p>No prediction yet</p>}
    </div>
  );
}

export default App;