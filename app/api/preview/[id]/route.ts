import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return new NextResponse("UNAUTHORIZED", { status: 401 });
  }

  const project = await db.project.findFirst({
    where: { id: params.id, userId },
  });

  if (!project?.generatedHtml) {
    return new NextResponse(
      "<!DOCTYPE html><html><body style=\"font-family:system-ui;padding:40px;text-align:center;color:#64748b\"><p>Página ainda não gerada.</p></body></html>",
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  return new NextResponse(project.generatedHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
