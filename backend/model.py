import os
import cv2
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import os

from pytorch_i3d import InceptionI3d

class AttentionBlock(nn.Module):
    def __init__(self, hidden_dim):
        super(AttentionBlock, self).__init__()
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.Tanh(),
            nn.Linear(hidden_dim // 2, 1),
            nn.Softmax(dim=1)
        )

    def forward(self, lstm_output):
        weights = self.attention(lstm_output) 
        context = torch.sum(weights * lstm_output, dim=1) 
        return context, weights

class TwoStreamHybrid(nn.Module):
    def __init__(self, num_classes=101):
        super(TwoStreamHybrid, self).__init__()
        
        # 1. Initialize I3D Streams
        self.rgb_i3d = InceptionI3d(400, in_channels=3)
        self.flow_i3d = InceptionI3d(400, in_channels=2)
        
        # Load Pre-trained Weights (setting weights_only=True disables security warnings)
        
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        rgb_path = os.path.join(BASE_DIR, "files", "rgb_imagenet.pt")
        flow_path = os.path.join(BASE_DIR, "files", "flow_imagenet.pt")

        self.rgb_i3d.load_state_dict(torch.load(rgb_path, map_location="cpu"))
        self.flow_i3d.load_state_dict(torch.load(flow_path, map_location="cpu"))

        # Remove the final classification layers from I3D to extract raw features
        self.rgb_i3d.replace_logits(1024)
        self.flow_i3d.replace_logits(1024)
        
        # 2. BiLSTM (Fuses the 1024 RGB + 1024 Flow features = 2048)
        self.bilstm = nn.LSTM(input_size=2048, hidden_size=512, 
                              num_layers=2, batch_first=True, bidirectional=True)
        
        # 3. Attention & Classifier
        self.attention = AttentionBlock(hidden_dim=1024) 
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(1024, num_classes)
        )

    def forward(self, rgb, flow=None):
        # --- RGB stream only ---
        rgb_feat = self.rgb_i3d.extract_features(rgb)

        rgb_feat = torch.mean(rgb_feat, dim=[3, 4])   # (B, C, T)
        
        fused_feat = torch.cat((rgb_feat, rgb_feat), dim=1).permute(0, 2, 1)

        # Pass through BiLSTM and Attention
        lstm_out, _ = self.bilstm(fused_feat)
        context, attn_weights = self.attention(lstm_out)

        # Final Classification
        logits = self.classifier(context)

        return logits