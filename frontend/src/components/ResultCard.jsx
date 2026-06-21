import { useState } from "react";
import { API_BASE } from "../config";

export default function ResultCard({ shortCode }) {
  const [copied, setCopied] = useState(false);
  if (!shortCode) return null;

  const shortUrl = `${API_BASE}/${shortCode}`;

  function copy() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="max-w-2xl mx-auto mb-section-gap">
      <div className="bg-surface-container-high border-2 border-primary-container rounded-xl flex items-center justify-between group transition-all">
        <div className="flex items-center gap-gutter px-gutter py-4">
          <span className="material-symbols-outlined text-primary-container text-3xl">link</span>
          <div className="text-left">
            <p className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-1">
              Your Shortened Link
            </p>
            <p className="font-headline-md text-headline-md text-primary break-all">{shortUrl}</p>
          </div>
        </div>
        <button
          onClick={copy}
          className="mr-gutter px-8 py-3 bg-white text-background font-bold rounded-lg neo-shadow transition-all flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined">
            {copied ? "check" : "content_copy"}
          </span>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </section>
  );
}