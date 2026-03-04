"use client";

import { useState } from "react";

interface AgentPanelProps {}

interface AgentTweet {
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

export default function   AgentPanel({}: AgentPanelProps) {
  const [tweets, setTweets] = useState<AgentTweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const runAgent = async () => {
    setLoading(true);
    setError("");
    setTweets([]);
    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTweets(data.tweets);
      }
    } catch {
      setError("Failed to run AI Agent. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const copyTweet = async (tweet: string, idx: number) => {
    await navigator.clipboard.writeText(tweet);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const postToTwitter = (tweet: string) => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-2xl border border-purple-200 dark:border-purple-800/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            AI Tweet Agent
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Automatically picks trending stories and crafts viral tweets
          </p>
        </div>
        <button
          onClick={runAgent}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Agent Working...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Run AI Agent
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              AI Agent is analyzing Hacker News...
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Picking top stories &amp; crafting tweets
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {tweets.length > 0 && (
        <div className="space-y-4 mt-4">
          {tweets.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {idx + 1}
                </span>
                <div>
                  <a
                    href={item.story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-purple-600 transition-colors"
                  >
                    {item.story.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    <span>{item.story.score} points</span>
                    <a
                      href={item.story.hnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-orange-500 transition-colors"
                    >
                      HN Discussion
                    </a>
                  </div>
                </div>
              </div>

              <div className="ml-10 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {item.tweet}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-xs text-zinc-400">
                    {item.tweet.length}/280
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyTweet(item.tweet, idx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    >
                      {copiedIdx === idx ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => postToTwitter(item.tweet)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
