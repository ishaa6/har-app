from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import shutil
import base64
import numpy as np
import cv2
import subprocess
import os
import torch.nn.functional as F

from preprocess import preprocess_video
from model import TwoStreamHybrid  
from download_weights import download_all

print("🚀 Starting backend...")

app = FastAPI()

frame_buffer = []
MAX_FRAMES = 64

# ---------------- LABELS ----------------
def load_labels(path="labels.txt"):
    with open(path, "r") as f:
        labels = [line.strip() for line in f.readlines()]
    return labels

LABELS = load_labels()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODEL LOADING ----------------

device = torch.device("cpu")

print("⬇️ Downloading weights...")
download_all()
print("✅ Download complete")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "files", "model.pth")

print("🧠 Initializing model...")
model = TwoStreamHybrid(num_classes=len(LABELS))

print("📦 Loading model weights...")
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
print("✅ Model loaded successfully")

model.to(device)
model.eval()

# ---------------- API ----------------
UPLOAD_PATH = "temp.webm"
CONVERTED_PATH = "temp.mp4"

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Save uploaded video
    with open(UPLOAD_PATH, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    subprocess.run([
        "ffmpeg",
        "-y",
        "-i", UPLOAD_PATH,
        "-vcodec", "libx264",
        "-acodec", "aac",
        CONVERTED_PATH
    ])

    # Preprocess video
    input_tensor = preprocess_video(UPLOAD_PATH)
    input_tensor = input_tensor.to(device)

    # Predict
    with torch.no_grad():
        output = model(input_tensor)

    prediction = torch.argmax(output, dim=1).item()
    probs = F.softmax(output, dim=1)

    prediction_label = LABELS[prediction]
    confidence = probs[0][prediction].item()

    return {
        "prediction": prediction_label,
        "confidence": confidence
    }

@app.post("/predict-frame")
async def predict_frame(data: dict):
    global frame_buffer

    # ---- Decode base64 image ----
    image_data = data["image"].split(",")[1]
    image_bytes = base64.b64decode(image_data)

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Resize + normalize (same as training)
    frame = cv2.resize(frame, (256, 256))
    frame = (frame / 255.0) * 2 - 1

    frame_buffer.append(frame)

    # Keep only last 64 frames
    if len(frame_buffer) > MAX_FRAMES:
        frame_buffer.pop(0)

    # ---- Only predict when buffer full ----
    if len(frame_buffer) == MAX_FRAMES:

        frames = np.array(frame_buffer)  # (64, 256, 256, 3)

        # Convert to tensor (IMPORTANT SHAPE FIX)
        tensor = torch.tensor(frames).permute(3, 0, 1, 2)  # (3, 64, 256, 256)
        tensor = tensor.unsqueeze(0).float()               # (1, 3, 64, 256, 256)

        with torch.no_grad():
            output = model(tensor)

        prediction = torch.argmax(output, dim=1).item()
        probs = F.softmax(output, dim=1)

        confidence = probs[0][prediction].item()
        prediction_label = LABELS[prediction]

        return {
            "prediction": prediction_label,
            "confidence": confidence
        }

    return {"prediction": "Collecting frames..."}