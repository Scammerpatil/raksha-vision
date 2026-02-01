import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are Raksha Vision Chat Bot, an AI assistant designed to help users with information related to Raksha Vision's services and products. Provide clear, concise, and accurate responses to user inquiries. Raskha Vision is focused on enhancing security and surveillance through advanced AI technologies. Always maintain a professional and helpful tone in your responses.
`;

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  try {
    const chat = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await chat.generateContent(
      `${SYSTEM_PROMPT} and this is the conversation history: ${history
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join("\n")}\nUser: ${message}\nAI:`,
    );
    const reply = result.response.text();

    return NextResponse.json({
      reply,
      role: "bot",
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      reply: "Sorry, something went wrong while generating a response.",
      role: "bot",
    });
  }
}
