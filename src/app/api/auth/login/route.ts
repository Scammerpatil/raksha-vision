import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/config/db.config";
import jwt from "jsonwebtoken";

dbConfig();

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
  try {
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
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
