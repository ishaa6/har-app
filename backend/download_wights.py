import os
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILES_DIR = os.path.join(BASE_DIR, "files")

os.makedirs(FILES_DIR, exist_ok=True)

FILES = {
    "rgb_imagenet.pt": "https://drive.google.com/uc?id=19PXPkbpdfwsdocwX_ODIx2Jqo68I3uUt",
    "flow_imagenet.pt": "https://drive.google.com/uc?id=19V-i9nXPAWXuANe8ukGfLGxJF-docVVl",
}

def download_file(url, path):
    print(f"Downloading {path}...")
    response = requests.get(url, stream=True)

    with open(path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                f.write(chunk)

for filename, url in FILES.items():
    file_path = os.path.join(FILES_DIR, filename)

    if not os.path.exists(file_path):
        download_file(url, file_path)
    else:
        print(f"{filename} already exists")