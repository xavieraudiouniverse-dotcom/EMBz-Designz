"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { renderDesign, emptySide, newId, CANVAS_SIZE, printAreaToPx } from "@/lib/designer/render";
import {
  getLayerBounds,
  isPointInLayer,
  resizeHandlePos,
  rotateHandlePos,
  distance,
  angleDeg,
  clamp,
  type LayerBounds,
} from "@/lib/designer/interact";
import type { Category, DesignData, DesignLayer, ProductTemplate, SideDesign } from "@/types/database";
import TemplateManager from "./TemplateManager";
import LayerPanel from "./LayerPanel";

const DEFAULT_PRINT_AREA = { x: 25, y: 20, width: 50, height: 45 };

type DragState = {
  mode: "move" | "resize" | "rotate";
  layerId: string;
  startPointerX: number;
  startPointerY: number;
  startLayer: { x: number; y: number; scale: number; rotation: number };
  bounds: LayerBounds;
};

function drawSelectionOverlay(ctx: CanvasRenderingContext2D, b: LayerBounds) {
  ctx.save();
  ctx.translate(b.cx, b.cy);
  ctx.rotate((b.rotation * Math.PI) / 180);

  ctx.strokeStyle = "#9b5cf0";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);

  // rotate handle stalk + knob
  ctx.beginPath();
  ctx.moveTo(0, -b.h / 2);
  ctx.lineTo(0, -b.h / 2 - 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "#0aa39c";
  ctx.arc(0, -b.h / 2 - 34, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0c0a10";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // resize handle knob (bottom-right)
  ctx.beginPath();
  ctx.fillStyle = "#9b5cf0";
  ctx.arc(b.w / 2, b.h / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0c0a10";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

type Side = "front" | "back";

export default function DesignerStudio() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [side, setSide] = useState<Side>("front");
  const [design, setDesign] = useState<DesignData>({ front: null, back: null });
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  const [meta, setMeta] = useState({
    name: "",
    price: "",
    stock: "10",
    description: "",
    category_id: "",
    is_active: true,
    is_featured: false,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadReference = useCallback(async () => {
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("product_templates").select("*").order("created_at", { ascending: true }),
      supabase.from("categories").select("*").order("name", { ascending: true }),
    ]);
    setTemplates((t as ProductTemplate[]) ?? []);
    setCategories((c as Category[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    loadReference();
  }, [loadReference]);

  // Load an existing product's design when editing.
  useEffect(() => {
    if (!productId) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setMeta({
          name: data.name,
          price: String(data.price),
          stock: String(data.stock),
          description: data.description ?? "",
          category_id: data.category_id ?? "",
          is_active: data.is_active,
          is_featured: data.is_featured,
        });
        if (data.design_data) setDesign(data.design_data as DesignData);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const currentSide = design[side];
  const template = templates.find((t) => t.id === currentSide?.templateId) ?? null;
  const printArea = template?.print_area ?? DEFAULT_PRINT_AREA;

  const dragRef = useRef<DragState | null>(null);

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    await renderDesign(ctx, {
      blankImageUrl: template?.blank_image_url ?? null,
      garmentColor: currentSide?.garmentColor ?? "#ffffff",
      printArea,
      layers: currentSide?.layers ?? [],
      guides: true,
    });

    // Selection overlay for the active layer (editor-only chrome — never exported).
    const activeLayer = currentSide?.layers.find((l) => l.id === activeLayerId);
    if (activeLayer) {
      const area = printAreaToPx(printArea, CANVAS_SIZE);
      const b = getLayerBounds(activeLayer, area);
      if (b) drawSelectionOverlay(ctx, b);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, currentSide, activeLayerId]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function updateSide(patch: Partial<SideDesign>) {
    setDesign((d) => ({ ...d, [side]: { ...(d[side] ?? emptySide("")), ...patch } }));
  }

  function selectTemplate(templateId: string) {
    setDesign((d) => ({
      ...d,
      [side]: d[side] ? { ...d[side]!, templateId } : emptySide(templateId),
    }));
  }

  function updateLayer(id: string, patch: Partial<DesignLayer>) {
    if (!currentSide) return;
    updateSide({
      layers: currentSide.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)),
    });
  }

  function removeLayer(id: string) {
    if (!currentSide) return;
    updateSide({ layers: currentSide.layers.filter((l) => l.id !== id) });
    if (activeLayerId === id) setActiveLayerId(null);
  }

  function reorderLayer(id: string, dir: -1 | 1) {
    if (!currentSide) return;
    const layers = [...currentSide.layers];
    const i = layers.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= layers.length) return;
    [layers[i], layers[j]] = [layers[j], layers[i]];
    updateSide({ layers });
  }

  function addTextLayer() {
    if (!currentSide) return;
    const layer: DesignLayer = {
      id: newId(),
      type: "text",
      text: "YOUR TEXT",
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      color: "#ffffff",
      fontFamily: "Anton, sans-serif",
    };
    updateSide({ layers: [...currentSide.layers, layer] });
    setActiveLayerId(layer.id);
  }

  async function addImageLayer(file: File) {
    if (!currentSide) {
      setStatus("Pick a blank garment template first.");
      return;
    }
    setUploading(true);
    setStatus(null);
    try {
      const path = `artwork/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("designs").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("designs").getPublicUrl(path);

      const layer: DesignLayer = {
        id: newId(),
        type: "image",
        url: pub.publicUrl,
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0,
        aop: false,
      };
      updateSide({ layers: [...currentSide.layers, layer] });
      setActiveLayerId(layer.id);
    } catch (err: any) {
      setStatus(err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function exportSideMockup(s: Side): Promise<string | null> {
    const sd = design[s];
    if (!sd) return null;
    const template = templates.find((t) => t.id === sd.templateId) ?? null;
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    const ctx = offscreen.getContext("2d")!;
    await renderDesign(ctx, {
      blankImageUrl: template?.blank_image_url ?? null,
      garmentColor: sd.garmentColor,
      printArea: template?.print_area ?? { x: 25, y: 20, width: 50, height: 45 },
      layers: sd.layers,
      guides: false,
    });

    const blob: Blob | null = await new Promise((resolve) => offscreen.toBlob(resolve, "image/png"));
    if (!blob) return null;

    const path = `mockups/${Date.now()}-${s}.png`;
    const { error } = await supabase.storage.from("designs").upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) throw error;
    const { data: pub } = supabase.storage.from("designs").getPublicUrl(path);
    return pub.publicUrl;
  }

  async function handleDownload() {
    const url = await exportSideMockup(side).catch((err) => {
      setStatus(err?.message ?? "Export failed.");
      return null;
    });
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.name || "design"}-${side}.png`;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  }

  async function handleSave() {
    if (!meta.name || !meta.price) {
      setStatus("Name and price are required.");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const frontUrl = design.front ? await exportSideMockup("front") : null;
      const backUrl = design.back ? await exportSideMockup("back") : null;

      const slug = meta.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const payload = {
        name: meta.name,
        slug,
        description: meta.description || null,
        price: Number(meta.price),
        stock: Number(meta.stock) || 0,
        image_url: frontUrl ?? backUrl,
        category_id: meta.category_id || null,
        is_active: meta.is_active,
        is_featured: meta.is_featured,
        design_data: {
          front: design.front,
          back: design.back,
          ...(backUrl ? { back_image_url: backUrl } : {}),
        },
      };

      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select().maybeSingle();
        if (error) throw error;
        if (data) router.replace(`/admin/designer?product=${data.id}`);
      }

      setStatus("Saved ✓ — visible in Products and live in the shop.");
    } catch (err: any) {
      setStatus(err?.message ?? "Could not save this product.");
    } finally {
      setSaving(false);
    }
  }

  const activeLayer = currentSide?.layers.find((l) => l.id === activeLayerId) ?? null;

  function canvasPointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!currentSide) return;
    const pt = canvasPointFromEvent(e);
    const area = printAreaToPx(printArea, CANVAS_SIZE);
    const hitRadius = 22;

    if (activeLayer) {
      const b = getLayerBounds(activeLayer, area);
      if (b) {
        const rp = resizeHandlePos(b);
        if (distance(pt.x, pt.y, rp.x, rp.y) <= hitRadius) {
          dragRef.current = {
            mode: "resize",
            layerId: activeLayer.id,
            startPointerX: pt.x,
            startPointerY: pt.y,
            startLayer: { x: activeLayer.x, y: activeLayer.y, scale: activeLayer.scale, rotation: activeLayer.rotation },
            bounds: b,
          };
          canvasRef.current?.setPointerCapture(e.pointerId);
          return;
        }
        const rotp = rotateHandlePos(b);
        if (distance(pt.x, pt.y, rotp.x, rotp.y) <= hitRadius) {
          dragRef.current = {
            mode: "rotate",
            layerId: activeLayer.id,
            startPointerX: pt.x,
            startPointerY: pt.y,
            startLayer: { x: activeLayer.x, y: activeLayer.y, scale: activeLayer.scale, rotation: activeLayer.rotation },
            bounds: b,
          };
          canvasRef.current?.setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    for (let i = currentSide.layers.length - 1; i >= 0; i--) {
      const layer = currentSide.layers[i];
      const b = getLayerBounds(layer, area);
      if (b && isPointInLayer(pt.x, pt.y, b)) {
        setActiveLayerId(layer.id);
        dragRef.current = {
          mode: "move",
          layerId: layer.id,
          startPointerX: pt.x,
          startPointerY: pt.y,
          startLayer: { x: layer.x, y: layer.y, scale: layer.scale, rotation: layer.rotation },
          bounds: b,
        };
        canvasRef.current?.setPointerCapture(e.pointerId);
        return;
      }
    }

    setActiveLayerId(null);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const pt = canvasPointFromEvent(e);
    const area = printAreaToPx(printArea, CANVAS_SIZE);

    if (drag.mode === "move") {
      const dxPct = ((pt.x - drag.startPointerX) / area.width) * 100;
      const dyPct = ((pt.y - drag.startPointerY) / area.height) * 100;
      updateLayer(drag.layerId, {
        x: clamp(drag.startLayer.x + dxPct, 0, 100),
        y: clamp(drag.startLayer.y + dyPct, 0, 100),
      } as Partial<DesignLayer>);
    } else if (drag.mode === "resize") {
      const startDist = distance(drag.bounds.cx, drag.bounds.cy, drag.startPointerX, drag.startPointerY);
      const newDist = distance(drag.bounds.cx, drag.bounds.cy, pt.x, pt.y);
      const factor = startDist > 4 ? newDist / startDist : 1;
      updateLayer(drag.layerId, { scale: clamp(drag.startLayer.scale * factor, 0.15, 4) } as Partial<DesignLayer>);
    } else if (drag.mode === "rotate") {
      const startAngle = angleDeg(drag.bounds.cx, drag.bounds.cy, drag.startPointerX, drag.startPointerY);
      const newAngle = angleDeg(drag.bounds.cx, drag.bounds.cy, pt.x, pt.y);
      updateLayer(drag.layerId, { rotation: Math.round(drag.startLayer.rotation + (newAngle - startAngle)) } as Partial<DesignLayer>);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    dragRef.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <TemplateManager templates={templates} onChange={loadReference} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex overflow-hidden rounded-full border border-border text-xs">
              {(["front", "back"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`px-4 py-1.5 capitalize ${side === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={handleDownload} className="text-xs text-accent hover:underline">
              Download this side as PNG
            </button>
          </div>

          <div className="panel-metal edge-glow flex items-center justify-center rounded-xl p-4">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="max-h-[560px] w-full touch-none rounded-lg"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Click a layer to select it — drag to move, the bottom-right knob to resize, the top knob to rotate.
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <select
              value={currentSide?.templateId ?? ""}
              onChange={(e) => selectTemplate(e.target.value)}
              className="rounded border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">Choose a blank garment…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2 text-sm">
              Color
              <input
                type="color"
                value={currentSide?.garmentColor ?? "#ffffff"}
                onChange={(e) => updateSide({ garmentColor: e.target.value })}
                className="h-6 w-10 rounded border border-border bg-background"
                disabled={!currentSide}
              />
            </label>

            <label className="flex items-center justify-center rounded-full border border-border bg-card px-3 py-2 text-center text-sm text-muted-foreground hover:border-primary">
              {uploading ? "Uploading…" : "+ Add artwork"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!currentSide || uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addImageLayer(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <button
            onClick={addTextLayer}
            disabled={!currentSide}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary disabled:opacity-40"
          >
            + Add text
          </button>
        </div>

        <div className="panel-metal space-y-6 rounded-xl p-5">
          <LayerPanel
            layers={currentSide?.layers ?? []}
            activeId={activeLayerId}
            onSelect={setActiveLayerId}
            onUpdate={updateLayer}
            onRemove={removeLayer}
            onReorder={reorderLayer}
          />

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Product details</h3>
            <input
              placeholder="Product name"
              value={meta.name}
              onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Price (AUD)"
                value={meta.price}
                onChange={(e) => setMeta((m) => ({ ...m, price: e.target.value }))}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Stock"
                value={meta.stock}
                onChange={(e) => setMeta((m) => ({ ...m, stock: e.target.value }))}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <select
              value={meta.category_id}
              onChange={(e) => setMeta((m) => ({ ...m, category_id: e.target.value }))}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={meta.is_active} onChange={(e) => setMeta((m) => ({ ...m, is_active: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={meta.is_featured} onChange={(e) => setMeta((m) => ({ ...m, is_featured: e.target.checked }))} />
                Featured
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="sweep glow-hover w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving…" : productId ? "Save changes" : "Save as product"}
            </button>
            {status && <p className="text-xs text-muted-foreground">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
