import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageCopySchema, type PageCopy } from "@/lib/schemas";
import { ProjectEditor } from "@/components/app/ProjectEditor";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { autogen?: string };
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const project = await db.project.findFirst({
    where: { id: params.id, userId },
  });
  if (!project) notFound();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { netlifyToken: true },
  });

  let parsedCopy: PageCopy | null = null;
  if (project.generatedCopy) {
    const result = PageCopySchema.safeParse(JSON.parse(project.generatedCopy));
    if (result.success) parsedCopy = result.data;
  }

  return (
    <ProjectEditor
      project={{
        id: project.id,
        productName: project.productName,
        niche: project.niche,
        language: project.language,
        status: project.status,
        netlifyUrl: project.netlifyUrl,
      }}
      initialCopy={parsedCopy}
      hasHtml={!!project.generatedHtml}
      hasNetlifyToken={!!user?.netlifyToken}
      autoGenerate={searchParams.autogen === "1" && !parsedCopy}
    />
  );
}
