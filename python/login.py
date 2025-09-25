import cv2
import tkinter as tk
from tkinter import Label, messagebox
from PIL import Image, ImageTk
import numpy as np
import face_recognition
import pickle
import sys
import os
import locale
import time

sys.stdout.reconfigure(encoding='utf-8')
os.environ["PYTHONIOENCODING"] = "utf-8"
myLocale = locale.setlocale(category=locale.LC_ALL, locale="en_GB.UTF-8")

ENCODINGS_FILE = "python/encodings.pkl"

def load_encodings(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Encodings file '{file_path}' not found.")
    with open(file_path, "rb") as file:
        return pickle.load(file)


def login(email):
    try:
        data = load_encodings(ENCODINGS_FILE)
        known_face_encodings = data["encodings"]
        known_face_names = data["names"]
    except FileNotFoundError as e:
        messagebox.showerror("Error", str(e))
        return

    root = tk.Tk()
    root.title("Face Entry Verification")

    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        messagebox.showerror("Error", "Unable to access the camera.")
        return

    lbl_video = Label(root)
    lbl_video.pack()

    lbl_status = Label(root, text="Press 'S' to verify face...", font=("Arial", 14))
    lbl_status.pack(pady=10)

    current_frame = [None]
    verified_result = {"name": None, "status": "No face detected."}
    user_verified = False  # Flag to track if the user is verified

    def process_frame():
        # Capture frames only if the user has not been verified
        if not user_verified:
            ret, frame = cam.read()
            if not ret:
                lbl_status.config(text="Failed to capture frame.")
                return

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            current_frame[0] = rgb_frame

            img = Image.fromarray(rgb_frame)
            imgtk = ImageTk.PhotoImage(image=img)
            lbl_video.imgtk = imgtk
            lbl_video.configure(image=imgtk)
            lbl_video.after(10, process_frame)

    def verify_face(event=None):
        nonlocal user_verified
        if user_verified:
            return  # If user is already verified, skip further processing

        frame = current_frame[0]
        if frame is None:
            lbl_status.config(text="No frame available.")
            return

        face_locations = face_recognition.face_locations(frame)
        if face_locations:
            try:
                face_encodings = face_recognition.face_encodings(frame, face_locations)
                for face_encoding in face_encodings:
                    matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
                    face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances) if matches else None

                    if best_match_index is not None and matches[best_match_index]:
                        name = known_face_names[best_match_index]
                        lbl_status.config(text=f"✅ User Detected: {name}", fg="green")
                        verified_result["name"] = name
                        verified_result["status"] = "User"
                        user_verified = True  # User is verified, stop further checks

                        # Check if the email matches the recognized name
                        if verified_result["name"] == email:
                            print("Login Successful")
                        else:
                            print("Login Failed")
                        
                        finalize_and_close()  # Close the app once verified

                    else:
                        lbl_status.config(text="❌ Unknown User Detected", fg="red")
                        verified_result["status"] = "Unknown"
            except Exception as e:
                lbl_status.config(text=f"Error in recognition: {e}", fg="orange")
                verified_result["status"] = f"Error: {e}"
        else:
            lbl_status.config(text="No face detected. Press 'S' to try again.", fg="blue")
            verified_result["status"] = "No face detected"

    def finalize_and_close():
        cam.release()
        root.destroy()

    def on_closing():
        cam.release()
        root.destroy()

    root.bind("<s>", verify_face)
    root.bind("<S>", verify_face)
    root.protocol("WM_DELETE_WINDOW", on_closing)

    process_frame()  # Start capturing frames
    root.mainloop()


if __name__ == "__main__":
    email = sys.argv[1]
    login(email)
