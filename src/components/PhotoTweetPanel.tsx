"use client";

import { useState, useRef } from "react";

export default function PhotoTweetPanel() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const [tweet, setTweet] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTweet("");
    setMimeType(file.type);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // remove the data:image/png;base64, prefix
      const base64Data = base64String.split(",")[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const generateTweet = async () => {
    if (!imageBase64 || !mimeType) return;

    setLoading(true);
    setTweet("");
    try {
      const res = await fetch("/api/generate-from-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const data = await res.json();
      if (data.error) {
        setTweet(`Error: ${data.error}`);
      } else {
        setTweet(data.tweet);
      }
    } catch {
      setTweet("Failed to generate tweet. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const copyTweet = async () => {
    await navigator.clipboard.writeText(tweet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const postToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Study & Learn: Photo to Tweet
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload a screenshot of what you&apos;re reading or learning to
          generate a quick observation tweet.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
          >
            Choose Image
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {imagePreview && (
            <button
              onClick={generateTweet}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
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
              )}
              {loading ? "Analyzing..." : "Generate Tweet"}
            </button>
          )}
        </div>

        {imagePreview && (
          <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {tweet && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {tweet}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-400">
                {tweet.length} / 280 characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyTweet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={postToTwitter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                >
                  Post on X
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
