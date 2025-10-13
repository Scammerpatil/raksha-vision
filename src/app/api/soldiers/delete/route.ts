import { NextRequest, NextResponse } from "next/server";
import Soldier from "@/models/Soldier";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "Soldier ID is required" },
        { status: 400 }
      );
    }
    const exisitingSoldier = await Soldier.findById(id);
    if (!exisitingSoldier) {
      return NextResponse.json(
        { message: "Soldier not found" },
        { status: 404 }
      );
    }
    const folderPath = `python/Soldier_Images/${exisitingSoldier.email}`;
    const imagePath = `public/soldiers/${exisitingSoldier.name
      .split(" ")
      .join("_")}.jpg`;
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    await execAsync("py -3.12 python/encoding.py");
    await Soldier.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Soldier deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in DELETE /api/soldiers/delete", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
