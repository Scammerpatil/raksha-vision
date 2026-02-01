import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.SMTP_EMAIL || "hello.novacops@gmail.com",
    pass: process.env.SMTP_PASSWORD || "vghbbajgeqoutrtg",
  },
});

export async function sendDetectionReportEmail(result: any) {
  const templatePath = path.join(process.cwd(), "src/helper/mailTemplate.ejs");

  const template = fs.readFileSync(templatePath, "utf-8");

  const html = ejs.render(template, {
    ...result,
    baseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  });

  const mailOptions = {
    from: "RakshaVision <no-reply@rakshavision.ai>",
    to: process.env.ADMIN_ORIGINAL_EMAIL,
    subject: "🚨 Detection Intelligence Report",
    html,
  };

  await transporter.sendMail(mailOptions);
}
