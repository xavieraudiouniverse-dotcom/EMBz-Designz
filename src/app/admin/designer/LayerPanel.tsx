"use client";

import type { DesignLayer } from "@/types/database";

export default function LayerPanel({
  layers,
  activeId,
  onSelect,
  onUpdate,
  onRemove,
  onReorder,
}: {
  layers: DesignLayer[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<DesignLayer>) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
}) {
  const active = layers.find((l) => l.id === activeId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Layers</h3>
        {layers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No layers yet — add artwork or text below.</p>
        ) : (
          <div className="space-y-1">
            {layers.map((l, i) => (
              <div
                key={l.id}
                onClick={() => onSelect(l.id)}
                className={`flex cursor-pointer items-center justify-between rounded border px-2 py-1.5 text-xs ${
                  l.id === activeId ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                <span>
                  {l.type === "text" ? `“${l.text.slice(0, 16)}”` : "Artwork"} {l.type === "image" && l.aop ? "(all-over)" : ""}
                </span>
                <span className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(l.id, -1);
                    }}
                    disabled={i === 0}
                    className="disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(l.id, 1);
                    }}
                    disabled={i === layers.length - 1}
                    className="disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(l.id);
                    }}
                    className="text-destructive"
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Edit selected layer</h3>

          {active.type === "text" && (
            <>
              <input
                value={active.text}
                onChange={(e) => onUpdate(active.id, { text: e.target.value } as Partial<DesignLayer>)}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Color</label>
                <input
                  type="color"
                  value={active.color}
                  onChange={(e) => onUpdate(active.id, { color: e.target.value } as Partial<DesignLayer>)}
                  className="h-8 w-14 rounded border border-border bg-background"
                />
              </div>
            </>
          )}

          {active.type === "image" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={active.aop}
                onChange={(e) => onUpdate(active.id, { aop: e.target.checked } as Partial<DesignLayer>)}
              />
              All-over print (tile across the whole garment)
            </label>
          )}

          {!(active.type === "image" && active.aop) && (
            <>
              <div>
                <label className="text-xs text-muted-foreground">Horizontal position</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={active.x}
                  onChange={(e) => onUpdate(active.id, { x: Number(e.target.value) } as Partial<DesignLayer>)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Vertical position</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={active.y}
                  onChange={(e) => onUpdate(active.id, { y: Number(e.target.value) } as Partial<DesignLayer>)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Rotation</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={active.rotation}
                  onChange={(e) => onUpdate(active.id, { rotation: Number(e.target.value) } as Partial<DesignLayer>)}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-muted-foreground">Size</label>
            <input
              type="range"
              min={20}
              max={200}
              value={Math.round(active.scale * 100)}
              onChange={(e) => onUpdate(active.id, { scale: Number(e.target.value) / 100 } as Partial<DesignLayer>)}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
