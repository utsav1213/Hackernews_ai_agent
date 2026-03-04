import { fetchTopStories, isTechStory } from "@/lib/hackernews";
import AgentPanel from "@/components/AgentPanel";
import NewsTabs from "@/components/NewsTabs";

export const revalidate = 300; // ISR: regenerate every 5 minutes

export default async function Home() {
  const raw = await fetchTopStories(60);
  const stories = [...raw].sort((a, b) => b.time - a.time);
  const techStories = stories.filter(isTechStory);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                HN Tweet Forge
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hacker News → AI-Powered Tweets
              </p>
            </div>
          </div>
          <a
            href="https://news.ycombinator.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Hacker News
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* AI Agent Panel */}
        <AgentPanel />

        {/* News Sections */}
        <NewsTabs allStories={stories} techStories={techStories} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-zinc-400">
          <p>
            Built with Next.js, Vercel AI SDK &amp; Google Gemini. Data from{" "}
            <a
              href="https://github.com/HackerNews/API"
              className="text-orange-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hacker News API
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
