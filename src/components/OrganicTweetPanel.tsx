"use client";

import { useState } from "react";

export default function OrganicTweetPanel() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateTweet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-organic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.error) {
        setContent(`Error: ${data.error}`);
      } else {
        setContent(data.tweet);
      }
    } catch {
      setContent("Failed to generate tweet. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  const copyTweet = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const postToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      content,
    )}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900/50">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <svg
            className="w-5 h-5 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Organic Viral Tweet Generator
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Generate an authentic, highly-engaging random tech tweet. No links
          required.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Topic (optional)
          </label>
          <input
            id="topic"
            type="text"
            placeholder="e.g. React, Docker, standup meetings... or leave blank for a random topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-zinc-100 placeholder:text-zinc-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                generateTweet();
              }
            }}
          />
        </div>

        <button
          onClick={generateTweet}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
              Thinking of a hot take...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              Generate Tweet
            </>
          )}
        </button>

        {content && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-400">
                {content.length} / 280 characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyTweet}
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={postToTwitter}
                  className="px-3 py-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
        )}
      </div>
    </section>
  );
}
