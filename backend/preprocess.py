import cv2
import numpy as np
import torch

NUM_FRAMES = 64
RESIZE_DIM = 256

def preprocess_video(video_path):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError("Error opening video file")
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    indices = np.linspace(0, total_frames-1, NUM_FRAMES).astype(int)
    idx_set = set(indices)

    frames = []
    current_frame = 0

    while True:
        ret, frame = cap.read()
        if not ret or current_frame > max(indices):
            break

        if current_frame in idx_set:
            frame = cv2.resize(frame, (RESIZE_DIM, RESIZE_DIM))
            frame = frame / 255.0
            frames.append(frame)

        current_frame += 1

    cap.release()

    if len(frames) == 0:
        raise ValueError("No frames extracted from video")

    while len(frames) < NUM_FRAMES:
        frames.append(frames[-1])

    frames = np.array(frames)

    tensor = torch.tensor(frames).permute(3, 0, 1, 2)  
    tensor = tensor.unsqueeze(0).float()

    return tensor