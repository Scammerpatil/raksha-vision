import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    await execAsync("py -3.12 python/start_stream.py");
    return NextResponse.json(
      { message: "Live stream started successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting live stream:", error);
    return NextResponse.json(
      { error: "Failed to start live stream" },
      { status: 500 }
    );
  }
}
