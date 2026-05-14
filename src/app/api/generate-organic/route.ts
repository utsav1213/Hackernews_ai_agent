import { NextRequest, NextResponse } from "next/server";
import { generateOrganicViralTweet } from "@/lib/ai-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body;

    const tweet = await generateOrganicViralTweet(topic);
    return NextResponse.json({ tweet });
  } catch (error) {
    console.error("Failed to generate organic tweet:", error);
    return NextResponse.json(
      {
        error: "Failed to generate tweet. Make sure GEMINI_API_KEY is set.",
      },
      { status: 500 },
    );
  }
}
