// Beat doctrine for motion films, distilled from the motion-promo reference
// (docs/motion/reference/motion-promo/) minus its look. The validator in
// lib/creative-schema.ts enforces the numeric bounds; the rest is judgement
// the shot components and authoring docs encode:
//
// - One idea per beat, big and centred. Never a busy composite.
// - Cut hard by default. A transition is a choice, not a courtesy.
// - Snaps take 2-3 frames; interpolating a snap reads as a glitch.
// - Never put a long move on an accelerate-only curve; nothing happens and
//   then it lurches, which reads as dropped frames.
// - Emphasis breathes across a beat (see swell in helpers) instead of
//   sitting at a constant level.
// - Things persist: when one element becomes the next, keep the container
//   and change only its contents.

export const BEAT = {
  MIN_SEC: 1.5,
  MAX_SEC: 4,
  // A chat exchange needs room to type and land; a notification pile needs
  // room to arrive and clear.
  CHAT_MAX_SEC: 8,
  NOTIFY_MAX_SEC: 6,
  MAX_BEATS: 10,
  MIN_BEATS: 2,
  // Aim, not a hard rule: on-screen lines read best at five words or fewer.
  MAX_WORDS_ON_SCREEN: 5,
} as const;
