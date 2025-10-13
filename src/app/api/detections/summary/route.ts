import { NextRequest, NextResponse } from "next/server";
import Detection from "@/models/Detection";
import dbConfig from "@/config/db.config";
import jwt from "jsonwebtoken";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const token = await req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedId = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    if (!decodedId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const detections = await Detection.find({ uploader_id: decodedId.id })
      .sort({ processed_at: -1 })
      .lean();

    let totalEvents = 0;
    let classCounts: Record<string, number> = {};
    let confidenceSum = 0;
    let confidenceCount = 0;

    detections.forEach((det) => {
      totalEvents += det.summary.total_events;
      for (const [cls, count] of Object.entries(det.summary.classes)) {
        classCounts[cls] = (classCounts[cls] || 0) + (count as number);
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

    return NextResponse.json({
      totalEvents,
      videoProcessed: detections.length,
      classes: classCounts,
      averageConfidence,
      recent,
    });
  } catch (error) {
    console.log("Error fetching detection summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch detection summary" },
      { status: 500 }
    );
  }
}
