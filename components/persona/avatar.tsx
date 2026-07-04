// Persona avatar: a real photo when profile.avatar is set, otherwise a
// deterministic initials monogram so every persona has a stable face with zero
// external fetch. The repo serves imagery through plain <img> (see
// components/brand-kit/assets.tsx), not next/image.

// Fixed palette keyed off a name hash — stable color per persona across renders.
const PALETTE = [
  "#2563eb", // blue
  "#7c3aed", // violet
  "#0d9488", // teal
  "#db2777", // pink
  "#ea580c", // orange
  "#65a30d", // lime
  "#0891b2", // cyan
  "#dc2626", // red
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PersonaAvatar({
  name,
  src,
  size = 40,
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const dim = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={dim}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const color = PALETTE[hash(name) % PALETTE.length];
  return (
    <span
      style={{ ...dim, backgroundColor: color, fontSize: Math.round(size * 0.4) }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white select-none ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
