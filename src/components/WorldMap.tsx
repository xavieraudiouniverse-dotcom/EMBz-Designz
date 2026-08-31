"use client";

/**
 * Stylized glowing "globe" visualization used on the Track Order, $9.1 Billion
 * Movement, and Command Centre pages. This is a deliberately abstract dot-map
 * (not a geographically precise atlas) — it reads as "world network" at a
 * glance, which is what the brand needs, without shipping a heavy real-world
 * geo dataset.
 */

export type MapMarker = {
  x: number; // 0-1000 viewBox units
  y: number; // 0-500 viewBox units
  label?: string;
  tone?: "purple" | "cyan";
  pulse?: boolean;
};

export type MapArc = {
  from: number; // index into markers
  to: number;
  tone?: "purple" | "cyan";
};

// Rough silhouette blobs standing in for continents — abstract on purpose.
const LANDMASSES = [
  "M 90 150 Q 40 120 70 90 Q 110 55 170 70 Q 230 55 250 100 Q 280 90 270 140 Q 300 170 260 200 Q 230 240 180 230 Q 140 250 110 210 Q 60 200 90 150 Z", // North America
  "M 210 260 Q 190 240 210 220 Q 240 210 250 240 Q 270 270 250 320 Q 260 370 230 400 Q 200 420 190 380 Q 170 340 190 300 Q 195 275 210 260 Z", // South America
  "M 470 90 Q 450 70 480 55 Q 520 40 550 60 Q 580 55 570 90 Q 590 100 560 120 Q 540 110 510 115 Q 480 110 470 90 Z", // Europe
  "M 470 150 Q 450 180 470 220 Q 460 270 490 310 Q 480 350 510 370 Q 540 350 530 300 Q 555 260 540 210 Q 555 170 520 150 Q 495 135 470 150 Z", // Africa
  "M 560 70 Q 600 50 660 65 Q 730 55 780 90 Q 830 85 820 130 Q 850 150 810 180 Q 780 175 740 190 Q 690 200 650 170 Q 600 160 580 120 Q 555 100 560 70 Z", // Asia
  "M 760 330 Q 740 310 770 295 Q 810 285 840 305 Q 860 330 835 355 Q 800 370 775 355 Q 755 350 760 330 Z", // Australia
];

export default function WorldMap({
  markers = [],
  arcs = [],
  className = "",
  showLandmasses = true,
}: {
  markers?: MapMarker[];
  arcs?: MapArc[];
  className?: string;
  showLandmasses?: boolean;
}) {
  const toneColor = (tone?: "purple" | "cyan") => (tone === "cyan" ? "#3ee6e0" : "#9b5cf0");

  return (
    <svg viewBox="0 0 1000 500" className={`h-full w-full ${className}`} role="img" aria-label="Global network map">
      <defs>
        <pattern id="mapDots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" className="map-dot" />
        </pattern>
        <radialGradient id="mapGlow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(155,92,240,0.16)" />
          <stop offset="100%" stopColor="rgba(155,92,240,0)" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="1000" height="500" fill="url(#mapGlow)" />

      {showLandmasses &&
        LANDMASSES.map((d, i) => (
          <g key={i}>
            <path d={d} fill="url(#mapDots)" opacity={0.9} />
            <path d={d} fill="none" stroke="rgba(155,92,240,0.25)" strokeWidth={1} />
          </g>
        ))}

      {arcs.map((arc, i) => {
        const a = markers[arc.from];
        const b = markers[arc.to];
        if (!a || !b) return null;
        const mx = (a.x + b.x) / 2;
        const my = Math.min(a.y, b.y) - 60;
        return (
          <path
            key={i}
            d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
            className="map-arc"
            stroke={toneColor(arc.tone)}
            strokeWidth={1.5}
            opacity={0.7}
          />
        );
      })}

      {markers.map((m, i) => (
        <g key={i}>
          <circle
            cx={m.x}
            cy={m.y}
            r={4}
            fill={toneColor(m.tone)}
            className={m.pulse ? "map-pin" : undefined}
            style={{ filter: `drop-shadow(0 0 6px ${toneColor(m.tone)})` }}
          />
          {m.label && (
            <text
              x={m.x + 9}
              y={m.y + 4}
              fontSize={13}
              fill="#f4f2f7"
              fontFamily="Inter, system-ui, sans-serif"
              opacity={0.85}
            >
              {m.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
