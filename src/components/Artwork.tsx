// Holographic placeholder artwork — a glowing violet orb with rings and a
// skewed chrome wordmark, used wherever a piece doesn't have a real product
// photo yet (mirrors the "art-orb" treatment from the reference build).
export default function Artwork({
  mark = "EMBZ",
  className = "",
}: {
  mark?: string;
  className?: string;
}) {
  return (
    <div className={`relative min-h-[320px] overflow-hidden ${className}`}>
      <div className="art">
        <div className="art-orb" />
        <div className="art-ring a" />
        <div className="art-ring b" />
        <div className="art-mark">{mark}</div>
        <i className="spark s1" />
        <i className="spark s2" />
        <i className="spark s3" />
      </div>
    </div>
  );
}
