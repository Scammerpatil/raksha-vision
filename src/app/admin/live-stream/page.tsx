"use client";
import Title from "@/components/Title";
import axios from "axios";

export default function LiveStreamAdminPage() {
  const handleStartStream = async () => {
    try {
      await axios.get("/api/start-stream");
    } catch (error) {
      console.error("Error starting live stream:", error);
    }
  };
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
