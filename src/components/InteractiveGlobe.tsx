"use client";

/**
 * A real, draggable/pinch-zoomable 3D-projected globe rendered on a single
 * <canvas> — no three.js, no map tiles, no extra dependency. Country
 * outlines come from a bundled GeoJSON file (public/data/countries.geojson)
 * and are projected with a small orthographic-projection helper below.
 * Points/routes are passed in as real latitude/longitude — see
 * `src/lib/geo.ts` for the city/country lookup used across the site.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, WheelEvent, MouseEvent } from "react";

export type GlobePoint = { lat: number; lon: number; label: string; tone?: "purple" | "cyan" };
export type GlobeRoute = { from: GlobePoint; to: GlobePoint; tone?: "purple" | "cyan" };

type Country = {
  type: "Feature";
  properties: { name?: string; ADMIN?: string; NAME?: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: any };
};

const WORLD_URL = "/data/countries.geojson";
const TONE_HEX = { purple: "#c14bff", cyan: "#3ee6e0" } as const;

const rad = (n: number) => (n * Math.PI) / 180;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function project(lat: number, lon: number, rotation: number, tilt: number, scale: number, w: number, h: number) {
  const p = rad(lat),
    l = rad(lon + rotation),
    t = rad(tilt);
  const x = Math.cos(p) * Math.sin(l);
  const y = Math.sin(p) * Math.cos(t) - Math.cos(p) * Math.cos(l) * Math.sin(t);
  const z = Math.sin(p) * Math.sin(t) + Math.cos(p) * Math.cos(l) * Math.cos(t);
  return { x: w / 2 + x * scale, y: h / 2 - y * scale, z };
}

function drawPolygon(ctx: CanvasRenderingContext2D, coords: any, rotation: number, tilt: number, scale: number, w: number, h: number) {
  for (const ring of coords) {
    let drawing = false;
    for (let i = 0; i < ring.length; i++) {
      const [lon, lat] = ring[i];
      const p = project(lat, lon, rotation, tilt, scale, w, h);
      if (p.z > 0) {
        if (!drawing) {
          ctx.moveTo(p.x, p.y);
          drawing = true;
        } else ctx.lineTo(p.x, p.y);
      } else drawing = false;
    }
  }
}

export default function InteractiveGlobe({
  points = [],
  routes = [],
  small = false,
  className = "",
}: {
  points?: GlobePoint[];
  routes?: GlobeRoute[];
  small?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const view = useRef({ rotation: 0, tilt: 8, zoom: 1, drag: false, x: 0, y: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    fetch(WORLD_URL)
      .then((r) => {
        if (!r.ok) throw new Error("world data unavailable");
        return r.json();
      })
      .then((d) => setCountries(d.features || []))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const r = canvas.getBoundingClientRect(),
        d = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * d);
      canvas.height = Math.round(r.height * d);
      const c = canvas.getContext("2d");
      if (c) c.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    let raf = 0;
    const draw = (now: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const r = c.getBoundingClientRect(),
        w = r.width,
        h = r.height;
      ctx.clearRect(0, 0, w, h);
      const v = view.current;
      const scale = Math.min(w, h) * 0.38 * v.zoom;
      const gx = w / 2,
        gy = h / 2;

      const grad = ctx.createRadialGradient(gx - scale * 0.18, gy - scale * 0.22, scale * 0.05, gx, gy, scale * 1.05);
      grad.addColorStop(0, "#3d1a63");
      grad.addColorStop(0.45, "#140a22");
      grad.addColorStop(1, "#0c0a10");
      ctx.beginPath();
      ctx.arc(gx, gy, scale, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(155,92,240,.55)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(gx, gy, scale, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = "rgba(155,92,240,.34)";
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      for (const f of countries) {
        const g = f.geometry;
        if (g.type === "Polygon") drawPolygon(ctx, g.coordinates, v.rotation, v.tilt, scale, w, h);
        else for (const poly of g.coordinates) drawPolygon(ctx, poly, v.rotation, v.tilt, scale, w, h);
      }
      ctx.stroke();
      ctx.restore();

      const drawPoint = (p: GlobePoint) => {
        const q = project(p.lat, p.lon, v.rotation, v.tilt, scale, w, h);
        if (q.z <= 0) return q;
        const hex = TONE_HEX[p.tone ?? "cyan"];
        ctx.beginPath();
        ctx.arc(q.x, q.y, small ? 2.8 : 4, 0, Math.PI * 2);
        ctx.fillStyle = "#f4f2f7";
        ctx.shadowBlur = 14;
        ctx.shadowColor = hex;
        ctx.fill();
        ctx.shadowBlur = 0;
        return q;
      };

      ctx.lineWidth = 1.2;
      for (const route of routes) {
        const hex = TONE_HEX[route.tone ?? "purple"];
        ctx.strokeStyle = hex + "b3";
        const a = drawPoint(route.from),
          b = drawPoint(route.to);
        if (a && b && a.z > 0 && b.z > 0) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          const mx = (a.x + b.x) / 2,
            my = (a.y + b.y) / 2 - Math.min(scale * 0.32, 90);
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.stroke();
          const phase = (now / 2600) % 1;
          const px = a.x + (b.x - a.x) * phase,
            py = a.y + (b.y - a.y) * phase;
          ctx.beginPath();
          ctx.arc(px, py, small ? 2 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 12;
          ctx.shadowColor = hex;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      for (const p of points) drawPoint(p);

      if (selected) {
        const p = points.find((x) => x.label === selected);
        if (p) {
          const q = project(p.lat, p.lon, v.rotation, v.tilt, scale, w, h);
          if (q.z > 0) {
            ctx.beginPath();
            ctx.arc(q.x, q.y, 10, 0, Math.PI * 2);
            ctx.strokeStyle = "#fff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#9b5cf0";
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [countries, points, routes, small, selected]);

  const pointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      const v = view.current;
      v.drag = true;
      v.lastX = e.clientX;
      v.lastY = e.clientY;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else if (pointers.current.size === 2) {
      const ps = [...pointers.current.values()];
      pinch.current = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      view.current.drag = false;
    }
  };
  const pointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const v = view.current;
    if (pointers.current.size === 2) {
      const ps = [...pointers.current.values()];
      const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      if (pinch.current) v.zoom = clamp(v.zoom * (dist / pinch.current), 0.72, 1.8);
      pinch.current = dist;
      return;
    }
    if (!v.drag) return;
    v.rotation += (e.clientX - v.lastX) * 0.35;
    v.tilt = clamp(v.tilt + (e.clientY - v.lastY) * 0.18, -75, 75);
    v.lastX = e.clientX;
    v.lastY = e.clientY;
  };
  const pointerUp = (e?: PointerEvent<HTMLCanvasElement>) => {
    if (e) pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    view.current.drag = false;
  };
  const wheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    view.current.zoom = clamp(view.current.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.72, 1.8);
  };
  const click = (e: MouseEvent<HTMLCanvasElement>) => {
    if (view.current.drag) return;
    const r = canvasRef.current!.getBoundingClientRect(),
      v = view.current,
      scale = Math.min(r.width, r.height) * 0.38 * v.zoom,
      mx = e.clientX - r.left,
      my = e.clientY - r.top;
    let best: GlobePoint | undefined,
      bestD = 16;
    for (const p of points) {
      const q = project(p.lat, p.lon, v.rotation, v.tilt, scale, r.width, r.height);
      const d = Math.hypot(q.x - mx, q.y - my);
      if (q.z > 0 && d < bestD) {
        best = p;
        bestD = d;
      }
    }
    if (best) {
      setSelected(best.label);
      setSelectedCountry("");
      return;
    }
    let countryBest = "",
      countryD = 35;
    for (const f of countries) {
      let lon = 0,
        lat = 0,
        n = 0;
      const walk = (coords: any) => {
        if (typeof coords[0] === "number") {
          lon += coords[0];
          lat += coords[1];
          n++;
          return;
        }
        for (const c of coords) walk(c);
      };
      walk(f.geometry.coordinates);
      if (!n) continue;
      const q = project(lat / n, lon / n, v.rotation, v.tilt, scale, r.width, r.height),
        d = Math.hypot(q.x - mx, q.y - my);
      if (q.z > 0 && d < countryD) {
        countryD = d;
        countryBest = f.properties?.name || f.properties?.ADMIN || f.properties?.NAME || "Country";
      }
    }
    if (countryBest) {
      setSelectedCountry(countryBest);
      setSelected("");
    }
  };

  return (
    <div className={`real-globe ${small ? "small" : ""} ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onWheel={wheel}
        onClick={click}
        aria-label="Interactive geographic globe"
      />
      <div className="globe-ui">
        <span>Real geography</span>
        <span>Drag · scroll to zoom · tap a node</span>
        {selected && <b>{selected}</b>}
        {selectedCountry && <b>{selectedCountry}</b>}
      </div>
    </div>
  );
}
