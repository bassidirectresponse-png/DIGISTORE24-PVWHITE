"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewProjectSchema } from "@/lib/schemas";

export async function createProjectAction(
  input: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = NewProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }
  const d = parsed.data;
  const project = await db.project.create({
    data: {
      userId,
      productName: d.productName,
      niche: d.niche,
      language: d.language,
      briefSummary: d.briefSummary,
      priceGross: d.priceGross,
      currency: d.currency,
      guaranteeDays: d.guaranteeDays,
      hasUpsell: d.hasUpsell,
      hasSubscription: d.hasSubscription,
      checkoutUrl: d.checkoutUrl || null,
      status: "draft",
    },
  });
  revalidatePath("/dashboard");
  return { ok: true, id: project.id };
}
