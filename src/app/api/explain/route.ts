import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const model = openrouter("meta-llama/llama-3.3-70b-instruct");

export async function POST(req: NextRequest) {
  try {
    const { title, url, text } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const prompt = `You are an expert at explaining complex tech and news topics in simple, engaging language.

Analyze this Hacker News story and respond with a single valid JSON object — no markdown, no code fences, no extra text.

Story details:
Title: ${title}
${url ? `URL: ${url}` : ""}
${text ? `Story text: ${text.replace(/<[^>]+>/g, " ").slice(0, 1500)}` : ""}

Return exactly this JSON structure:
{
  "oneLiner": "One sentence capturing what this news is about",
  "summary": "Plain-English explanation in 3-5 sentences for a smart 15-year-old",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "diagram": "An ASCII diagram/flowchart specific to this topic using characters like ─ │ ┌ ┐ └ ┘ ├ ┤ → ● and newlines",
  "realWorldExample": "A concrete relatable analogy that makes the concept click",
  "whyItMatters": "2-3 sentences on the impact and significance of this news",
  "techLevel": "beginner" 
}

Rules:
- techLevel must be exactly one of: "beginner", "intermediate", "advanced"
- keyPoints must have 3 to 6 items
- diagram must be a meaningful multi-line ASCII visual relevant to this specific story, not generic
- Output raw JSON only, starting with { and ending with }`;

    const { text: rawText } = await generateText({ model, prompt });

    // Extract JSON — strip any accidental markdown fences
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in model response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Normalise techLevel
    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!validLevels.includes(parsed.techLevel)) {
      parsed.techLevel = "intermediate";
    }
    // Ensure keyPoints is an array
    if (!Array.isArray(parsed.keyPoints)) {
      parsed.keyPoints = [];
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation. Please try again." },
      { status: 500 },
    );
  }
}
