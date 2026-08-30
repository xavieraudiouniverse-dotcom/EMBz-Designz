"use client";

import { useState } from "react";

/**
 * Shows a photo at `src` if one has been uploaded to the public/ folder.
 * Until then (or if the file 404s) it falls back to a soft glowing monogram
 * so the page never shows a broken-image icon. Drop the real photo in at
 * the given path and it takes over automatically — no code change needed.
 */
export default function MemorialPortrait({
  src,
  name,
  initial,
}: {
  src: string;
  name: string;
  initial: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="edge-glow relative mx-auto h-56 w-56 overflow-hidden rounded-full border border-primary/40 shadow-glow md:h-64 md:w-64">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-purple">
          <span className="font-display text-7xl text-white/90">{initial}</span>
        </div>
      )}
    </div>
  );
}
