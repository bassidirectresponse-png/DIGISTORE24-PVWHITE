// Re-export the template dispatcher and types from page-templates.
// Kept as lib/html-template.ts for backwards compat with existing imports.
export {
  renderHtml,
  pickVariantForProject,
  VARIANT_IDS,
  VARIANT_LABELS,
} from "./page-templates";
export type { RenderArgs as RenderHtmlArgs, RenderMode, VariantId } from "./page-templates";
