import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/app/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: { id: true, productName: true, status: true },
  });

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar projects={projects} userEmail={session?.user?.email ?? ""} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
