"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import {
  NewProjectSchema,
  type NewProjectInput,
  NICHE_VALUES,
  LANGUAGE_VALUES,
  CURRENCY_VALUES,
  GUARANTEE_DAYS_VALUES,
} from "@/lib/schemas";
import { createProjectAction } from "@/app/(app)/new/actions";

const NICHE_LABELS: Record<(typeof NICHE_VALUES)[number], string> = {
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

const LANG_LABELS: Record<(typeof LANGUAGE_VALUES)[number], string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  it: "Italiano",
  nl: "Nederlands",
};

export function NewProjectForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<NewProjectInput>({
    resolver: zodResolver(NewProjectSchema),
    defaultValues: {
      productName: "",
      niche: "wellness",
      language: "fr",
      briefSummary: "",
      priceGross: 47,
      currency: "EUR",
      guaranteeDays: 30,
      hasUpsell: false,
      hasSubscription: false,
      checkoutUrl: "",
    },
  });

  const values = form.watch();

  const onSubmit = (data: NewProjectInput) => {
    startTransition(async () => {
      const result = await createProjectAction(data);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Projeto criado. Gerando copy...");
      router.push(`/project/${result.id}?autogen=1`);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <Field label="Nome do produto" required error={form.formState.errors.productName?.message}>
          <Input
            {...form.register("productName")}
            placeholder="Le Protocole Pink Salt Burn"
          />
        </Field>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nicho" required>
            <Select
              value={values.niche}
              onValueChange={(v) => form.setValue("niche", v as NewProjectInput["niche"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NICHE_VALUES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {NICHE_LABELS[n]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Idioma da copy" required>
            <Select
              value={values.language}
              onValueChange={(v) =>
                form.setValue("language", v as NewProjectInput["language"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_VALUES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LANG_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field
          label="Breve descrição (100-500 caracteres)"
          required
          error={form.formState.errors.briefSummary?.message}
        >
          <Textarea
            rows={4}
            {...form.register("briefSummary")}
            placeholder="Em 2-3 frases, descreva o que o produto entrega, para quem, e quais resultados realistas o usuário pode esperar."
          />
          <p className="text-xs text-slate-400 mt-1">
            {values.briefSummary?.length || 0} / 500
          </p>
        </Field>

        <div className="grid md:grid-cols-3 gap-4">
          <Field
            label="Preço (com VAT/TVA incluso)"
            required
            error={form.formState.errors.priceGross?.message}
          >
            <Input
              type="number"
              step="0.01"
              min={0}
              {...form.register("priceGross", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Moeda" required>
            <Select
              value={values.currency}
              onValueChange={(v) =>
                form.setValue("currency", v as NewProjectInput["currency"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_VALUES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Garantia (dias)" required>
            <Select
              value={String(values.guaranteeDays)}
              onValueChange={(v) => form.setValue("guaranteeDays", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GUARANTEE_DAYS_VALUES.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} dias
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="URL do checkout Digistore (opcional)">
          <Input
            {...form.register("checkoutUrl")}
            placeholder="https://checkout.digistore24.com/product/XXXXX"
          />
        </Field>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.hasUpsell}
              onCheckedChange={(v) => form.setValue("hasUpsell", v === true)}
            />
            Tem upsell após compra
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.hasSubscription}
              onCheckedChange={(v) =>
                form.setValue("hasSubscription", v === true)
              }
            />
            É assinatura recorrente
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Gerar página
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
