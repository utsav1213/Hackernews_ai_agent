import { NextResponse } from "next/server";
import { fetchTopStories } from "@/lib/hackernews";

export async function GET() {
  try {
    const stories = await fetchTopStories(30);
    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Failed to fetch HN stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 },
    );
  }
}
