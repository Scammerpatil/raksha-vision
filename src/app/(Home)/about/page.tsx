"use client";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] hero bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold text-primary">About Us</h1>
          <p className="mb-4 text-lg">
            The{" "}
            <span className="font-semibold">Military Surveillance System</span>
            is an AI-powered platform developed to secure critical installations
            with real-time <strong>face recognition</strong>,{" "}
            <strong>military vehicle detection</strong>, and instant alerts.
          </p>
          <p className="text-lg">
            Our mission is to enhance national security by leveraging{" "}
            <strong>computer vision</strong> and <strong>deep learning</strong>{" "}
            to identify potential threats before they escalate. Built for
            scalability, our solution integrates seamlessly with existing
            military infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
