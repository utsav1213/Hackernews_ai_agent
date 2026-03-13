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

    const prompt = `You are an expert tech analyst and educator.
Analyze this Hacker News story and provide a high-quality, insightful explanation.

Story details:
Title: ${title}
${url ? `URL: ${url}` : ""}
${text ? `Story text: ${text.replace(/<[^>]+>/g, " ").slice(0, 2000)}` : ""}

Return exactly this JSON structure (valid JSON, no markdown):
{
  "oneLiner": "A concise, powerful sentence summarizing the core news.",
  "summary": "A detailed, structured explanation (4-6 sentences). Don't just simplify it—explain the technical context, how it works, and why it's trending. Assume the reader is smart but needs context.",
  "keyPoints": ["Crucial insight 1", "Crucial insight 2", "Crucial insight 3", "Crucial insight 4"],
  "realWorldExample": "A strong analogy or example to make the concept concrete.",
  "whyItMatters": "A deep dive into the implications. Who does this affect? What does it change in the industry? Why should a developer care?",
  "techLevel": "intermediate"
}

Rules:
- techLevel must be exactly one of: "beginner", "intermediate", "advanced"
- keyPoints must have 3 to 5 items, focusing on insights, not just facts
- Focus on *effectiveness*—the reader should walk away understanding the "what", "how", and "so what".
- Output raw JSON only.`;

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
