import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Globe } from "lucide-react";
import { ProjectCard } from "@/components/app/ProjectCard";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const [profile, projects] = await Promise.all([
    db.companyProfile.findUnique({ where: { userId } }),
    db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!profile) redirect("/profile?first=1");

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {projects.length === 0
              ? "Crie seu primeiro projeto para gerar uma sales page."
              : `${projects.length} projeto${projects.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/new">
            <Plus className="h-4 w-4" />
            Novo projeto
          </Link>
        </Button>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-16 text-center">
          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h2>
          <p className="text-sm text-slate-500 mb-6">
            Gere sua primeira sales page em menos de 30 segundos.
          </p>
          <Button asChild>
            <Link href="/new">
              <Plus className="h-4 w-4" />
              Criar primeiro projeto
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Empresa
        </h2>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{profile.legalName}</p>
              <p className="text-sm text-slate-500">
                {profile.taxIdType}: {profile.taxIdNumber} —{" "}
                {profile.addressCity}, {profile.addressCountry}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/profile">
                <Globe className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
