"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePageCopy, regenerateBlock } from "@/lib/ai";
import { renderHtml, VARIANT_IDS, type VariantId } from "@/lib/html-template";
import { buildLegalTexts } from "@/lib/legal-templates";
import { PageCopySchema, type PageCopy } from "@/lib/schemas";
import { deployToNetlify } from "@/lib/netlify";

async function loadProjectWithProfile(projectId: string) {
  const userId = await requireUserId();
  const project = await db.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Projeto não encontrado");
  const profile = await db.companyProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Perfil da empresa não preenchido");
  return { userId, project, profile };
}

export async function generateAction(
  projectId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { project, profile } = await loadProjectWithProfile(projectId);
    const copy = await generatePageCopy({
      productName: project.productName,
      niche: project.niche,
      language: project.language,
      briefSummary: project.briefSummary,
      priceGross: project.priceGross,
      currency: project.currency,
      guaranteeDays: project.guaranteeDays,
      hasUpsell: project.hasUpsell,
      hasSubscription: project.hasSubscription,
    });
    const legalTexts = buildLegalTexts(project, profile);
    const html = renderHtml({ copy, project, companyProfile: profile, legalTexts });
    await db.project.update({
      where: { id: projectId },
      data: {
        generatedCopy: JSON.stringify(copy),
        generatedHtml: html,
        status: "generated",
      },
    });
    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/api/preview/${projectId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

export async function updateCopyAction(
  projectId: string,
  newCopy: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { project, profile } = await loadProjectWithProfile(projectId);
    const parsed = PageCopySchema.safeParse(newCopy);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Copy inválida",
      };
    }
    const copy = parsed.data;
    const legalTexts = buildLegalTexts(project, profile);
    const html = renderHtml({ copy, project, companyProfile: profile, legalTexts });
    await db.project.update({
      where: { id: projectId },
      data: {
        generatedCopy: JSON.stringify(copy),
        generatedHtml: html,
        status: "generated",
      },
    });
    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/api/preview/${projectId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao salvar",
    };
  }
}

export async function regenerateBlockAction(
  projectId: string,
  block: keyof PageCopy
): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  try {
    const { project, profile } = await loadProjectWithProfile(projectId);
    if (!project.generatedCopy) {
      return { ok: false, error: "Gere a copy primeiro" };
    }
    const currentCopy = PageCopySchema.parse(JSON.parse(project.generatedCopy));
    const value = await regenerateBlock(
      {
        productName: project.productName,
        niche: project.niche,
        language: project.language,
        briefSummary: project.briefSummary,
        priceGross: project.priceGross,
        currency: project.currency,
        guaranteeDays: project.guaranteeDays,
        hasUpsell: project.hasUpsell,
        hasSubscription: project.hasSubscription,
      },
      currentCopy,
      block
    );
    const nextCopy = { ...currentCopy, [block]: value } as PageCopy;
    const legalTexts = buildLegalTexts(project, profile);
    const html = renderHtml({
      copy: nextCopy,
      project,
      companyProfile: profile,
      legalTexts,
    });
    await db.project.update({
      where: { id: projectId },
      data: {
        generatedCopy: JSON.stringify(nextCopy),
        generatedHtml: html,
      },
    });
    revalidatePath(`/project/${projectId}`);
    revalidatePath(`/api/preview/${projectId}`);
    return { ok: true, value };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao regenerar",
    };
  }
}

export async function deployToNetlifyAction(
  projectId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user?.netlifyToken) {
      return {
        ok: false,
        error: "Configure seu Netlify token primeiro.",
      };
    }
    const project = await db.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) return { ok: false, error: "Projeto não encontrado" };
    if (!project.generatedCopy) {
      return { ok: false, error: "Gere a página primeiro" };
    }
    const profile = await db.companyProfile.findUnique({ where: { userId } });
    if (!profile) return { ok: false, error: "Perfil da empresa não preenchido" };
    const copy = PageCopySchema.parse(JSON.parse(project.generatedCopy));
    const freshHtml = renderHtml({
      copy,
      project,
      companyProfile: profile,
      legalTexts: buildLegalTexts(project, profile),
      mode: "standalone",
    });
    const slug = `${project.productName}-${project.id.slice(-6)}`;
    const result = await deployToNetlify(
      freshHtml,
      user.netlifyToken,
      slug
    );
    await db.project.update({
      where: { id: projectId },
      data: {
        netlifyUrl: result.url,
        netlifyDeployId: result.deployId,
        status: "deployed",
      },
    });
    revalidatePath(`/project/${projectId}`);
    revalidatePath("/dashboard");
    return { ok: true, url: result.url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Falha no deploy",
    };
  }
}

export async function setTemplateVariantAction(
  projectId: string,
  variant: VariantId | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId();
    if (variant !== null && !(VARIANT_IDS as readonly string[]).includes(variant)) {
      return { ok: false, error: "Variante inválida" };
    }
    const project = await db.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) return { ok: false, error: "Projeto não encontrado" };
    await db.project.update({
      where: { id: projectId },
      data: { templateVariant: variant },
    });
    revalidatePath(`/project/${projectId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao trocar variante",
    };
  }
}
