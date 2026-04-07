import os
import gdown

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES_DIR = os.path.join(BASE_DIR, "files")

os.makedirs(FILES_DIR, exist_ok=True)

FILES = {
    "rgb_imagenet.pt": "https://drive.google.com/uc?id=19PXPkbpdfwsdocwX_ODIx2Jqo68I3uUt",
    "flow_imagenet.pt": "https://drive.google.com/uc?id=19V-i9nXPAWXuANe8ukGfLGxJF-docVVl",
    "model.pth": "https://drive.google.com/file/d/1WGz1iBxF7VqOTaYJNOBPwbXLaQgjbiik"
}

def download_file(url, path):
    print(f"⬇️ Downloading {path}...")
    gdown.download(url, path, fuzzy=True)  # 🔥 KEY FIX

def download_all():
    for filename, url in FILES.items():
        file_path = os.path.join(FILES_DIR, filename)

        if not os.path.exists(file_path):
            download_file(url, file_path)
        else:
            print(f"{filename} already exists")