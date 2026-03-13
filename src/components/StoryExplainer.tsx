"use client";

import { useState } from "react";

interface Explanation {
  oneLiner: string;
  summary: string;
  keyPoints: string[];
  realWorldExample: string;
  whyItMatters: string;
  techLevel: "beginner" | "intermediate" | "advanced";
}

interface StoryExplainerProps {
  title: string;
  url?: string;
  text?: string;
}

const techLevelConfig = {
  beginner: {
    label: "Beginner Friendly",
    color:
      "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  intermediate: {
    label: "Intermediate",
    color:
      "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
  },
  advanced: {
    label: "Advanced",
    color:
      "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
};

export default function StoryExplainer({
  title,
  url,
  text,
}: StoryExplainerProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const explain = async () => {
    setLoading(true);
    setError("");
    setExpanded(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, text }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setExplanation(data);
      }
    } catch {
      setError("Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const levelCfg = explanation ? techLevelConfig[explanation.techLevel] : null;

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header / trigger */}
      <button
        onClick={explanation ? () => setExpanded((p) => !p) : explain}
        disabled={loading}
        className="w-full flex items-center justify-between px-6 py-4 bg-linear-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-950/30 dark:hover:to-indigo-950/30 transition-all disabled:opacity-60 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            {loading ? (
              <svg
                className="animate-spin w-4 h-4 text-white"
                viewBox="0 0 24 24"
              >
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
            ) : (
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">
              {loading
                ? "AI is analysing…"
                : explanation
                  ? "Explain in Simple Terms"
                  : "✨ Explain in Simple Terms"}
            </p>
            <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5">
              {loading
                ? "Generating a clear breakdown with diagrams…"
                : explanation
                  ? "Tap to show / hide explanation"
                  : "Get a plain-English breakdown with diagrams & examples"}
            </p>
          </div>
        </div>
        {!loading && (
          <svg
            className={`w-4 h-4 text-violet-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          {/* Loading skeleton */}
          {loading && (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6" />
              <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg mt-4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
              <button
                onClick={explain}
                className="mt-3 text-sm text-violet-600 dark:text-violet-400 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Explanation content */}
          {!loading && !error && explanation && (
            <div className="p-6 space-y-6">
              {/* One-liner + tech level */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 italic leading-relaxed flex-1">
                  &ldquo;{explanation.oneLiner}&rdquo;
                </p>
                {levelCfg && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${levelCfg.color}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${levelCfg.dot}`}
                    />
                    {levelCfg.label}
                  </span>
                )}
              </div>

              {/* Summary */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  What happened
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {explanation.summary}
                </p>
              </div>

              {/* Key points */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {explanation.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diagram removed */}

              {/* Real world example */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-5">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Real-World Analogy
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  {explanation.realWorldExample}
                </p>
              </div>

              {/* Why it matters */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-5">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Why It Matters
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  {explanation.whyItMatters}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
