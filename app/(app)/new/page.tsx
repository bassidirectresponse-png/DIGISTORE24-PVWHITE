import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewProjectForm } from "@/components/app/NewProjectForm";

export default async function NewProjectPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const profile = await db.companyProfile.findUnique({ where: { userId } });
  if (!profile) redirect("/profile?first=1");

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Novo projeto</h1>
        <p className="text-slate-600 mt-1">
          Preencha os dados do produto. A copy e o HTML serão gerados em seguida.
        </p>
      </header>

      <NewProjectForm />
    </div>
  );
}
