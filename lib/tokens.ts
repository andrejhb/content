/**
 * Single import point for design tokens in app code. Everything re-exports from
 * @hububb/design-system/tokens — we never define token values here.
 */
export {
  tokens,
  colorFamilies,
  typeRoles,
  spacingScale,
  elevationTokens,
  lightTheme,
  darkTheme,
  fluidClamp,
  getSemanticColor,
} from "@hububb/design-system/tokens";

export type {
  ColorFamily,
  ColorStep,
  SemanticToken,
  TypeRole,
  SpacingStep,
  ElevationToken,
} from "@hububb/design-system/tokens";
