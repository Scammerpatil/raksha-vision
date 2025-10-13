import User from "@/models/Soldier";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { user } = await req.json();
    if (!user || !user.email) {
      return NextResponse.json(
        { message: "Invalid user data" },
        { status: 400 }
      );
    }
    const exisitingUser = await User.findOne({ email: user.email });
    if (!exisitingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.password) {
      const encryptedPassword = await bcrypt.hash(user.password, 10);
      user.password = encryptedPassword;
    }
    await User.updateOne({ email: user.email }, { $set: user });
    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in updating user:", error);
    return NextResponse.json(
      { message: "Error in updating user" },
      { status: 500 }
    );
  }
}
