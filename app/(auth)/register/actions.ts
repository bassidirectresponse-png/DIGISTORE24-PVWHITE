"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/schemas";

export async function registerAction(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { email, password, name } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Email já cadastrado" };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { email, passwordHash, name: name ?? null },
  });
  return { ok: true };
}
