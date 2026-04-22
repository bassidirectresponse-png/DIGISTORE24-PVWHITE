"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeviceToggle, deviceWidth, type DeviceMode } from "./DeviceToggle";
import {
  Download,
  ExternalLink,
  RefreshCw,
  Loader2,
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

  const src = `/api/preview/${projectId}?t=${reloadKey}`;
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
