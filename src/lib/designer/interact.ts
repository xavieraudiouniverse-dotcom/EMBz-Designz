import type { DesignLayer } from "@/types/database";
import { getCachedImageSize } from "./render";

export type LayerBounds = { cx: number; cy: number; w: number; h: number; rotation: number };
export type PrintAreaPx = { x: number; y: number; width: number; height: number };

/** Pixel-space bounds for a layer, matching exactly how render.ts draws it. Returns null for
 *  all-over-print image layers (they aren't a single draggable box) or an image whose
 *  natural size isn't loaded/cached yet. */
export function getLayerBounds(layer: DesignLayer, area: PrintAreaPx): LayerBounds | null {
  if (layer.type === "image" && layer.aop) return null;

  const cx = area.x + (layer.x / 100) * area.width;
  const cy = area.y + (layer.y / 100) * area.height;

  if (layer.type === "image") {
    const size = getCachedImageSize(layer.url);
    if (!size) return null;
    const baseW = area.width * 0.6 * layer.scale;
    const ratio = size.width / size.height;
    return { cx, cy, w: baseW, h: baseW / ratio, rotation: layer.rotation };
  }

  // text — approximate box from font size and character count (matches render.ts's
  // `36 * scale` font size closely enough for a selection/handle overlay).
  const fontSize = 36 * layer.scale;
  const w = Math.max(40, layer.text.length * fontSize * 0.55);
  const h = fontSize * 1.3;
  return { cx, cy, w, h, rotation: layer.rotation };
}

function rotatePoint(px: number, py: number, cx: number, cy: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

/** Inverse of rotatePoint — maps a screen point into the layer's unrotated local space. */
function toLocal(px: number, py: number, b: LayerBounds) {
  const rad = (-b.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - b.cx;
  const dy = py - b.cy;
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export function isPointInLayer(px: number, py: number, b: LayerBounds) {
  const local = toLocal(px, py, b);
  return Math.abs(local.x) <= b.w / 2 && Math.abs(local.y) <= b.h / 2;
}

/** Screen-space position of the resize handle (bottom-right corner, rotated with the box). */
export function resizeHandlePos(b: LayerBounds) {
  return rotatePoint(b.cx + b.w / 2, b.cy + b.h / 2, b.cx, b.cy, b.rotation);
}

/** Screen-space position of the rotate handle (above top-center, rotated with the box). */
export function rotateHandlePos(b: LayerBounds) {
  return rotatePoint(b.cx, b.cy - b.h / 2 - 34, b.cx, b.cy, b.rotation);
}

export function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export function angleDeg(cx: number, cy: number, px: number, py: number) {
  return (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
