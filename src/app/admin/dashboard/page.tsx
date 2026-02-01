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
import {
  IconCar,
  IconEye,
  IconLockAccess,
  IconUsers,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEvents: 0,
    classes: {},
    videoProcessed: 0,
    averageConfidence: 0,
    recent: [],

    // soldiers
    totalSoldiers: 0,
    soldiersByRank: {},
    soldiersByUnit: {},
  });

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
      desc: "Detected events",
    },
    {
      label: "Vehicle Classes",
      value: Object.keys(stats.classes).length,
      icon: IconCar,
      color: "text-secondary",
      desc: "Detected types",
    },
    {
      label: "Videos Processed",
      value: stats.videoProcessed,
      icon: IconLockAccess,
      color: "text-accent",
      desc: "Uploaded videos",
    },
    {
      label: "Active Soldiers",
      value: stats.totalSoldiers,
      icon: IconUsers,
      color: "text-success",
      desc: "Registered personnel",
    },
  ];

  const pieData = Object.entries(stats.classes).map(([key, value]) => ({
    name: key,
    value,
  }));

  const soldierRankPie = Object.entries(stats.soldiersByRank).map(
    ([key, value]) => ({
      name: key,
      value,
    }),
  );

  const soldierUnitPie = Object.entries(stats.soldiersByUnit).map(
    ([key, value]) => ({
      name: key,
      value,
    }),
  );

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-semibold text-center">
        🚀 Military Intelligence Dashboard
      </h1>

      {/* ===== STATS ===== */}
      <div className="stats shadow bg-base-300 w-full">
        {statsDetails.map((stat, idx) => (
          <div key={idx} className={`${stat.color} stat`}>
            <div className="stat-figure text-3xl">
              <stat.icon size={30} />
            </div>
            <div className="stat-title">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-desc">{stat.desc}</div>
          </div>
        ))}

        <div className="stat">
          <div className="stat-figure">
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
          <div className="stat-desc">Detection accuracy</div>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Detection Trends */}
        <div className="bg-base-300 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center uppercase">
            Detection Trends
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.recent}>
              <defs>
                <linearGradient id="det" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#det)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Classes */}
        <div className="bg-base-300 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center uppercase">
            Detections by Class
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={90} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Soldiers by Rank */}
        <div className="bg-base-300 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center uppercase">
            Soldiers by Rank
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={soldierRankPie} dataKey="value" outerRadius={90} label>
                {soldierRankPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Soldiers by Unit */}
        <div className="bg-base-300 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-center uppercase">
            Soldiers by Unit
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={soldierUnitPie} dataKey="value" outerRadius={90} label>
                {soldierUnitPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
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
