/**
 * Shared line-icon set. Stroke-based, 20px grid, one consistent style —
 * used everywhere a "feature" or nav icon is needed instead of emoji, so
 * icons scale, recolor with currentColor, and never render inconsistently
 * across platforms the way emoji glyphs do.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, className, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="8" />
      <path d="M2 10h16" />
      <path d="M10 2c2.5 2.2 4 5 4 8s-1.5 5.8-4 8c-2.5-2.2-4-5-4-8s1.5-5.8 4-8Z" />
    </Base>
  );
}

export function RadarIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.4 12a5 5 0 0 1 7.2 0" />
      <path d="M4 9.2a9 9 0 0 1 12 0" />
      <circle cx="10" cy="14.3" r="1.3" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.6" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </Base>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 17s-6.5-4-6.5-8.5A3.75 3.75 0 0 1 10 6a3.75 3.75 0 0 1 6.5 2.5C16.5 13 10 17 10 17Z" />
    </Base>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 6.5 10 3l7 3.5-7 3.5-7-3.5Z" />
      <path d="M3 6.5V14l7 3.5 7-3.5V6.5" />
      <path d="M10 10v7.5" />
    </Base>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 2.5 16 5v4.5c0 4.2-2.6 7.4-6 8.5-3.4-1.1-6-4.3-6-8.5V5l6-2.5Z" />
      <path d="M7.3 9.7l2 2 3.4-3.8" />
    </Base>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M12.8 7.2 11 11l-3.8 1.8L9 9l3.8-1.8Z" />
    </Base>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4l3 2" />
    </Base>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="7.5" cy="7.5" r="2.5" />
      <path d="M2.5 17c0-3 2.2-5 5-5s5 2 5 5" />
      <circle cx="14.5" cy="8.5" r="2.2" />
      <path d="M13 12c2.2 0 4.5 1.6 4.5 5" />
    </Base>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 2.5c.6 3 2 5 5.5 5.5-3.5.5-4.9 2.5-5.5 5.5-.6-3-2-5-5.5-5.5C8 7.5 9.4 5.5 10 2.5Z" />
    </Base>
  );
}

export function SproutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 17.5V11" />
      <path d="M10 11C10 7.5 7 6 4 6c0 3.5 2.5 5.5 6 5Z" />
      <path d="M10 9.5c0-3 2.5-4.5 5.5-4.5 0 3-2.2 4.8-5.5 4.5Z" />
    </Base>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1.2" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" />
    </Base>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10.5 3H4v6.5L13.5 19l6-6L10.5 3Z" />
      <circle cx="7.3" cy="6.3" r="1.1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="4" width="14" height="12" rx="1.6" />
      <circle cx="7.3" cy="8.3" r="1.3" />
      <path d="M4 15l4.5-4.5L11 13l2.5-2.5L17 14" />
    </Base>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 16l.7-3.5L13 4.2a1.6 1.6 0 0 1 2.3 0l.5.5a1.6 1.6 0 0 1 0 2.3L7.5 15.3 4 16Z" />
      <path d="M11.3 5.9l2.8 2.8" />
    </Base>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 14l4.5-4.5L10.5 12.5 17 6" />
      <path d="M12.5 6H17v4.5" />
    </Base>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2.5" y="6.5" width="9" height="7" rx="1" />
      <path d="M11.5 9h3l3 3v1.5h-6V9Z" />
      <circle cx="6" cy="15.5" r="1.6" />
      <circle cx="14.5" cy="15.5" r="1.6" />
    </Base>
  );
}

export function DollarIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 2.5v15" />
      <path d="M13.5 5.5c0-1.4-1.6-2-3.5-2s-3.5.8-3.5 2.2c0 3 7 1.6 7 4.8 0 1.4-1.6 2.2-3.5 2.2s-3.5-.7-3.5-2.1" />
    </Base>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 3v2M10 15v2M17 10h-2M5 10H3M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4M14.8 14.8l-1.4-1.4M6.6 6.6 5.2 5.2" />
    </Base>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 10a6 6 0 0 1 10.2-4.2L16 7.5" />
      <path d="M16 3.5V7.5H12" />
      <path d="M16 10a6 6 0 0 1-10.2 4.2L4 12.5" />
      <path d="M4 16.5V12.5H8" />
    </Base>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.6" />
      <path d="M3 5.5l7 5.5 7-5.5" />
    </Base>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8 3.5H4.5v13H8" />
      <path d="M12 6.5l4 3.5-4 3.5" />
      <path d="M16 10H8" />
    </Base>
  );
}
