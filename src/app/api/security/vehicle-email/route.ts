import { NextResponse } from "next/server";
import EmailCount from "@/models/EmailCount";
import dbConfig from "@/config/db.config";

export async function POST() {
  dbConfig();

  let record = await EmailCount.findOne();

  if (!record) {
    record = await EmailCount.create({
      vehicle_detection_email: 1,
    });
  } else {
    record.vehicle_detection_email += 1;
    await record.save();
  }

  return NextResponse.json({ success: true });
}