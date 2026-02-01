import { NextResponse } from "next/server";

export async function GET() {
  const initialPrompt =
    "Welcome to Raksha Vision Chat Bot! How can I assist you today?";

  return NextResponse.json({ reply: initialPrompt });
}
