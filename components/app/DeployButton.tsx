"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket } from "lucide-react";
import { deployToNetlifyAction } from "@/app/(app)/project/[id]/actions";
import { saveNetlifyTokenAction } from "@/app/(app)/profile/actions";

export function DeployButton({
  projectId,
  hasHtml,
  hasNetlifyToken,
}: {
  projectId: string;
  hasHtml: boolean;
  hasNetlifyToken: boolean;
}) {
  const router = useRouter();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [token, setToken] = useState("");
  const [pending, startTransition] = useTransition();

  const deploy = () => {
    if (!hasHtml) {
      toast.error("Gere a página primeiro");
      return;
    }
    if (!hasNetlifyToken) {
      setTokenModalOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await deployToNetlifyAction(projectId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Publicado!", {
        action: {
          label: "Abrir",
          onClick: () => window.open(result.url, "_blank"),
        },
      });
      router.refresh();
    });
  };

  const saveToken = () => {
    startTransition(async () => {
      const result = await saveNetlifyTokenAction({ netlifyToken: token });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTokenModalOpen(false);
      toast.success("Token salvo. Publicando...");
      router.refresh();
      const deployResult = await deployToNetlifyAction(projectId);
      if (!deployResult.ok) {
        toast.error(deployResult.error);
        return;
      }
      toast.success("Publicado!", {
        action: {
          label: "Abrir",
          onClick: () => window.open(deployResult.url, "_blank"),
        },
      });
      router.refresh();
    });
  };

  return (
    <>
      <Button size="sm" onClick={deploy} disabled={pending || !hasHtml}>
        {pending ? <Loader2 className="animate-spin" /> : <Rocket />}
        Publicar
      </Button>

      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure seu Netlify token</DialogTitle>
            <DialogDescription>
              Gere um personal access token em{" "}
              <a
                href="https://app.netlify.com/user/applications"
                target="_blank"
                rel="noopener"
                className="text-indigo-600 underline"
              >
                app.netlify.com/user/applications
              </a>
              . O token é salvo apenas no seu usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="netlify-token">Personal Access Token</Label>
            <Input
              id="netlify-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="nfp_..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTokenModalOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button onClick={saveToken} disabled={pending || token.length < 10}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              Salvar e publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
