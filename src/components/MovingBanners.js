import React from "react";

/**
 * Ambient graffiti tag banners that glide across the screen behind hero
 * content — bold marker-font phrases at real opacity, like tags bombed
 * across a wall, not a faint watermark.
 */
const ROWS = [
  { text: "STRUGGLE TO STRENGTH", speed: "32s", size: "text-4xl sm:text-6xl", top: "10%", opacity: 0.16, color: "text-neon", rotate: "-3deg" },
  { text: "STREET ART \u00b7 RISE UP", speed: "24s", size: "text-3xl sm:text-5xl", top: "42%", opacity: 0.14, color: "text-rose", rotate: "2deg", reverse: true },
  { text: "MADE WITH LOVE \u00b7 WORLDWIDE", speed: "40s", size: "text-4xl sm:text-6xl", top: "74%", opacity: 0.13, color: "text-lime", rotate: "-1.5deg" },
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
            className={`banner-track font-tag ${r.size} ${r.color} tracking-wide`}
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

/**
 * A solid, high-contrast marquee strip — like caution tape bombed across
 * the site. Meant to be dropped between sections for a bold, professional
 * "moving billboard" moment.
 */
const TICKER_ITEMS = [
  "EXISTEANCE EMB'Z DESIGN'S",
  "LIMITED RUNS",
  "PRINTED ON DEMAND",
  "WORLDWIDE SHIPPING",
  "STREET ART \u00b7 STRUGGLE TO STRENGTH",
];

export const TickerBanner = ({ reverse = false, className = "" }) => {
  const group = [...TICKER_ITEMS];
  const track = [...group, ...group, ...group];
  return (
    <div className={`ticker-strip caution-stripes ${className}`} data-testid="ticker-banner">
      <div className="ticker-strip-inner">
        <div
          className={`ticker-track font-tag text-lg sm:text-2xl tracking-wide`}
          style={{ animation: `${reverse ? "banner-scroll-reverse" : "banner-scroll"} 26s linear infinite` }}
        >
          {track.map((t, j) => (
            <span key={j} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
