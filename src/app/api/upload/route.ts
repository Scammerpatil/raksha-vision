import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConfig from "@/config/db.config";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import Detection from "@/models/Detection";
import { sendDetectionReportEmail } from "@/config/sendDetectionMail";
import EmailCount from "@/models/EmailCount";

dbConfig();

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decodedData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (decodedData as any).id;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const uploadDir = path.join(process.cwd(), "python", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    const { stdout } = await execAsync(
      `py -3.12 python/detection_1fs.py "${filePath}" "${userId}"`
    );
    const metaDataFile = stdout.trim();
    const data = fs.readFileSync(metaDataFile, "utf-8");
    const result = JSON.parse(data);
    const newDetection = new Detection(result);
    await sendDetectionReportEmail(result);
    let record = await EmailCount.findOne();
    if (!record) {
      record = await EmailCount.create({
        vehicle_detection_email: 1,
      });
    } else {
      record.vehicle_detection_email += 1;
      await record.save();
    }
    await newDetection.save();
    return NextResponse.json({ result });
  } catch (error) {
    console.log("Error in detection route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
