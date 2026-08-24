import React from "react";

/**
 * Decorative banners that glide across the screen — replaces the old rain
 * effect with wide, low-opacity ribbon banners carrying the brand's
 * street-art / struggle-to-strength phrases.
 */
const ROWS = [
  { text: "STRUGGLE TO STRENGTH", speed: "36s", size: "text-3xl sm:text-4xl", top: "14%", opacity: 0.1, color: "text-neon", rotate: "-2deg" },
  { text: "STREET ART \u00b7 RISE UP", speed: "27s", size: "text-2xl sm:text-3xl", top: "46%", opacity: 0.09, color: "text-rose", rotate: "1.5deg", reverse: true },
  { text: "MADE WITH LOVE \u00b7 WORLDWIDE", speed: "44s", size: "text-3xl sm:text-5xl", top: "76%", opacity: 0.07, color: "text-lime", rotate: "-1deg" },
];

export const MovingBanners = ({ className = "" }) => (
  <div className={`moving-banners ${className}`} aria-hidden="true" data-testid="moving-banners">
    {ROWS.map((r) => {
      const group = [r.text, r.text, r.text];
      const track = [...group, ...group];
      return (
        <div
          key={r.text}
          className="banner-row"
          style={{ top: r.top, opacity: r.opacity, transform: `rotate(${r.rotate})` }}
        >
          <div
            className={`banner-track font-display ${r.size} ${r.color} tracking-[0.3em]`}
            style={{ animation: `${r.reverse ? "banner-scroll-reverse" : "banner-scroll"} ${r.speed} linear infinite` }}
          >
            {track.map((t, j) => (
              <span key={j} className="banner-item">{t}</span>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);
