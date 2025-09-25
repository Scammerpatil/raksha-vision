"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-[calc(100vh-64px)] hero"
      style={{
        backgroundImage:
          "url(https://www.iasgyan.in//ig-uploads/images//thsd.jpg)",
      }}
    >
      {/* Overlay for darker effect */}
      <div className="hero-overlay bg-opacity-60"></div>

      {/* Hero Content */}
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-2xl">
          <h1 className="mb-5 text-5xl font-extrabold leading-tight">
            Military Surveillance System
          </h1>

          <p className="mb-8 text-lg">
            An AI-powered security platform featuring{" "}
            <span className="font-semibold">real-time face recognition</span>{" "}
            and{" "}
            <span className="font-semibold">military vehicle detection</span>.
            Detect unauthorized access, track vehicles, and receive instant
            alerts to protect critical installations.
          </p>

          <div className="flex justify-center gap-4">
            <Link href={"/signup"} className="btn btn-primary px-6">
              Get Started
            </Link>
            <Link href={"/about"} className="btn btn-outline btn-accent px-6">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
