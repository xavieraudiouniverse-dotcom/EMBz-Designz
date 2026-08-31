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
  return (
    <div className={`metric ${tone !== "default" ? `metric-tone-${tone}` : ""}`}>
      <small>{label.toUpperCase()}</small>
      <b>{value}</b>
      {hint && <em style={{ color: "#8e829a" }}>{hint}</em>}
    </div>
  );
}
