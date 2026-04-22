import type { CompanyProfile, Project } from "@prisma/client";
import type { PageCopy } from "@/lib/schemas";
import type { LegalTexts } from "@/lib/legal-templates";

export type RenderMode = "standalone" | "embed";

export const VARIANT_IDS = ["editorial", "swiss", "dark", "organic"] as const;
export type VariantId = (typeof VARIANT_IDS)[number];

export const VARIANT_LABELS: Record<VariantId, string> = {
  editorial: "Editorial (serif, warm)",
  swiss: "Swiss (minimal, b&w)",
  dark: "Dark (modern, tech)",
  organic: "Organic (lifestyle, rounded)",
};

export interface RenderArgs {
  copy: PageCopy;
  project: Project;
  companyProfile: CompanyProfile;
  legalTexts: LegalTexts;
  mode?: RenderMode;
}

export type VariantRenderer = (args: RenderArgs) => string;
