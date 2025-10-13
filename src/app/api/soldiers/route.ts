import Soldier from "@/models/Soldier";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const soliders = await Soldier.find({});
    return NextResponse.json(soliders, { status: 200 });
  } catch (error) {
    console.log("Error in GET /api/soldiers", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
