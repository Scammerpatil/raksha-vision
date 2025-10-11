import sys
import os
import cv2
import json
import uuid
import shutil
import subprocess
from datetime import datetime
from ultralytics import YOLO

MODEL_PATH = "python/military_yolov8n/weights/best.pt"
OUTPUT_DIR = "public/detections"

def detect_objects(video_path, uploader_id):
    model = YOLO(MODEL_PATH)
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return

    upload_id = str(uuid.uuid4())

    # === Prepare directories ===
    frames_dir = os.path.join(OUTPUT_DIR, "frames")
    videos_dir = os.path.join(OUTPUT_DIR, "videos")
    originals_dir = os.path.join(OUTPUT_DIR, "originals")
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(videos_dir, exist_ok=True)
    os.makedirs(originals_dir, exist_ok=True)

    # === Path setup ===
    original_video_path = os.path.join(originals_dir, f"{upload_id}_original.mp4")
    temp_avi_path = os.path.join(videos_dir, f"{upload_id}_temp.avi")
    final_mp4_path = os.path.join(videos_dir, f"{upload_id}_detected.mp4")

    shutil.copy(video_path, original_video_path)

    # === VideoWriter setup ===
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(temp_avi_path, fourcc, fps, (width, height))

    frame_index = 0
    detected_events = []
    class_counts = {}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)[0]
        frame_time = frame_index / fps

        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names[cls_id]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(width - 1, x2), min(height - 1, y2)

            # === Draw bounding boxes with bigger labels ===
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (x1, max(30, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)

            # === Save full frame (with bounding box drawn) ===
            frame_filename = f"{upload_id}_{frame_index}_{label}.jpg"
            frame_path = os.path.join(frames_dir, frame_filename)
            cv2.imwrite(frame_path, frame)

            # === Event Metadata ===
            detected_events.append({
                "class": label,
                "confidence": conf,
                "first_seen": round(frame_time, 3),
                "last_seen": round(frame_time, 3),
                "frame_indices": [frame_index],
                "best_frame_url": frame_path.replace("\\", "/"),
                "bbox": [x1, y1, x2, y2],
            })

            class_counts[label] = class_counts.get(label, 0) + 1

        out.write(frame)
        frame_index += 1

    cap.release()
    out.release()

    # === Re-encode with FFmpeg to MP4 (browser-friendly H.264) ===
    subprocess.run([
        "ffmpeg", "-y", "-i", temp_avi_path,
        "-vcodec", "libx264", "-preset", "fast", "-crf", "23",
        "-movflags", "+faststart", final_mp4_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    os.remove(temp_avi_path)

    # === Metadata ===
    metadata = {
        "upload_id": upload_id,
        "uploader_id": uploader_id,
        "original_video_url": original_video_path.replace("\\", "/"),
        "detected_video_url": final_mp4_path.replace("\\", "/"),
        "detected_events": detected_events,
        "summary": {
            "total_events": len(detected_events),
            "classes": class_counts,
        },
        "processed_at": datetime.utcnow().isoformat(),
    }

    meta_file = os.path.join(OUTPUT_DIR, f"{upload_id}_meta.json")
    with open(meta_file, "w") as f:
        json.dump(metadata, f, indent=4)

    print(meta_file)
    return meta_file


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: detection.py <video_path> <uploader_id>")
        sys.exit(1)
    detect_objects(sys.argv[1], sys.argv[2])
