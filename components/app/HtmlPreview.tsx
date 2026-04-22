"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeviceToggle, deviceWidth, type DeviceMode } from "./DeviceToggle";
import {
  Download,
  ExternalLink,
  RefreshCw,
  Loader2,
  Clipboard,
  Check,
} from "lucide-react";
import { DeployButton } from "./DeployButton";

export function HtmlPreview({
  projectId,
  hasHtml,
  generating,
  hasNetlifyToken,
  netlifyUrl,
}: {
  projectId: string;
  hasHtml: boolean;
  generating: boolean;
  hasNetlifyToken: boolean;
  netlifyUrl: string | null;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyPending, setCopyPending] = useState(false);

  const src = `/api/preview/${projectId}?t=${reloadKey}`;
  const embedSrc = `/api/preview/${projectId}?embed=1&t=${reloadKey}`;
  const w = deviceWidth(device);

  const reload = () => setReloadKey(Date.now());
  const openNewTab = () => window.open(src, "_blank");

  const download = async () => {
    const res = await fetch(src);
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digistore-${projectId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("HTML baixado (standalone)");
  };

  const copyEmbed = async () => {
    if (copyPending) return;
    setCopyPending(true);
    try {
      const res = await fetch(embedSrc);
      if (!res.ok) throw new Error("fetch failed");
      const html = await res.text();
      await navigator.clipboard.writeText(html);
      setCopied(true);
      toast.success("HTML copiado — pronto pra colar no Atomicat", {
        description: `${(html.length / 1024).toFixed(1)} KB · sem dependências CDN`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Falha ao copiar. Tente o Download.");
    } finally {
      setCopyPending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <DeviceToggle value={device} onChange={setDevice} />
          <Button variant="ghost" size="icon" onClick={reload} disabled={!hasHtml}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openNewTab}
            disabled={!hasHtml}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={download}
            disabled={!hasHtml}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyEmbed}
            disabled={!hasHtml || copyPending}
            className="ml-1"
          >
            {copyPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
            HTML para Atomicat
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {netlifyUrl ? (
            <a
              href={netlifyUrl}
              target="_blank"
              rel="noopener"
              className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {netlifyUrl.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
          <DeployButton
            projectId={projectId}
            hasHtml={hasHtml}
            hasNetlifyToken={hasNetlifyToken}
          />
        </div>
      </div>

      <div className="flex-1 bg-slate-100 overflow-auto p-4 grid place-items-start justify-items-center">
        {generating ? (
          <div className="w-full max-w-xl mt-20 text-center space-y-4">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
            <p className="font-semibold">Gerando copy e HTML...</p>
            <p className="text-sm text-slate-500">
              Pode levar de 15 a 30 segundos.
            </p>
          </div>
        ) : !hasHtml ? (
          <div className="w-full max-w-xl mt-20 text-center text-slate-500">
            <p className="text-sm">Página ainda não gerada.</p>
          </div>
        ) : (
          <div
            style={{
              width: w,
              maxWidth: "100%",
              height: "100%",
              minHeight: 600,
            }}
            className="rounded-lg overflow-hidden shadow-lg border bg-white"
          >
            <iframe
              ref={iframeRef}
              src={src}
              title="preview"
              className="w-full h-full"
              style={{ minHeight: 600 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
