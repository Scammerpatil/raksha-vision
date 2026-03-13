import { NextResponse } from "next/server";
import EmailCount from "@/models/EmailCount";
import dbConfig from "@/config/db.config";

export async function POST() {
  try {
    await dbConfig();

    let record = await EmailCount.findOne();

    if (!record) {
      record = await EmailCount.create({ unidentified_user_email: 1 });
    } else {
      record.unidentified_user_email += 1;
      await record.save();
    }

    return NextResponse.json({
      success: true,
      count: record.unidentified_user_email,
      message: "Email alert recorded",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConfig();

    const record = await EmailCount.findOne();

    return NextResponse.json({
      success: true,
      count: record?.unidentified_user_email || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}