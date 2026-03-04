import { NextResponse } from "next/server";
import { runTweetAgent } from "@/lib/ai-agent";

export async function POST() {
  try {
    const tweets = await runTweetAgent();
    return NextResponse.json({ tweets });
  } catch (error) {
    console.error("Agent failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const isRateLimit =
      message.includes("Rate limit") || message.includes("429");
    return NextResponse.json(
      {
        error: isRateLimit
          ? "OpenRouter rate limit hit. Please wait ~30 seconds and try again."
          : `AI Agent failed: ${message}`,
      },
      { status: 500 },
    );
  }
}
