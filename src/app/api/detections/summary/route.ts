import { NextRequest, NextResponse } from "next/server";
import Detection from "@/models/Detection";
import Soldier from "@/models/Soldier";
import dbConfig from "@/config/db.config";
import jwt from "jsonwebtoken";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // =======================
    // DETECTION DATA
    // =======================
    const detections = await Detection.find().sort({ processed_at: -1 }).lean();

    let totalEvents = 0;
    let classCounts: Record<string, number> = {};
    let confidenceSum = 0;
    let confidenceCount = 0;

    detections.forEach((det) => {
      totalEvents += det.summary.total_events;

      for (const [cls, count] of Object.entries(det.summary.classes)) {
        classCounts[cls] = (classCounts[cls] || 0) + Number(count);
      }

      det.detected_events.forEach((e: any) => {
        confidenceSum += e.confidence;
        confidenceCount++;
      });
    });

    const averageConfidence =
      confidenceCount > 0 ? (confidenceSum / confidenceCount) * 100 : 0;

    const recent = detections.map((d) => ({
      date: new Date(d.processed_at).toLocaleDateString(),
      count: d.summary.total_events,
    }));

    // =======================
    // SOLDIER DATA
    // =======================
    const soldiers = await Soldier.find().lean();

    const soldiersByRank: Record<string, number> = {};
    const soldiersByUnit: Record<string, number> = {};

    soldiers.forEach((s) => {
      soldiersByRank[s.rank] = (soldiersByRank[s.rank] || 0) + 1;
      soldiersByUnit[s.unit] = (soldiersByUnit[s.unit] || 0) + 1;
    });

    // =======================
    // RESPONSE
    // =======================
    return NextResponse.json({
      // detections
      totalEvents,
      videoProcessed: detections.length,
      classes: classCounts,
      averageConfidence,
      recent,

      // soldiers
      totalSoldiers: soldiers.length,
      soldiersByRank,
      soldiersByUnit,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 },
    );
  }
}
