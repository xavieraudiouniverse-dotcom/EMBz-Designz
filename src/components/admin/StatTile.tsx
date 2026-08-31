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
  const toneColor = tone === "critical" ? "#ff6b9c" : tone === "warning" ? "#f2bd5b" : "#5feab1";
  return (
    <div className="cc-card kpi">
      <small>{label.toUpperCase()}</small>
      <strong>{value}</strong>
      {hint && <em style={{ color: toneColor }}>{hint}</em>}
    </div>
  );
}
