import Link from "next/link";
import type { Project } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Languages } from "lucide-react";

const NICHE_LABELS: Record<string, string> = {
  wellness: "Wellness",
  weight_loss: "Weight loss",
  beauty: "Beauty",
  fitness: "Fitness",
  relationships: "Relationships",
  spirituality: "Spirituality",
  finance: "Finance",
  business: "Business",
  languages: "Languages",
  productivity: "Productivity",
  education: "Education",
  other: "Other",
};

const STATUS_STYLES: Record<string, { variant: "default" | "secondary" | "outline"; className?: string; label: string }> = {
  draft: { variant: "outline", label: "Rascunho" },
  generated: { variant: "secondary", className: "bg-indigo-100 text-indigo-700", label: "Gerado" },
  deployed: { variant: "default", className: "bg-emerald-600 text-white", label: "Publicado" },
};

export function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_STYLES[project.status] ?? STATUS_STYLES.draft;
  return (
    <Link
      href={`/project/${project.id}`}
      className="group rounded-xl border bg-white p-5 hover:shadow-lg hover:border-indigo-200 transition"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold tracking-tight line-clamp-2 group-hover:text-indigo-700 transition">
          {project.productName}
        </h3>
        <Badge variant={status.variant} className={status.className}>
          {status.label}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        <span className="inline-flex items-center gap-1">
          <Languages className="h-3 w-3" />
          {project.language.toUpperCase()}
        </span>
        <span>{NICHE_LABELS[project.niche] ?? project.niche}</span>
        <span>
          {project.priceGross.toFixed(2)} {project.currency}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(project.updatedAt).toLocaleDateString("pt-BR")}
        </span>
        {project.netlifyUrl ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <ExternalLink className="h-3 w-3" />
            live
          </span>
        ) : null}
      </div>
    </Link>
  );
}
