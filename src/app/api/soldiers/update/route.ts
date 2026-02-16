import Soldier from "@/models/Soldier";
import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/config/db.config";

dbConfig();

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data._id) {
      return NextResponse.json(
        { message: "Soldier ID is required" },
        { status: 400 },
      );
    }

    // Only allow editable fields
    const allowedUpdates = {
      name: data.name,
      phone: data.phone,
      rank: data.rank,
      unit: data.unit,
      profileImage: data.profileImage,
    };

    const updatedSoldier = await Soldier.findByIdAndUpdate(
      data._id,
      allowedUpdates,
      { new: true },
    );

    if (!updatedSoldier) {
      return NextResponse.json(
        { message: "Soldier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Soldier updated successfully", soldier: updatedSoldier },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error in PUT /api/soldiers/update", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
