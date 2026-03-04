"use client";

import { useState } from "react";
import NewsCard from "@/components/NewsCard";
import type { HNStory } from "@/lib/hackernews";

interface NewsTabsProps {
  allStories: HNStory[];
  techStories: HNStory[];
}

const tabs = [
  { id: "daily", label: "Daily News", icon: "📰" },
  { id: "tech", label: "Tech", icon: "💻" },
  { id: "viral", label: "Viral Tweets", icon: "🔥" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function NewsTabs({ allStories, techStories }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("daily");

  const stories =
    activeTab === "daily"
      ? allStories
      : activeTab === "tech"
        ? techStories
        : allStories;

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? tab.id === "viral"
                  ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? tab.id === "viral"
                    ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    : "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {tab.id === "daily"
                ? allStories.length
                : tab.id === "tech"
                  ? techStories.length
                  : allStories.length}
            </span>
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {activeTab === "daily"
              ? "Today's Top Stories"
              : activeTab === "tech"
                ? "Tech Stories"
                : "Go Viral 🔥"}
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {activeTab === "daily"
              ? "Latest trending stories from Hacker News"
              : activeTab === "tech"
                ? "Programming, AI, software & all things tech"
                : "Shitpost your way to 8 → 8000 followers"}
          </p>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {stories.length} stories · refreshes every 5 min
        </span>
      </div>

      {/* Stories List */}
      {stories.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No stories found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, index) => (
            <NewsCard
              key={story.id}
              story={story}
              index={index}
              mode={activeTab === "viral" ? "viral" : "normal"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
