"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VARIANT_IDS, VARIANT_LABELS, type VariantId } from "@/lib/page-templates";
import { setTemplateVariantAction } from "@/app/(app)/project/[id]/actions";
import { Sparkles, Loader2 } from "lucide-react";

const AUTO = "__auto__";

export function VariantPicker({
  projectId,
  override,
  resolved,
}: {
  projectId: string;
  override: string | null;
  resolved: VariantId;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const value = override ?? AUTO;

  const handleChange = (next: string) => {
    startTransition(async () => {
      const variant = next === AUTO ? null : (next as VariantId);
      const result = await setTemplateVariantAction(projectId, variant);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        variant
          ? `Template: ${VARIANT_LABELS[variant]}`
          : `Template: auto (${VARIANT_LABELS[resolved]})`
      );
      router.refresh();
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
      ) : (
        <Sparkles className="h-3.5 w-3.5 text-slate-400" />
      )}
      <Select value={value} onValueChange={handleChange} disabled={pending}>
        <SelectTrigger className="h-8 w-[210px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={AUTO}>
            Auto · {VARIANT_LABELS[resolved]}
          </SelectItem>
          {VARIANT_IDS.map((v) => (
            <SelectItem key={v} value={v}>
              {VARIANT_LABELS[v]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
