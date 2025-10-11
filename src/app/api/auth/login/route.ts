import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import dbConfig from "@/config/db.config";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import ejs from "ejs";
import path from "path";

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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.SMTP_EMAIL || "hello.novacops@gmail.com",
    pass: process.env.SMTP_PASSWORD || "vghbbajgeqoutrtg",
  },
});

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
      } else if (stdout.trim().includes("public/")) {
        const imagePath = stdout.trim();
        // const imageData = fs.readFileSync(imagePath, { encoding: "base64" });
        const ipAddress = req.headers.get("x-forwarded-for") || "Unknown IP";
        const timestamp = new Date().toLocaleString();
        await sendEmail({
          userName: user.name,
          ipAddress,
          timestamp,
          imagePath,
        });
        fs.unlinkSync(imagePath);
        return NextResponse.json(
          {
            message:
              "Unauthorized login attempt detected. The admin has been notified.",
            success: false,
          },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Invalid Credentials", success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}

const sendEmail = async ({
  userName,
  ipAddress,
  timestamp,
  imagePath,
}: {
  userName: string;
  ipAddress: string;
  timestamp: string;
  imagePath: string;
}) => {
  const templatePath = path.join(
    process.cwd(),
    "src/helper/unAuthorizedTemplate.ejs"
  );
  const template = fs.readFileSync(templatePath, "utf-8");
  try {
    const html = ejs.render(template, {
      userName,
      ipAddress,
      timestamp,
    });
    const mailOptions = {
      from: "Raksha Vision | No Reply <",
      to: process.env.ADMIN_ORIGINAL_EMAIL || "hello.novacops@gmail.com",
      subject: "Unauthorized Login Attempt Detected",
      html,
      attachments: [
        {
          filename: "unauthorized_attempt.png",
          path: imagePath,
          cid: "unauthorized_img",
        },
      ],
    };
    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Failed to send email:", err);
          reject(err);
        } else {
          console.log("Email sent successfully:", info.response);
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
