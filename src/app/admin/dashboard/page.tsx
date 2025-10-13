"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { IconCar, IconEye, IconLockAccess } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    classes: {},
    videoProcessed: 0,
    averageConfidence: 0,
    recent: [],
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get("/api/detections/summary");
      setStats(data);
    };
    fetchData();
  }, []);

  const AREA_COLOR = "#4A90E2";
  const PIE_COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300"];

  const statsDetails = [
    {
      label: "Total Detections",
      value: stats.totalEvents,
      icon: IconEye,
      color: "text-primary",
      desc: "Since launch",
    },
    {
      label: "Vehicle Classes",
      value: Object.keys(stats.classes).length,
      icon: IconCar,
      color: "text-secondary",
      desc: "Different types detected",
    },
    {
      label: "Videos Processed",
      value: `${stats.videoProcessed}`,
      icon: IconLockAccess,
      color: "text-accent",
      desc: "Across all events",
    },
  ];

  const pieData = Object.entries(stats.classes).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-semibold text-center">
        🚀 Military Vehicle Detection Dashboard
      </h1>

      {/* === STATS === */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="stats shadow w-full bg-base-300 max-w-6xl mx-auto">
          {statsDetails.map((stat, idx) => (
            <div key={idx} className={`${stat.color} stat`}>
              <div className={`stat-figure ${stat.color} text-3xl`}>
                <stat.icon size={30} />
              </div>
              <div className="stat-title">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-desc">{stat.desc}</div>
            </div>
          ))}
          <div className="stat">
            <div className="stat-figure text-secondary">
              <div className="avatar avatar-online">
                <div className="w-16 rounded-full">
                  <img src={user?.profileImage} />
                </div>
              </div>
            </div>
            <div className="stat-value">
              {Math.round(stats.averageConfidence)}%
            </div>
            <div className="stat-title">Avg Confidence</div>
            <div className="stat-desc text-secondary">31 tasks remaining</div>
          </div>
        </div>
      </div>

      {/* === GRAPHS SECTION === */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Area Chart - Detections Over Time */}
        <div className="bg-base-300 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 uppercase text-center">
            Detection Trends
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.recent}>
              <defs>
                <linearGradient
                  id="colorDetections"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={AREA_COLOR} stopOpacity={0.7} />
                  <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke={AREA_COLOR}
                fill="url(#colorDetections)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Distribution by Class */}
        <div className="bg-base-300 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 uppercase text-center">
            Detections by Class
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
