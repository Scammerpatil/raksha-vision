import cv2
import numpy as np
import face_recognition
import pickle
import os
import smtplib
import time
from email.message import EmailMessage
from email.utils import make_msgid
from PIL import Image, ImageTk
import tkinter as tk

# ==== CONFIG ====
ENCODINGS_FILE = "python/encodings.pkl"
UNAUTHORIZED_FOLDER = "public/unauthorized"
ADMIN_EMAIL = "sauravpatil453@gmail.com"
SENDER_EMAIL = "hello.novacops@gmail.com"
SENDER_PASSWORD = "vghbbajgeqoutrtg"

# ==== FUNCTIONS ====

def load_encodings(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Encodings file '{path}' not found.")
    with open(path, "rb") as f:
        data = pickle.load(f)
    if "encodings" not in data or "names" not in data:
        raise ValueError("Encodings file structure invalid.")
    return data["encodings"], data["names"]

def save_unknown_face(frame):
    os.makedirs(UNAUTHORIZED_FOLDER, exist_ok=True)
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    path = os.path.join(UNAUTHORIZED_FOLDER, f"unknown_{timestamp}.jpg")
    cv2.imwrite(path, frame)
    return path, timestamp

def send_alert_email(image_path, timestamp):
    try:
        msg = EmailMessage()
        msg["Subject"] = "🚨 Unauthorized Access Attempt - RakshaVision"
        msg["From"] = SENDER_EMAIL
        msg["To"] = ADMIN_EMAIL

        # HTML Email Body
        html_content = f"""\
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f8f9fa;
                    margin: 0; padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                .header {{
                    background-color: #2c3e50;
                    color: white;
                    text-align: center;
                    padding: 20px;
                }}
                .header img {{
                    width: 100px;
                    margin-bottom: 15px;
                }}
                .content {{
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
                }}
                .alert {{
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    border: 1px solid #f5c6cb;
                }}
                .details {{
                    background-color: #f1f1f1;
                    padding: 15px;
                    border-radius: 5px;
                    font-size: 14px;
                }}
                .unauthorized-img {{
                    width: 100%;
                    max-width: 300px;
                    margin: 20px auto;
                    display: block;
                    border-radius: 8px;
                }}
                .footer {{
                    padding: 20px;
                    text-align: center;
                    color: #777;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Flag_of_Indian_Army.svg/1280px-Flag_of_Indian_Army.svg.png" alt="RakshaVision"/>
                    <h1>RakshaVision | Real-time Surveillance</h1>
                </div>
                <div class="content">
                    <h2>⚠ Unauthorized Access Attempt Detected!</h2>
                    <p>An unauthorized individual has been detected by RakshaVision. Details below:</p>
                    <div class="alert">
                        <strong>Alert:</strong> Unauthorized access attempt detected.
                    </div>
                    <div class="details">
                        <p><strong>Timestamp:</strong> {timestamp}</p>
                    </div>
                    <img src="cid:unauth_img" alt="Unauthorized Access Attempt" class="unauthorized-img"/>
                    <p>If this alert is unexpected, please contact the security team immediately.</p>
                </div>
                <div class="footer">
                    <p>Made with ♥ by NovaCops</p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Flag_of_Indian_Army.svg/1280px-Flag_of_Indian_Army.svg.png" width="100"/>
                </div>
            </div>
        </body>
        </html>
        """

        image_cid = make_msgid(domain="raksha.local")
        msg.add_alternative(html_content.replace("cid:unauth_img", f"cid:{image_cid[1:-1]}"), subtype="html")

        # Attach image inline
        with open(image_path, "rb") as img:
            msg.get_payload()[0].add_related(img.read(), maintype="image", subtype="jpeg", cid=image_cid)

        # Send via Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        print(f"[EMAIL SENT] Alert sent to admin: {ADMIN_EMAIL}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

# ==== MAIN FUNCTION WITH TKINTER ====

def start_raksha_vision():
    print("[INFO] Loading encodings...")
    known_encodings, known_names = load_encodings(ENCODINGS_FILE)
    print(f"[INFO] Loaded {len(known_names)} known faces.")
    print("[INFO] Starting video stream...")
    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        print("[ERROR] Cannot access the camera.")
        return

    root = tk.Tk()
    root.title("Raksha-Vision | Live Stream")

    lbl_video = tk.Label(root)
    lbl_video.pack()

    lbl_info = tk.Label(root, text="Press 'Q' to close", font=("Arial", 14))
    lbl_info.pack(pady=10)

    unknown_logged = set()

    def update_frame():
        ret, frame = cam.read()
        if not ret:
            lbl_info.config(text="Camera not available", fg="red")
            return

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            name = "Unknown"

            face_distances = face_recognition.face_distance(known_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_names[best_match_index]

            color = (0, 255, 0) if name != "Unknown" else (255, 0, 0)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.rectangle(frame, (left, bottom - 25), (right, bottom), color, cv2.FILLED)
            cv2.putText(frame, name, (left + 6, bottom - 6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            if name == "Unknown":
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                if timestamp not in unknown_logged:
                    unknown_logged.add(timestamp)
                    saved_path, saved_ts = save_unknown_face(frame)
                    print(f"[ALERT] Unknown detected → {saved_path}")
                    send_alert_email(saved_path, saved_ts)

        img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        imgtk = ImageTk.PhotoImage(image=img)
        lbl_video.imgtk = imgtk
        lbl_video.configure(image=imgtk)
        lbl_video.after(10, update_frame)

    def close_window(event=None):
        print("[INFO] Exiting RakshaVision...")
        cam.release()
        root.destroy()

    root.bind("<q>", close_window)
    root.bind("<Q>", close_window)

    update_frame()
    root.mainloop()

# ==== RUN ====
if __name__ == "__main__":
    start_raksha_vision()
