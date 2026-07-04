export type FormatKey = "1x1" | "4x5" | "9x16" | "16x9";

export type Format = { key: FormatKey; label: string; w: number; h: number };

// The four delivery formats at exact pixel sizes.
export const FORMATS: Format[] = [
  { key: "1x1", label: "1:1", w: 1080, h: 1080 },
  { key: "4x5", label: "4:5", w: 1080, h: 1350 },
  { key: "9x16", label: "9:16", w: 1080, h: 1920 },
  { key: "16x9", label: "16:9", w: 1200, h: 675 },
];

export const FORMAT_MAP: Record<string, Format> = Object.fromEntries(
  FORMATS.map((f) => [f.key, f]),
);

// Video delivery formats. Same keys, video-native pixel sizes (16:9 is full
// 1080p for video, while the image format stays 1200×675).
export const VIDEO_FORMATS: Format[] = [
  { key: "1x1", label: "1:1", w: 1080, h: 1080 },
  { key: "4x5", label: "4:5", w: 1080, h: 1350 },
  { key: "9x16", label: "9:16", w: 1080, h: 1920 },
  { key: "16x9", label: "16:9", w: 1920, h: 1080 },
];

export const VIDEO_FORMAT_MAP: Record<string, Format> = Object.fromEntries(
  VIDEO_FORMATS.map((f) => [f.key, f]),
);
