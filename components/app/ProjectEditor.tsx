"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import { CopyEditor } from "./CopyEditor";
import { HtmlPreview } from "./HtmlPreview";
import type { PageCopy } from "@/lib/schemas";
import { generateAction } from "@/app/(app)/project/[id]/actions";

interface Props {
  project: {
    id: string;
    productName: string;
    niche: string;
    language: string;
    status: string;
    netlifyUrl: string | null;
  };
  initialCopy: PageCopy | null;
  hasHtml: boolean;
  hasNetlifyToken: boolean;
  autoGenerate: boolean;
}

export function ProjectEditor({
  project,
  initialCopy,
  hasHtml,
  hasNetlifyToken,
  autoGenerate,
}: Props) {
  const router = useRouter();
  const [copy, setCopy] = useState<PageCopy | null>(initialCopy);
  const [generating, setGenerating] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!autoGenerate || autoStarted || copy || generating) return;
    setAutoStarted(true);
    setGenerating(true);
    startTransition(async () => {
      const result = await generateAction(project.id);
      setGenerating(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Página gerada!");
      router.refresh();
    });
  }, [autoGenerate, autoStarted, copy, generating, project.id, router]);

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-white px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-semibold truncate">{project.productName}</h1>
            <p className="text-xs text-slate-500">
              {project.language.toUpperCase()} · {project.niche} ·{" "}
              <StatusLabel status={project.status} />
            </p>
          </div>
        </div>
        {generating ? (
          <span className="text-xs text-indigo-600 inline-flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            gerando...
          </span>
        ) : !copy ? (
          <span className="text-xs text-slate-400 inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            rascunho
          </span>
        ) : null}
      </header>

      <div className="flex-1 grid md:grid-cols-[minmax(380px,2fr)_3fr] overflow-hidden">
        <section className="border-r bg-white overflow-hidden flex flex-col">
          <CopyEditor
            projectId={project.id}
            copy={copy}
            onCopyChange={setCopy}
            onGeneratingChange={setGenerating}
          />
        </section>
        <section className="overflow-hidden">
          <HtmlPreview
            projectId={project.id}
            hasHtml={hasHtml || !!copy}
            generating={generating}
            hasNetlifyToken={hasNetlifyToken}
            netlifyUrl={project.netlifyUrl}
          />
        </section>
      </div>
    </div>
  );
}

function StatusLabel({ status }: { status: string }) {
  if (status === "deployed") return <span className="text-emerald-600">publicado</span>;
  if (status === "generated") return <span className="text-indigo-600">gerado</span>;
  return <span>rascunho</span>;
}
