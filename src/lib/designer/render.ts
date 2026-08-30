import type { DesignLayer, SideDesign } from "@/types/database";

export const CANVAS_SIZE = 800;

const imageCache = new Map<string, HTMLImageElement>();

export function getCachedImageSize(url: string): { width: number; height: number } | null {
  const img = imageCache.get(url);
  if (!img || !img.complete) return null;
  return { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url);
  if (cached && cached.complete) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Could not load image: ${url}`));
    img.src = url;
  });
}

type PrintArea = { x: number; y: number; width: number; height: number };

export function printAreaToPx(printArea: PrintArea, size: number) {
  return {
    x: (printArea.x / 100) * size,
    y: (printArea.y / 100) * size,
    width: (printArea.width / 100) * size,
    height: (printArea.height / 100) * size,
  };
}

/** Renders a garment + its layers onto a canvas. `guides`: draw the print-area outline (for editing, not export). */
export async function renderDesign(
  ctx: CanvasRenderingContext2D,
  opts: {
    blankImageUrl: string | null;
    garmentColor: string;
    printArea: PrintArea;
    layers: DesignLayer[];
    guides?: boolean;
  },
): Promise<void> {
  const size = CANVAS_SIZE;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#0c0a10";
  ctx.fillRect(0, 0, size, size);

  if (opts.blankImageUrl) {
    try {
      const blank = await loadImage(opts.blankImageUrl);
      const scale = Math.min(size / blank.width, size / blank.height);
      const w = blank.width * scale;
      const h = blank.height * scale;
      const dx = (size - w) / 2;
      const dy = (size - h) / 2;

      if (opts.garmentColor && opts.garmentColor.toLowerCase() !== "#ffffff") {
        // Tint on an offscreen canvas sized exactly to the garment image, so the
        // multiply/mask operations never touch anything outside its own bounds
        // (works best on light/white product photos).
        const off = document.createElement("canvas");
        off.width = Math.max(1, Math.round(w));
        off.height = Math.max(1, Math.round(h));
        const offCtx = off.getContext("2d")!;
        offCtx.drawImage(blank, 0, 0, off.width, off.height);
        offCtx.globalCompositeOperation = "multiply";
        offCtx.fillStyle = opts.garmentColor;
        offCtx.fillRect(0, 0, off.width, off.height);
        offCtx.globalCompositeOperation = "destination-in";
        offCtx.drawImage(blank, 0, 0, off.width, off.height);
        ctx.drawImage(off, dx, dy, w, h);
      } else {
        ctx.drawImage(blank, dx, dy, w, h);
      }
    } catch {
      ctx.fillStyle = "#1e1a26";
      ctx.fillRect(0, 0, size, size);
    }
  } else {
    ctx.fillStyle = "#1e1a26";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#7a7189";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Upload a blank garment photo in Templates", size / 2, size / 2);
  }

  const area = printAreaToPx(opts.printArea, size);

  for (const layer of opts.layers) {
    await renderLayer(ctx, layer, area, size);
  }

  if (opts.guides) {
    ctx.save();
    ctx.strokeStyle = "#3ee6e0";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.restore();
  }
}

async function renderLayer(ctx: CanvasRenderingContext2D, layer: DesignLayer, area: { x: number; y: number; width: number; height: number }, size: number) {
  if (layer.type === "image") {
    let img: HTMLImageElement;
    try {
      img = await loadImage(layer.url);
    } catch {
      return;
    }

    if (layer.aop) {
      // All-over print: tile the artwork across the full canvas.
      const tileSize = 120 * layer.scale;
      ctx.save();
      const ratio = img.width / img.height;
      const tileW = tileSize;
      const tileH = tileSize / ratio;
      for (let y = -tileH; y < size + tileH; y += tileH) {
        for (let x = -tileW; x < size + tileW; x += tileW) {
          ctx.drawImage(img, x, y, tileW, tileH);
        }
      }
      ctx.restore();
      return;
    }

    const cx = area.x + (layer.x / 100) * area.width;
    const cy = area.y + (layer.y / 100) * area.height;
    const baseW = area.width * 0.6 * layer.scale;
    const ratio = img.width / img.height;
    const w = baseW;
    const h = baseW / ratio;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }

  // text layer
  const cx = area.x + (layer.x / 100) * area.width;
  const cy = area.y + (layer.y / 100) * area.height;
  const fontSize = 36 * layer.scale;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.font = `bold ${fontSize}px ${layer.fontFamily || "sans-serif"}`;
  ctx.fillStyle = layer.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(layer.text, 0, 0);
  ctx.restore();
}

export function emptySide(templateId: string): SideDesign {
  return { templateId, garmentColor: "#ffffff", layers: [] };
}

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}
