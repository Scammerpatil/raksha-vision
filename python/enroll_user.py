import cv2
import face_recognition
import os
import sys
import locale

# Configure environment
sys.stdout.reconfigure(encoding='utf-8')
os.environ["PYTHONIOENCODING"] = "utf-8"
locale.setlocale(category=locale.LC_ALL, locale="en_GB.UTF-8")

IMAGE_DIR = "python/UserImages"

def assure_path_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

def enroll(name):
    resident_name = name.strip().replace(" ", "_")
    save_dir = os.path.join(IMAGE_DIR, resident_name)
    assure_path_exists(save_dir)

    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        print("Error: Cannot access camera.")
        return

    print(f"Prepare yourself for capture, {resident_name}...")
    print("Press 'C' to start capturing images, or 'Q' to quit.")

    while True:
        ret, frame = cam.read()
        if not ret:
            continue

        cv2.putText(frame, "Press 'C' to start capture or 'Q' to quit", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        cv2.imshow("Preparation - Press C to Start", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('c'):
            break
        elif key == ord('q'):
            cam.release()
            cv2.destroyAllWindows()
            print("Capture cancelled.")
            return

    print("Starting capture...")

    count = 0
    while count < 100:
        ret, frame = cam.read()
        if not ret:
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)

        for (top, right, bottom, left) in face_locations:
            face_image = frame[top:bottom, left:right]
            img_path = os.path.join(save_dir, f"{resident_name}_{count+1}.jpg")
            cv2.imwrite(img_path, face_image)
            count += 1

            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, f"Image {count}/100", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            if count >= 100:
                break

        cv2.imshow("Capturing Images - Press Q to Quit", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cam.release()
    cv2.destroyAllWindows()
    print("Capture completed.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python enroll_resident.py <Resident Name>")
    else:
        name = sys.argv[1]
        enroll(name)
