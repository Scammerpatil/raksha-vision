"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>
          Raksha Vision | Real-time surveillance for secure military monitoring.
        </title>
        <meta
          name="description"
          content="Raksha Vision integrates cutting-edge face recognition and military vehicle detection to provide advanced surveillance for military installations. The system utilizes real-time monitoring to capture, identify, and alert authorities about unauthorized individuals or vehicles. With an automated alert mechanism, Raksha Vision ensures that security threats are promptly addressed, enhancing protection and control over sensitive areas."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased roboto`}
      >
        <Navbar />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
