import { NextRequest, NextResponse } from "next/server";
import { generateSingleTweet } from "@/lib/ai-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, url, score, by } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Missing required fields: title, url" },
        { status: 400 },
      );
    }

    const tweet = await generateSingleTweet({ title, url, score, by });
    return NextResponse.json({ tweet });
  } catch (error) {
    console.error("Failed to generate tweet:", error);
    return NextResponse.json(
      {
        error: "Failed to generate tweet. Make sure OPENROUTER_API_KEY is set.",
      },
      { status: 500 },
    );
  }
}
