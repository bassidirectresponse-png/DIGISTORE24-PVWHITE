import Anthropic from "@anthropic-ai/sdk";
import { PageCopySchema, type PageCopy } from "./schemas";

const MODEL_ID = "claude-sonnet-4-5";

export const DIGISTORE_SYSTEM_PROMPT = `You are a specialist in creating sales pages that pass Digistore24 GmbH approval review on first submission. You have deep expertise in Digistore24 approval criteria, EU/GDPR compliance, and conversion copywriting for wellness/digital info products.

# HARD RULES — violating any of these causes automatic rejection

1. NEVER make absolute medical claims. Forbidden: "cure", "guarantees weight loss", "treats disease", "proven to heal", "clinically proven to", "medically approved".
2. NEVER make absolute financial promises. Forbidden: "guaranteed X€ in Y days", "risk-free income", "retire in 30 days", "make money while you sleep guaranteed".
3. NEVER fabricate fake medical endorsements, fake studies, or fake doctor quotes. If you reference a doctor/expert, say "inspired by" or "based on principles of" — never fake direct endorsements.
4. Testimonials MUST include "Témoignage illustratif" (or language equivalent) as disclaimer. Use only first name + initial (never full names), city only (never full addresses).
5. ALWAYS match the return policy to the guaranteeDays specified. If user said 30 days, copy says 30 days everywhere.
6. ALWAYS write in the TARGET LANGUAGE specified. Every single section. No mixing.
7. ALWAYS display the gross price as given — it already includes VAT.
8. ALWAYS mention that the sale is processed by Digistore24 GmbH as official reseller somewhere in the copy (footer and offer block at minimum).
9. For wellness/weight_loss/beauty/fitness niches: tone MUST be gentle, supportive, educational. Never body-shaming, never fear-based.
10. For finance/business niches: include realistic earnings disclaimer language naturally in the offer/guarantee section too.
11. Tone overall: INFORMATIVE, PROFESSIONAL, EMPATHETIC. Avoid: excessive exclamation marks, ALL-CAPS HEADLINES, fake scarcity ("ONLY 3 LEFT!"), aggressive urgency ("LAST CHANCE!!!").
12. CTAs should be clear but not pressuring. Good: "Commander maintenant", "Accéder au programme", "Commencer aujourd'hui". Bad: "BUY NOW BEFORE IT'S TOO LATE!!!"

# Output format

Output STRICT JSON matching this TypeScript type. No markdown fences. No commentary. No preamble. JSON only.

type PageCopy = {
  language: string;
  meta: { title: string; description: string; };  // SEO title ≤60c, description ≤160c
  hero: {
    eyebrow: string;           // short category line above headline
    headline: string;          // H1 — clear benefit, not hyped
    subheadline: string;       // supporting sentence explaining what the product does
    ctaLabel: string;
  };
  problem: {
    title: string;
    paragraphs: string[];      // 2-3 paragraphs — empathetic, describes the context
  };
  solution: {
    title: string;
    description: string;       // 1-2 paragraphs
    bulletPoints: string[];    // 4-6 realistic benefit bullets
  };
  features: {
    title: string;
    items: Array<{ title: string; description: string; icon: string }>;  // 3-6 items, icon = lucide-react name (BookOpen, CheckCircle, Heart, Shield, Sparkles, Target, Users, Zap, Leaf, Sun, Moon, Coffee)
  };
  socialProof: {
    title: string;
    testimonials: Array<{
      name: string;            // first name + initial only
      location: string;        // city only
      text: string;            // moderate, realistic claim
      disclaimer: string;      // "Témoignage illustratif. Les résultats varient."
    }>;                        // 3 testimonials
  };
  offer: {
    title: string;             // "Ce que vous recevez"
    items: string[];           // what's included (PDF, videos, bonuses)
    price: string;             // formatted like "47 €"
    priceNote: string;         // "TVA incluse" or language equivalent
    ctaLabel: string;
    digistoreNote: string;     // e.g. "Paiement sécurisé traité par Digistore24 GmbH"
  };
  guarantee: {
    title: string;             // "Garantie 30 jours satisfait ou remboursé"
    description: string;       // clear explanation of refund process
  };
  faq: {
    title: string;
    items: Array<{ question: string; answer: string }>;  // 5-7 realistic Q&A
  };
  closingCta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
};

Return ONLY this JSON.`;

export interface GenerateInput {
  productName: string;
  niche: string;
  language: string;
  briefSummary: string;
  priceGross: number;
  currency: string;
  guaranteeDays: number;
  hasUpsell: boolean;
  hasSubscription: boolean;
}

function buildUserMessage(input: GenerateInput): string {
  return `Generate a complete Digistore24-compliant sales page copy.

PRODUCT NAME: ${input.productName}
NICHE: ${input.niche}
TARGET LANGUAGE: ${input.language} (generate ALL copy in this language)
GROSS PRICE (VAT included): ${input.priceGross} ${input.currency}
MONEY-BACK GUARANTEE: ${input.guaranteeDays} days
IS SUBSCRIPTION: ${input.hasSubscription}
HAS UPSELL AFTER PURCHASE: ${input.hasUpsell}
BRIEF SUMMARY: ${input.briefSummary}

Output the full PageCopy JSON. No hype, no absolute claims, include realistic testimonials with disclaimers, mention Digistore24 in offer section and footer. Output JSON only.`;
}

export async function generatePageCopy(input: GenerateInput): Promise<PageCopy> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Defina a variável no .env."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 8000,
    system: DIGISTORE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("IA não retornou texto.");
  }

  const cleaned = textBlock.text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Falha ao fazer parse do JSON da IA: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  return PageCopySchema.parse(parsed);
}

export async function regenerateBlock<K extends keyof PageCopy>(
  input: GenerateInput,
  currentCopy: PageCopy,
  block: K
): Promise<PageCopy[K]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }

  const client = new Anthropic({ apiKey });

  const prompt = `Regenerate ONLY the "${String(block)}" block of this PageCopy JSON. Keep the same tone, language (${input.language}), and rules. Product: ${input.productName}, niche: ${input.niche}, price: ${input.priceGross} ${input.currency}, guarantee: ${input.guaranteeDays} days.

Current full copy for context:
${JSON.stringify(currentCopy, null, 2)}

Output ONLY the new "${String(block)}" block as JSON (no wrapper object, just the block value). No markdown, no preamble.`;

  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 3000,
    system: DIGISTORE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("IA não retornou texto.");
  }

  const cleaned = textBlock.text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned) as PageCopy[K];
}
