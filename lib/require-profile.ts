import { redirect } from "next/navigation";
import { db } from "./db";
import { auth } from "./auth";

export async function requireProfile() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const profile = await db.companyProfile.findUnique({ where: { userId } });
  if (!profile) redirect("/profile?first=1");

  return { userId, profile };
}
