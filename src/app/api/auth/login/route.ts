import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/config/db.config";
import { exec } from "child_process";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "@/models/User";

dbConfig();
const execAsync = promisify(exec);

const generateToken = (data: object) => {
  return jwt.sign(data, process.env.JWT_SECRET!, { expiresIn: "1d" });
};

const setTokenCookie = (response: NextResponse, token: string) => {
  response.cookies.set("token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
  });
};

export async function POST(req: NextRequest) {
  const { formData } = await req.json();

  if (!formData.email || !formData.password) {
    return NextResponse.json(
      { message: "Please fill all the fields", success: false },
      { status: 400 }
    );
  }

  if (
    formData.email === process.env.ADMIN_EMAIL &&
    formData.password === process.env.ADMIN_PASSWORD
  ) {
    const data = {
      id: "admin",
      name: "Admin",
      role: "admin",
      email: process.env.ADMIN_EMAIL,
      profileImage: "https://cdn-icons-png.flaticon.com/512/9703/9703596.png",
    };
    const token = generateToken(data);
    const response = NextResponse.json({
      message: "Login Success",
      success: true,
      route: `/admin/dashboard`,
    });
    setTokenCookie(response, token);
    return response;
  }

  // User login logic
  const user = await User.findOne({ email: formData.email });
  if (!user) {
    return NextResponse.json(
      { message: "User not found", success: false },
      { status: 400 }
    );
  }
  const isPasswordValid = await bcryptjs.compare(
    formData.password,
    user.password
  );

  if (isPasswordValid) {
    const { stdout } = await execAsync(
      `py -3.12 python/login.py "${formData.email}"`
    );
    if (stdout.trim().includes("Login Successful")) {
      const data = {
        id: user._id,
        role: "user",
        email: user.email,
        name: user.name,
        profilImage: user.profileImage,
      };
      const token = generateToken(data);
      const response = NextResponse.json({
        message: "Login Success",
        success: true,
        route: `/user/dashboard`,
        user,
      });
      setTokenCookie(response, token);
      return response;
    } else {
      return NextResponse.json(
        { message: "Face Verification Failed" },
        { status: 403 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Invalid Credentials", success: false },
      { status: 400 }
    );
  }
}
