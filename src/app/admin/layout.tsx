"use client";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";

const Component = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useAuth();
  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get("/api/auth/verifytoken");
      if (response.data) {
        setUser(response.data.user);
      }
    };
    fetchUser();
  }, []);
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
      </head>
      <body className={`antialiased h-screen roboto`}>
        <Toaster />
        <Navbar />
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">{children}</div>
      </body>
    </html>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Component>{children}</Component>
    </AuthProvider>
  );
}
