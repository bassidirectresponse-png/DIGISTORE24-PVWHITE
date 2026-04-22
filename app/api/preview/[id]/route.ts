import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageCopySchema } from "@/lib/schemas";
import { buildLegalTexts } from "@/lib/legal-templates";
import { renderHtml } from "@/lib/html-template";

const EMPTY_HTML = `<!DOCTYPE html><html><body style="font-family:system-ui;padding:40px;text-align:center;color:#64748b"><p>Página ainda não gerada.</p></body></html>`;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return new NextResponse("UNAUTHORIZED", { status: 401 });
  }

  const url = new URL(req.url);
  const embed = url.searchParams.get("embed") === "1";

  const project = await db.project.findFirst({
    where: { id: params.id, userId },
  });
  if (!project || !project.generatedCopy) {
    return new NextResponse(EMPTY_HTML, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const profile = await db.companyProfile.findUnique({ where: { userId } });
  if (!profile) {
    return new NextResponse(EMPTY_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const parsed = PageCopySchema.safeParse(JSON.parse(project.generatedCopy));
  if (!parsed.success) {
    return new NextResponse(EMPTY_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const html = renderHtml({
    copy: parsed.data,
    project,
    companyProfile: profile,
    legalTexts: buildLegalTexts(project, profile),
    mode: embed ? "embed" : "standalone",
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
