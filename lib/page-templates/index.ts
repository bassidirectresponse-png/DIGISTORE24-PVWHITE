import type { Project } from "@prisma/client";
import type { RenderArgs, VariantId } from "./types";
import { VARIANT_IDS } from "./types";
import { hashPick } from "./shared";
import { renderEditorial } from "./editorial";
import { renderSwiss } from "./swiss";
import { renderDark } from "./dark";
import { renderOrganic } from "./organic";

export { VARIANT_IDS, VARIANT_LABELS, type VariantId, type RenderArgs, type RenderMode } from "./types";

// Niche bias: some variants feel more natural for some niches.
// We still allow all 4 to show up; bias just nudges the default pick when the
// user hasn't overridden it.
const NICHE_WEIGHTS: Record<string, Partial<Record<VariantId, number>>> = {
  wellness: { editorial: 2, organic: 2, swiss: 1, dark: 1 },
  weight_loss: { editorial: 2, organic: 2, swiss: 1, dark: 1 },
  beauty: { organic: 2, editorial: 2, swiss: 1, dark: 1 },
  fitness: { dark: 2, swiss: 1, editorial: 1, organic: 1 },
  relationships: { editorial: 2, organic: 2, swiss: 1, dark: 1 },
  spirituality: { editorial: 2, organic: 2, swiss: 1, dark: 1 },
  finance: { dark: 2, swiss: 2, editorial: 1, organic: 1 },
  business: { dark: 2, swiss: 2, editorial: 1, organic: 1 },
  productivity: { swiss: 2, dark: 2, editorial: 1, organic: 1 },
  languages: { editorial: 1, swiss: 1, dark: 1, organic: 1 },
  education: { editorial: 2, swiss: 1, dark: 1, organic: 1 },
  other: { editorial: 1, swiss: 1, dark: 1, organic: 1 },
};

// Expand niche weights into a "pool" of variant ids, each repeated per weight,
// then hash-pick to get a deterministic choice.
function weightedPool(niche: string): VariantId[] {
  const weights = NICHE_WEIGHTS[niche] ?? NICHE_WEIGHTS.other!;
  const pool: VariantId[] = [];
  for (const v of VARIANT_IDS) {
    const w = weights[v] ?? 1;
    for (let i = 0; i < w; i++) pool.push(v);
  }
  return pool;
}

export function pickVariantForProject(project: Pick<Project, "id" | "niche" | "templateVariant">): VariantId {
  if (project.templateVariant && (VARIANT_IDS as readonly string[]).includes(project.templateVariant)) {
    return project.templateVariant as VariantId;
  }
  const pool = weightedPool(project.niche);
  return hashPick(project.id, pool);
}

const RENDERERS: Record<VariantId, (args: RenderArgs) => string> = {
  editorial: renderEditorial,
  swiss: renderSwiss,
  dark: renderDark,
  organic: renderOrganic,
};

export function renderHtml(args: RenderArgs): string {
  const variant = pickVariantForProject(args.project);
  const renderer = RENDERERS[variant];
  return renderer(args);
}
