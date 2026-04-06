import { useState, useRef } from "react";

export function useCamera() {
  const videoRef              = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isRecording, setIsRecording]     = useState(false);
  const [cameraActive, setCameraActive]   = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraActive(true);

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((p) => [...p, e.data]);
      };
      setMediaRecorder(recorder);
    } catch {
      alert("Camera access denied");
    }
  };

  const startRecording = () => {
    if (!mediaRecorder) { alert("Start camera first"); return; }
    setRecordedChunks([]);
    mediaRecorder.start();
    setIsRecording(true);
  };

  // Returns a FormData promise resolved after stop
  const stopRecording = () =>
    new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state !== "recording") { resolve(null); return; }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const fd   = new FormData();
        fd.append("file", new File([blob], "recorded.webm"));
        resolve(fd);
      };

      mediaRecorder.stop();
      setIsRecording(false);
    });

  return { videoRef, isRecording, cameraActive, startCamera, startRecording, stopRecording };
}