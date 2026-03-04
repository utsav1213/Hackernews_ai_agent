import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { fetchTopStories, getHNUrl } from "./hackernews";

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const model = openrouter("meta-llama/llama-3.3-70b-instruct");

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

export async function runTweetAgent(
  _userPrompt?: string,
): Promise<TweetResult[]> {
  // Step 1: Fetch stories directly — avoids asking the model to orchestrate
  // dozens of sequential tool calls (which causes Groq's "failed_generation" error).
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

  // Step 2: Filter trending stories in code
  const trending = stories.filter((s) => s.score > 100 || s.commentCount > 50);

  // Step 3: Generate each tweet individually (parallel, no agent loop)
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

  return results
    .filter(
      (r): r is PromiseFulfilledResult<TweetResult> => r.status === "fulfilled",
    )
    .map((r) => r.value);
}

export async function generateViralTweet(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: `You are a tech educator on Twitter/X who explains complex topics in a way that makes people say "I finally get it now."

Write an educational tweet thread about this Hacker News story. Your goal is to make readers LEARN something valuable.

Title: ${story.title}
URL: ${story.url}
Score: ${story.score} points

Your tweet should:
1. Start with a clear hook that states WHAT this is about
2. Explain WHY it matters (the real-world impact or problem it solves)
3. Include HOW it works or what makes it different (technical insight)
4. End with a key takeaway or implication people should understand
5. Include the URL

Format:
- Write 3-5 clear, informative sentences
- Use plain English - explain like you're teaching a smart colleague
- Focus on insight and understanding, not hype
- Total around 280-500 characters (can be longer if needed for clarity)
- No hashtags, no emoji spam
- Natural, conversational tone

Example style:
"Secure LLM scripting is a way to let AI models execute code safely in sandboxed environments. Why it matters: Until now, giving LLMs code execution meant risking system access. This uses formal verification + runtime isolation to prove the code can't escape. Game changer for autonomous agents. [url]"

Return ONLY the tweet text. No explanation, no quotes.`,
  });

  return text.trim();
}

export async function generateSingleTweet(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: `You are a tech educator on Twitter/X. Write an informative tweet about this Hacker News story that teaches readers something valuable.

Title: ${story.title}
URL: ${story.url}
Score: ${story.score} points
Author: ${story.by}

Your tweet should educate and explain:
1. What is this? (Clear explanation)
2. Why does it matter? (Real-world impact)
3. Key insight or how it works (Technical detail that's useful to know)
4. Include the URL

Rules:
- 3-5 sentences of clear explanation
- Make readers feel smarter after reading
- Use plain English, avoid jargon unless you explain it
- Focus on understanding over hype
- 280-500 characters total (prioritize clarity over brevity)
- No hashtags, natural tone

Example:
"MLLD enables secure LLM scripting - letting AI models run code in verified sandboxes. The breakthrough: formal proofs guarantee code can't escape isolation, making autonomous agents actually safe to deploy. This solves the 'give GPT a terminal' problem everyone's been stuck on. [url]"

Return ONLY the tweet text, nothing else.`,
  });

  return text.trim();
}

export async function generateLinkedInPost(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: `You are a tech professional who shares insightful LinkedIn posts that educate your network about emerging technologies and industry trends.

Write a LinkedIn post about this Hacker News story that provides real value and knowledge to your professional network.

Title: ${story.title}
URL: ${story.url}
Score: ${story.score} points
Author: ${story.by}

Structure your post to maximize learning:

1. **Opening Hook** (1 sentence): State what this is and why it matters
2. **The Problem/Context** (2-3 sentences): Explain the challenge or gap this addresses
3. **The Solution/Innovation** (3-4 sentences): How it works, what makes it different, key technical insights
4. **Impact & Implications** (2-3 sentences): Real-world applications, who benefits, what changes
5. **Key Takeaway** (1-2 sentences): The main lesson or insight professionals should remember
6. **Link**: Include the URL at the end

Style Guidelines:
- Professional but conversational tone
- Use paragraphs with line breaks for readability
- Focus on education and insight, not hype
- Make complex topics accessible
- 800-1200 characters total (LinkedIn's sweet spot)
- No excessive emojis (max 2-3 relevant ones)
- No hashtag spam (max 3 relevant hashtags at the very end)
- Write like you're sharing knowledge with colleagues, not selling

Example structure:
"Secure LLM scripting just became a reality, and it's a bigger deal than most people realize.

Here's the challenge: Giving AI models the ability to execute code has always been risky. One wrong move and you're handing over system access to a black box. This has blocked countless use cases for autonomous agents.

Enter MLLD - a framework that uses formal verification + runtime isolation to prove code can't escape its sandbox. Think of it like a mathematical guarantee that the AI's code is safe before it runs. The tech combines symbolic execution (analyzing all possible code paths) with containerization that's provably secure.

Real-world impact: This unlocks autonomous agents that can actually interact with systems safely. Developer tools that write AND test code. AI assistants that can execute tasks without human verification at every step.

The key insight: Security isn't about hoping the AI behaves - it's about making unsafe behavior mathematically impossible.

[URL]

#AI #CyberSecurity #SoftwareEngineering"

Return ONLY the LinkedIn post text. No explanation, no quotes.`,
  });

  return text.trim();
}

export async function generateViralLinkedInPost(story: {
  title: string;
  url: string;
  score: number;
  by: string;
}): Promise<string> {
  const { text } = await generateText({
    model,
    prompt: `You are a thought leader on LinkedIn who writes posts that get thousands of views because they make complex tech concepts crystal clear and show why they matter to professionals.

Write a LinkedIn post about this Hacker News story that will resonate with technical professionals and business leaders alike.

Title: ${story.title}
URL: ${story.url}
Score: ${story.score} points

Your post should follow this proven LinkedIn engagement formula:

1. **Pattern Interrupt Opening** (1 sentence): Start with a surprising insight or contrarian take that makes people stop scrolling
2. **Make It Relatable** (2 sentences): Connect to a pain point or experience your audience knows
3. **Explain the Innovation** (3-4 sentences): What it is, how it works, what's actually new (not just buzzwords)
4. **Show the Impact** (2-3 sentences): Who this helps, what becomes possible, why it matters beyond tech
5. **Provoke Thought** (1-2 sentences): End with a question, implication, or perspective that invites engagement
6. **Include URL**

Style:
- Mix short and medium sentences for rhythm
- Use line breaks generously (1-2 sentence paragraphs)
- Professional tone but show your personality
- Make technical readers feel smart, non-technical readers feel included
- 900-1300 characters
- 2-4 relevant emojis maximum
- 3-5 hashtags at the end only
- Write to teach, inspire, and spark discussion

Example tone:
"Most developers are solving the wrong AI security problem. 🔒

We're obsessed with making AI models 'aligned' - teaching them to want to do the right thing. But here's the issue: That's governance by wishes.

MLLD takes a radically different approach. Instead of hoping the AI behaves, it makes misbehavior mathematically impossible. How? Formal verification proves the code can't escape before it runs. Like building a prison that's impossible to break out of, not finding a prisoner who promises not to escape.

This matters beyond tech: It's the difference between trusting AI and proving AI is trustworthy. One scales. One doesn't.

For engineering teams: This is how autonomous agents ship to production without becoming existential risks.
For business leaders: This is how AI moves from experimental to operational.

The real unlock isn't smarter AI. It's provably safe AI.

What's your team's biggest blocker to deploying AI in production? 💭

[URL]

#ArtificialIntelligence #EngineeringSecurity #TechLeadership #Innovation"

Return ONLY the LinkedIn post text. No explanation, no quotes.`,
  });

  return text.trim();
}
