import { NextRequest, NextResponse } from "next/server";
import { generateTweetFromImage } from "@/lib/ai-agent";

export const maxDuration = 30; // 30 seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields: imageBase64, mimeType" },
        { status: 400 },
      );
    }

    const tweet = await generateTweetFromImage(imageBase64, mimeType);
    return NextResponse.json({ tweet });
  } catch (error) {
    console.error("Failed to generate tweet from image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate tweet from image.",
      },
      { status: 500 },
    );
  }
}
