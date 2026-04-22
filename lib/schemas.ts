import { z } from "zod";

// ---------- Auth ----------
export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
  name: z.string().optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

// ---------- Company profile ----------
export const CompanyProfileSchema = z.object({
  legalName: z.string().min(2, "Razão social obrigatória"),
  tradingName: z.string().optional(),
  taxIdType: z.enum(["CNPJ", "CPF", "SIRET", "VAT_EU", "OTHER"]),
  taxIdNumber: z.string().min(3, "Número fiscal obrigatório"),
  vatNumber: z.string().optional(),

  addressStreet: z.string().min(2, "Rua obrigatória"),
  addressNumber: z.string().min(1, "Número obrigatório"),
  addressComplement: z.string().optional(),
  addressDistrict: z.string().min(1, "Bairro obrigatório"),
  addressCity: z.string().min(1, "Cidade obrigatória"),
  addressState: z.string().optional(),
  addressZip: z.string().min(1, "CEP obrigatório"),
  addressCountry: z.string().min(2, "País obrigatório"),

  contactEmail: z.string().email("Email inválido"),
  contactPhone: z.string().optional(),
  supportEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),

  legalRepName: z.string().min(2, "Nome do representante obrigatório"),
});
export type CompanyProfileInput = z.infer<typeof CompanyProfileSchema>;

// ---------- Project ----------
export const NICHE_VALUES = [
  "wellness",
  "weight_loss",
  "beauty",
  "fitness",
  "relationships",
  "spirituality",
  "finance",
  "business",
  "languages",
  "productivity",
  "education",
  "other",
] as const;

export const LANGUAGE_VALUES = [
  "fr",
  "en",
  "es",
  "pt",
  "de",
  "it",
  "nl",
] as const;

export const CURRENCY_VALUES = ["EUR", "USD", "BRL", "GBP", "CHF"] as const;
export const GUARANTEE_DAYS_VALUES = [7, 14, 30, 60, 90, 180] as const;

export const NewProjectSchema = z.object({
  productName: z
    .string()
    .min(3, "Nome muito curto")
    .max(120, "Nome muito longo"),
  niche: z.enum(NICHE_VALUES),
  language: z.enum(LANGUAGE_VALUES),
  briefSummary: z
    .string()
    .min(100, "Descrição deve ter pelo menos 100 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  priceGross: z.number().positive("Preço deve ser maior que zero"),
  currency: z.enum(CURRENCY_VALUES),
  guaranteeDays: z
    .number()
    .int()
    .refine((v) => (GUARANTEE_DAYS_VALUES as readonly number[]).includes(v), {
      message: "Garantia inválida",
    }),
  hasUpsell: z.boolean(),
  hasSubscription: z.boolean(),
  checkoutUrl: z.string().url().optional().or(z.literal("")),
});
export type NewProjectInput = z.infer<typeof NewProjectSchema>;

// ---------- PageCopy (IA output) ----------
export const PageCopySchema = z.object({
  language: z.string(),
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    subheadline: z.string(),
    ctaLabel: z.string(),
  }),
  problem: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
  }),
  solution: z.object({
    title: z.string(),
    description: z.string(),
    bulletPoints: z.array(z.string()),
  }),
  features: z.object({
    title: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
      })
    ),
  }),
  socialProof: z.object({
    title: z.string(),
    testimonials: z.array(
      z.object({
        name: z.string(),
        location: z.string(),
        text: z.string(),
        disclaimer: z.string(),
      })
    ),
  }),
  offer: z.object({
    title: z.string(),
    items: z.array(z.string()),
    price: z.string(),
    priceNote: z.string(),
    ctaLabel: z.string(),
    digistoreNote: z.string(),
  }),
  guarantee: z.object({
    title: z.string(),
    description: z.string(),
  }),
  faq: z.object({
    title: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  closingCta: z.object({
    title: z.string(),
    subtitle: z.string(),
    ctaLabel: z.string(),
  }),
});
export type PageCopy = z.infer<typeof PageCopySchema>;

// ---------- Netlify token ----------
export const NetlifyTokenSchema = z.object({
  netlifyToken: z.string().min(10, "Token inválido"),
});
export type NetlifyTokenInput = z.infer<typeof NetlifyTokenSchema>;
