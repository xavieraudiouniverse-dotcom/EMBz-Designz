export default function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "critical";
}) {
  const toneClass = tone === "critical" ? "text-destructive" : tone === "warning" ? "text-yellow-400" : "text-accent";
  return (
    <div className="panel-metal rounded-xl p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
