import Soldier from "@/models/Soldier";
import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/config/db.config";

const execAsync = promisify(exec);

dbConfig();

export async function POST(req: NextRequest) {
  try {
    const { newSoldier } = await req.json();
    const existingSoldier = await Soldier.findOne({
      serviceNumber: newSoldier.serviceNumber,
      email: newSoldier.email,
    });
    if (existingSoldier) {
      return NextResponse.json(
        { message: "Soldier with this Service Number or Email already exists" },
        { status: 400 }
      );
    }
    const { stdout } = await execAsync(
      `py -3.12 python/enroll_soldier.py "${newSoldier.email}"`
    );
    if (stdout.includes("Capture cancelled.")) {
      return NextResponse.json(
        { message: "Image capture cancelled by user." },
        { status: 400 }
      );
    }
    await execAsync("py -3.12 python/encoding.py");
    const soldier = new Soldier(newSoldier);
    await soldier.save();
    return NextResponse.json(
      { message: "Soldier added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in POST /api/soldiers/add-soldier", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
