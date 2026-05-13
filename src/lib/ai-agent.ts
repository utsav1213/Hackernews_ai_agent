import { fetchTopStories, getHNUrl } from "./hackernews";

async function generateTextFromGemini(prompt: string) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${body}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

export async function generateTweetFromImage(
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `You are a developer sharing something you just learned or read today. 
Write a short, engaging tweet showcasing this image.
Keep it authentic, casual, and insightful.
Include a brief observation, takeaway, or excitement about what's in the image.
STRICT RULES:
1. MAX 280 CHARACTERS.
2. DO NOT use hashtags or emojis.
3. Completely lowercase or casual casing is fine. Do NOT wrap output in quotes.
4. Keep it under 2 sentences. Treat it as a quick thought.

Return ONLY the tweet text.`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${body}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

export interface TweetResult {
  story: {
    id: number;
    title: string;
    url: string;
    hnUrl: string;
    score: number;
  };
  tweet: string;
  reasoning: string;
}

export async function runTweetAgent(): Promise<TweetResult[]> {
  const rawStories = await fetchTopStories(30);
  const stories = rawStories.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url || getHNUrl(s.id),
    hnUrl: getHNUrl(s.id),
    score: s.score,
    by: s.by,
    commentCount: s.descendants || 0,
  }));

  const trending = stories.filter((s) => s.score > 100 || s.commentCount > 50);

  const results = await Promise.allSettled(
    trending.map(async (story) => {
      const tweet = await generateSingleTweet({
        title: story.title,
        url: story.url,
        score: story.score,
        by: story.by,
      });
      return {
        story: {
          id: story.id,
          title: story.title,
          url: story.url,
          hnUrl: story.hnUrl,
          score: story.score,
        },
        tweet,
        reasoning: "",
      } satisfies TweetResult;
    }),
  );

  const successfulResults = results
    .filter(
      (r): r is PromiseFulfilledResult<TweetResult> => r.status === "fulfilled",
    )
    .map((r) => r.value);

  if (successfulResults.length === 0 && trending.length > 0) {
    const firstError = results.find(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult;
    throw (
      firstError?.reason || new Error("All AI agent generation tasks failed")
    );
  }

  return successfulResults;
}

export async function generateViralTweet(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const prompt = `You are a tech educator on Twitter/X who explains complex topics in a way that makes people say "I finally get it now."\n\nWrite an educational tweet thread about this Hacker News story. Your goal is to make readers LEARN something valuable.\n\nTitle: ${story.title}\nURL: ${story.url}\nScore: ${story.score} points\n\nYour tweet should:\n1. Start with a clear hook that states WHAT this is about\n2. Explain WHY it matters (the real-world impact or problem it solves)\n3. Include HOW it works or what makes it different (technical insight)\n4. End with a key takeaway or implication people should understand\n5. Include the URL\n\nFormat:\n- Write 3-5 clear, informative sentences\n- Use plain English - explain like you're teaching a smart colleague\n- Focus on insight and understanding, not hype\n- Total around 280-500 characters (can be longer if needed for clarity)\n- No hashtags, no emoji spam\n- Natural, conversational tone\n\nReturn ONLY the tweet text. No explanation, no quotes.`;

  const text = await generateTextFromGemini(prompt, 700);
  return text.trim();
}

export async function generateSingleTweet(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const prompt = `You are an authentic, colloquial software engineer sharing a link on Twitter (X). You speak casually and use standard Twitter lingo—not overly corporate, not overly dramatic, just a regular dev sharing a link.

Write a single tweet sharing this Hacker News story:
Title: ${story.title}
URL: ${story.url}

STRICT RULES to prevent sounding like an AI:
1. MAX 280 CHARACTERS total. Must be short enough to tweet.
2. Do NOT wrap the output in quotes (""). Output the exact text and URL.
3. Keep it casual. Lowercase formatting is fine. Avoid robot-speak like "delving into", "groundbreaking", or "another day another vuln".
4. Do NOT use hashtags (#) or emojis.
5. Just give one brief, casual thought, observation, or unenthusiastic summary of why the link is worth clicking, followed by the URL on a new line.
6. Make it sound like a real person quickly typing a thought on their phone.
7. No rhetorical questions ending with question marks. No preachy moral lessons.

Example styles:
"actually a solid breakdown of how postgres handles mvcc"
"we've gone full circle on server side rendering"
"this explains the recent redis drama pretty well"
"i am entirely too tired to read another post about kubernetes right now"

Format:
[your short thought]
[URL]

Return ONLY the final tweet text.`;

  const text = await generateTextFromGemini(prompt, 256);
  return text.trim();
}

export async function generateLinkedInPost(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const prompt = `You are a tech professional who shares insightful LinkedIn posts that educate your network about emerging technologies and industry trends.\n\nWrite a LinkedIn post about this Hacker News story that provides real value and knowledge to your professional network.\n\nTitle: ${story.title}\nURL: ${story.url}\nScore: ${story.score} points\nAuthor: ${story.by}\n\nStructure your post to maximize learning:\n\n1. Opening Hook (1 sentence): State what this is and why it matters\n2. The Problem/Context (2-3 sentences): Explain the challenge or gap this addresses\n3. The Solution/Innovation (3-4 sentences): How it works, what makes it different, key technical insights\n4. Impact & Implications (2-3 sentences): Real-world applications, who benefits, what changes\n5. Key Takeaway (1-2 sentences): The main lesson or insight professionals should remember\n6. Link: Include the URL at the end\n\nStyle Guidelines:\n- Professional but conversational tone\n- Use paragraphs with line breaks for readability\n- Focus on education and insight, not hype\n- Make complex topics accessible\n- 800-1200 characters total (LinkedIn's sweet spot)\n\nReturn ONLY the LinkedIn post text.`;

  const text = await generateTextFromGemini(prompt, 900);
  return text.trim();
}

export async function generateViralLinkedInPost(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const prompt = `You are a thought leader on LinkedIn who writes posts that get thousands of views because they make complex tech concepts crystal clear and show why they matter to professionals.\n\nWrite a LinkedIn post about this Hacker News story that will resonate with technical professionals and business leaders alike.\n\nTitle: ${story.title}\nURL: ${story.url}\nScore: ${story.score} points\n\nYour post should follow this proven LinkedIn engagement formula:\n\n1. Pattern Interrupt Opening (1 sentence): Start with a surprising insight or contrarian take that makes people stop scrolling\n2. Make It Relatable (2 sentences): Connect to a pain point or experience your audience knows\n3. Explain the Innovation (3-4 sentences): What it is, how it works, what's actually new (not just buzzwords)\n4. Show the Impact (2-3 sentences): Who this helps, what becomes possible, why it matters beyond tech\n5. Provoke Thought (1-2 sentences): End with a question, implication, or perspective that invites engagement\n6. Include URL\n\nReturn ONLY the LinkedIn post text.`;

  const text = await generateTextFromGemini(prompt, 1100);
  return text.trim();
}

export { generateTextFromGemini };
