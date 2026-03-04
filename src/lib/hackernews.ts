const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
  text?: string;
  type: string;
}

async function fetchStoryIds(
  endpoint: string,
  limit: number,
): Promise<HNStory[]> {
  const res = await fetch(`${HN_API_BASE}/${endpoint}.json`, {
    next: { revalidate: 300 },
  });
  const ids: number[] = await res.json();
  const slicedIds = ids.slice(0, limit);

  const stories = await Promise.all(
    slicedIds.map(async (id) => {
      const storyRes = await fetch(`${HN_API_BASE}/item/${id}.json`, {
        next: { revalidate: 300 },
      });
      return storyRes.json() as Promise<HNStory>;
    }),
  );

  return stories.filter(Boolean);
}

export async function fetchTopStories(limit = 30): Promise<HNStory[]> {
  return fetchStoryIds("topstories", limit);
}

export async function fetchNewStories(limit = 30): Promise<HNStory[]> {
  return fetchStoryIds("newstories", limit);
}

const TECH_KEYWORDS = [
  "python",
  "javascript",
  "typescript",
  "rust",
  "golang",
  " go ",
  "java",
  "c++",
  "c#",
  "ruby",
  "swift",
  "kotlin",
  "react",
  "vue",
  "angular",
  "next.js",
  "node",
  "npm",
  "github",
  "git",
  "linux",
  "open source",
  "opensource",
  "software",
  "programming",
  "developer",
  "code",
  "coding",
  "database",
  "sql",
  "nosql",
  "api",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "cloud",
  "ai",
  "ml",
  "llm",
  "gpt",
  "machine learning",
  "deep learning",
  "neural",
  "security",
  "vulnerability",
  "exploit",
  "cybersecurity",
  "web",
  "browser",
  "cpu",
  "gpu",
  "chip",
  "semiconductor",
  "apple",
  "google",
  "microsoft",
  "meta",
  "android",
  "ios",
  "startup",
  "saas",
  "devops",
  "framework",
  "library",
  "compiler",
  "algorithm",
  "data",
  "crypto",
  "blockchain",
  "server",
  "backend",
  "frontend",
  "fullstack",
  "engineer",
  "engineering",
  "tech",
];

export function isTechStory(story: HNStory): boolean {
  const title = (story.title || "").toLowerCase();
  const url = (story.url || "").toLowerCase();
  return TECH_KEYWORDS.some((kw) => title.includes(kw) || url.includes(kw));
}

export async function fetchStory(id: number): Promise<HNStory | null> {
  const res = await fetch(`${HN_API_BASE}/item/${id}.json`);
  if (!res.ok) return null;
  return res.json();
}

export function getHNUrl(id: number): string {
  return `https://news.ycombinator.com/item?id=${id}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
