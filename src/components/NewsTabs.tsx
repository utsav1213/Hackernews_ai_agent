"use client";

import { useState } from "react";
import NewsCard from "@/components/NewsCard";
import type { HNStory } from "@/lib/hackernews";

interface NewsTabsProps {
  allStories: HNStory[];
}

export default function NewsTabs({ allStories }: NewsTabsProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Today&apos;s Top Stories
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Latest trending stories from Hacker News
          </p>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {allStories.length} stories · refreshes every 5 min
        </span>
      </div>

      {/* Stories List */}
      {allStories.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No stories found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allStories.map((story, index) => (
            <NewsCard key={story.id} story={story} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
