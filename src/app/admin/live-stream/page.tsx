"use client";
import Title from "@/components/Title";
import { sendBrowserNotification } from "@/utils/browserNotification";
import axios from "axios";
import { useEffect, useState } from "react";

export default function LiveStreamAdminPage() {
  const [alertCount, setAlertCount] = useState(0);

  const fetchInitialCount = async () => {
    const res = await axios.get("/api/security/email-alert");
    setAlertCount(res.data.count);
  };

  useEffect(() => {
    fetchInitialCount();
  }, []);

  const handleStartStream = async () => {
    try {
      await axios.get("/api/start-stream");
    } catch (error) {
      console.error("Error starting live stream:", error);
    }
  };
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await axios.get("/api/security/email-alert");

      if (res.data.count > alertCount) {
        setAlertCount(res.data.count);

        sendBrowserNotification(
          "🚨 Security Alert",
          "Unauthorized person detected. Email alert sent."
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [alertCount]);
  return (
    <>
      <Title
        title="Live Stream Management"
        subtitle="You can watch your soldiers and detect any unknown faces in real-time"
      />
      <div className="mx-auto max-w-3xl bg-base-300 rounded-4xl w-full h-96 overflow-hidden flex items-center justify-center flex-col">
        <span className="text-2xl">
          Click on the below button to start live streaming
        </span>
        <button className="btn btn-primary mt-6" onClick={handleStartStream}>
          Start Live Stream
        </button>
      </div>
    </>
  );
}
