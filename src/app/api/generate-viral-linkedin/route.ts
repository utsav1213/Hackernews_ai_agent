import { NextRequest, NextResponse } from "next/server";
import { generateViralLinkedInPost } from "@/lib/ai-agent";

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

    const post = await generateViralLinkedInPost({ title, url, score, by });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Failed to generate viral LinkedIn post:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate LinkedIn post. Make sure OPENROUTER_API_KEY is set.",
      },
      { status: 500 },
    );
  }
}
