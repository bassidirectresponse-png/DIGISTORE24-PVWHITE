"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CompanyProfileSchema,
  NetlifyTokenSchema,
} from "@/lib/schemas";

export async function saveCompanyProfileAction(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = CompanyProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }
  const d = parsed.data;
  await db.companyProfile.upsert({
    where: { userId },
    create: {
      userId,
      legalName: d.legalName,
      tradingName: d.tradingName || null,
      taxIdType: d.taxIdType,
      taxIdNumber: d.taxIdNumber,
      vatNumber: d.vatNumber || null,
      addressStreet: d.addressStreet,
      addressNumber: d.addressNumber,
      addressComplement: d.addressComplement || null,
      addressDistrict: d.addressDistrict,
      addressCity: d.addressCity,
      addressState: d.addressState || null,
      addressZip: d.addressZip,
      addressCountry: d.addressCountry,
      contactEmail: d.contactEmail,
      contactPhone: d.contactPhone || null,
      supportEmail: d.supportEmail || null,
      legalRepName: d.legalRepName,
    },
    update: {
      legalName: d.legalName,
      tradingName: d.tradingName || null,
      taxIdType: d.taxIdType,
      taxIdNumber: d.taxIdNumber,
      vatNumber: d.vatNumber || null,
      addressStreet: d.addressStreet,
      addressNumber: d.addressNumber,
      addressComplement: d.addressComplement || null,
      addressDistrict: d.addressDistrict,
      addressCity: d.addressCity,
      addressState: d.addressState || null,
      addressZip: d.addressZip,
      addressCountry: d.addressCountry,
      contactEmail: d.contactEmail,
      contactPhone: d.contactPhone || null,
      supportEmail: d.supportEmail || null,
      legalRepName: d.legalRepName,
    },
  });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveNetlifyTokenAction(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const parsed = NetlifyTokenSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Token inválido" };
  }
  await db.user.update({
    where: { id: userId },
    data: { netlifyToken: parsed.data.netlifyToken },
  });
  return { ok: true };
}
