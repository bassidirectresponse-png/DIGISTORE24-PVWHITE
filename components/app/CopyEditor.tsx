"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import type { PageCopy } from "@/lib/schemas";
import {
  updateCopyAction,
  regenerateBlockAction,
  generateAction,
} from "@/app/(app)/project/[id]/actions";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
  copy: PageCopy | null;
  onCopyChange: (c: PageCopy | null) => void;
  onGeneratingChange: (b: boolean) => void;
}

export function CopyEditor({
  projectId,
  copy,
  onCopyChange,
  onGeneratingChange,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, startSaving] = useTransition();

  const generate = () => {
    onGeneratingChange(true);
    startTransition(async () => {
      const result = await generateAction(projectId);
      onGeneratingChange(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Copy gerada!");
      router.refresh();
    });
  };

  const save = (next: PageCopy) => {
    onCopyChange(next);
    startSaving(async () => {
      const result = await updateCopyAction(projectId, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Copy atualizada");
      router.refresh();
    });
  };

  const regen = async (block: keyof PageCopy) => {
    const result = await regenerateBlockAction(projectId, block);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Bloco "${String(block)}" regenerado`);
    router.refresh();
  };

  if (!copy) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <Sparkles className="h-10 w-10 text-indigo-300 mb-4" />
        <h3 className="font-semibold mb-2">Gerar copy com IA</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          Clique abaixo para gerar a copy completa da sales page a partir dos
          dados do produto. Leva 15-30s.
        </p>
        <Button onClick={generate} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Gerar copy agora
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="hero" className="h-full flex flex-col">
      <div className="border-b px-3 pt-3 pb-2 bg-white overflow-x-auto">
        <TabsList className="flex-wrap h-auto">
          {TAB_ORDER.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize text-xs">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <TabsContent value="meta" className="mt-0">
          <BlockShell
            title="Meta (SEO)"
            onRegen={() => regen("meta")}
            saving={saving}
          >
            <Field label="Title (≤60c)">
              <Input
                value={copy.meta.title}
                onChange={(e) =>
                  save({ ...copy, meta: { ...copy.meta, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Description (≤160c)">
              <Textarea
                rows={2}
                value={copy.meta.description}
                onChange={(e) =>
                  save({
                    ...copy,
                    meta: { ...copy.meta, description: e.target.value },
                  })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>

        <TabsContent value="hero" className="mt-0">
          <BlockShell title="Hero" onRegen={() => regen("hero")} saving={saving}>
            <Field label="Eyebrow">
              <Input
                value={copy.hero.eyebrow}
                onChange={(e) =>
                  save({ ...copy, hero: { ...copy.hero, eyebrow: e.target.value } })
                }
              />
            </Field>
            <Field label="Headline (H1)">
              <Textarea
                rows={2}
                value={copy.hero.headline}
                onChange={(e) =>
                  save({ ...copy, hero: { ...copy.hero, headline: e.target.value } })
                }
              />
            </Field>
            <Field label="Subheadline">
              <Textarea
                rows={3}
                value={copy.hero.subheadline}
                onChange={(e) =>
                  save({
                    ...copy,
                    hero: { ...copy.hero, subheadline: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="CTA label">
              <Input
                value={copy.hero.ctaLabel}
                onChange={(e) =>
                  save({ ...copy, hero: { ...copy.hero, ctaLabel: e.target.value } })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>

        <TabsContent value="problem" className="mt-0">
          <BlockShell
            title="Problem"
            onRegen={() => regen("problem")}
            saving={saving}
          >
            <Field label="Title">
              <Input
                value={copy.problem.title}
                onChange={(e) =>
                  save({
                    ...copy,
                    problem: { ...copy.problem, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Paragraphs (um por linha)">
              <Textarea
                rows={6}
                value={copy.problem.paragraphs.join("\n\n")}
                onChange={(e) =>
                  save({
                    ...copy,
                    problem: {
                      ...copy.problem,
                      paragraphs: e.target.value
                        .split(/\n\n+/)
                        .map((p) => p.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>

        <TabsContent value="solution" className="mt-0">
          <BlockShell
            title="Solution"
            onRegen={() => regen("solution")}
            saving={saving}
          >
            <Field label="Title">
              <Input
                value={copy.solution.title}
                onChange={(e) =>
                  save({
                    ...copy,
                    solution: { ...copy.solution, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={4}
                value={copy.solution.description}
                onChange={(e) =>
                  save({
                    ...copy,
                    solution: { ...copy.solution, description: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Bullet points (um por linha)">
              <Textarea
                rows={6}
                value={copy.solution.bulletPoints.join("\n")}
                onChange={(e) =>
                  save({
                    ...copy,
                    solution: {
                      ...copy.solution,
                      bulletPoints: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>

        <TabsContent value="features" className="mt-0">
          <BlockShell
            title="Features"
            onRegen={() => regen("features")}
            saving={saving}
          >
            <Field label="Title">
              <Input
                value={copy.features.title}
                onChange={(e) =>
                  save({
                    ...copy,
                    features: { ...copy.features, title: e.target.value },
                  })
                }
              />
            </Field>
            <p className="text-xs text-slate-500">
              {copy.features.items.length} items. Use o botão Regenerar acima
              para refazer a lista completa.
            </p>
          </BlockShell>
        </TabsContent>

        <TabsContent value="socialProof" className="mt-0">
          <BlockShell
            title="Testimonials"
            onRegen={() => regen("socialProof")}
            saving={saving}
          >
            <Field label="Title">
              <Input
                value={copy.socialProof.title}
                onChange={(e) =>
                  save({
                    ...copy,
                    socialProof: {
                      ...copy.socialProof,
                      title: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <p className="text-xs text-slate-500">
              {copy.socialProof.testimonials.length} depoimentos. Use o botão
              Regenerar acima para refazer com novos nomes, cidades e textos.
            </p>
          </BlockShell>
        </TabsContent>

        <TabsContent value="offer" className="mt-0">
          <BlockShell title="Offer" onRegen={() => regen("offer")} saving={saving}>
            <Field label="Title">
              <Input
                value={copy.offer.title}
                onChange={(e) =>
                  save({ ...copy, offer: { ...copy.offer, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Items (um por linha)">
              <Textarea
                rows={5}
                value={copy.offer.items.join("\n")}
                onChange={(e) =>
                  save({
                    ...copy,
                    offer: {
                      ...copy.offer,
                      items: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price">
                <Input
                  value={copy.offer.price}
                  onChange={(e) =>
                    save({
                      ...copy,
                      offer: { ...copy.offer, price: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Price note">
                <Input
                  value={copy.offer.priceNote}
                  onChange={(e) =>
                    save({
                      ...copy,
                      offer: { ...copy.offer, priceNote: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="CTA label">
              <Input
                value={copy.offer.ctaLabel}
                onChange={(e) =>
                  save({
                    ...copy,
                    offer: { ...copy.offer, ctaLabel: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Digistore note">
              <Input
                value={copy.offer.digistoreNote}
                onChange={(e) =>
                  save({
                    ...copy,
                    offer: { ...copy.offer, digistoreNote: e.target.value },
                  })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>

        <TabsContent value="guarantee" className="mt-0">
          <BlockShell
            title="Guarantee"
            onRegen={() => regen("guarantee")}
            saving={saving}
          >
            <Field label="Title">
              <Input
                value={copy.guarantee.title}
                onChange={(e) =>
                  save({
                    ...copy,
                    guarantee: { ...copy.guarantee, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Description">
              <Textarea
                rows={4}
                value={copy.guarantee.description}
                onChange={(e) =>
                  save({
                    ...copy,
                    guarantee: {
                      ...copy.guarantee,
                      description: e.target.value,
                    },
                  })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>

        <TabsContent value="faq" className="mt-0">
          <BlockShell title="FAQ" onRegen={() => regen("faq")} saving={saving}>
            <Field label="Title">
              <Input
                value={copy.faq.title}
                onChange={(e) =>
                  save({ ...copy, faq: { ...copy.faq, title: e.target.value } })
                }
              />
            </Field>
            <p className="text-xs text-slate-500">
              {copy.faq.items.length} perguntas. Use o botão Regenerar acima
              para refazer.
            </p>
          </BlockShell>
        </TabsContent>

        <TabsContent value="closingCta" className="mt-0">
          <BlockShell
            title="Closing CTA"
            onRegen={() => regen("closingCta")}
            saving={saving}
          >
            <Field label="Title">
              <Input
                value={copy.closingCta.title}
                onChange={(e) =>
                  save({
                    ...copy,
                    closingCta: {
                      ...copy.closingCta,
                      title: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <Field label="Subtitle">
              <Textarea
                rows={2}
                value={copy.closingCta.subtitle}
                onChange={(e) =>
                  save({
                    ...copy,
                    closingCta: {
                      ...copy.closingCta,
                      subtitle: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <Field label="CTA label">
              <Input
                value={copy.closingCta.ctaLabel}
                onChange={(e) =>
                  save({
                    ...copy,
                    closingCta: {
                      ...copy.closingCta,
                      ctaLabel: e.target.value,
                    },
                  })
                }
              />
            </Field>
          </BlockShell>
        </TabsContent>
      </div>
    </Tabs>
  );
}

const TAB_ORDER: Array<keyof PageCopy> = [
  "hero",
  "problem",
  "solution",
  "features",
  "socialProof",
  "offer",
  "guarantee",
  "faq",
  "closingCta",
  "meta",
];

function BlockShell({
  title,
  onRegen,
  saving,
  children,
}: {
  title: string;
  onRegen: () => void | Promise<void>;
  saving: boolean;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const handleRegen = () => {
    startTransition(async () => {
      await onRegen();
    });
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {saving ? (
            <span className="text-xs text-slate-500 inline-flex items-center gap-1">
              <Save className="h-3 w-3" />
              salvando...
            </span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegen}
            disabled={pending}
          >
            {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Regenerar
          </Button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500">{label}</Label>
      {children}
    </div>
  );
}
