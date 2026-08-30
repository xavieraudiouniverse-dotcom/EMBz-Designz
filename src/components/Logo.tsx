import Link from "next/link";

/**
 * Placeholder wordmark. Swap for the real EMBZ DESIGNZ logo image:
 * drop the file at src/app/icon.png (favicon) and public/logo.png (header/footer),
 * then replace this component's contents with an <Image> tag.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/60 text-chrome-purple font-display text-lg animate-pulse-glow">
        E
      </span>
      <span className="font-display text-lg tracking-widest text-chrome-purple">
        EMBZ <span className="text-accent">DESIGNZ</span>
      </span>
    </Link>
  );
}
