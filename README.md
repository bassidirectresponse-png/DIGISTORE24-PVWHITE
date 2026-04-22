# Digistore Forge

SaaS que gera sales pages HTML single-file prontas para aprovação na primeira submissão da **Digistore24 GmbH** (reseller europeu — FR/DE/BE/CH/PT/ES/UK).

Preenche dados da empresa uma vez, descreve o produto, gera copy + HTML compliance-ready em ~30 segundos com:
- Mentions Légales, Politique de Confidentialité (GDPR), CGV e Refund Policy nos dados da empresa + Digistore24 como reseller oficial
- Medical Disclaimer (wellness/weight_loss/beauty/fitness) ou Earnings Disclaimer (finance/business) automaticamente
- Copy em 7 idiomas (fr/en/es/pt/de/it/nl), claims não absolutos, testimonials com disclaimers
- Badge "Paiement sécurisé par Digistore24" no hero e footer
- Deploy Netlify com 1 clique

---

## Stack

- Next.js 14 (App Router) + TypeScript estrito
- Tailwind + shadcn/ui (new-york style, slate base)
- Prisma 6 + SQLite (dev) / Postgres (prod)
- NextAuth.js v5 (Credentials, bcryptjs)
- Anthropic SDK — `claude-sonnet-4-5`
- Zod + react-hook-form + Zustand
- Netlify API (token por usuário)

---

## Setup local

```bash
pnpm install
cp .env.example .env
# editar .env — ver variáveis abaixo

pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Abrir http://localhost:3000.

### Variáveis obrigatórias (`.env`)

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="<https://console.anthropic.com>"
```

### Credenciais demo

```
email:    demo@digistore-forge.local
password: demo1234
```

O seed popula `CompanyProfile` com os dados da Vanguard Group.

### Netlify token (opcional, para publicar)

1. https://app.netlify.com/user/applications → gerar Personal access token
2. Ao clicar "Publicar" o app pede e salva o token no seu usuário

---

## Estrutura

```
app/
  (auth)/         login, register
  (app)/          dashboard, new, profile, project/[id]
  api/
    auth/         NextAuth handlers
    preview/[id]  serve HTML gerado para iframe
components/
  ui/             shadcn primitives
  app/            Sidebar, forms, editor, preview, deploy
lib/
  ai.ts              Claude Sonnet integration (system prompt exato)
  db.ts              Prisma client singleton
  schemas.ts         Zod schemas compartilhados
  auth.ts            NextAuth config + requireUserId
  legal-templates.ts Templates legais em 7 idiomas
  html-template.ts   renderHtml (output final single-file)
  netlify.ts         API client para deploy
prisma/
  schema.prisma      User, CompanyProfile, Project
  seed.ts            Vanguard demo profile
```

---

## Adicionar novo idioma

1. `LANGUAGE_VALUES` em `lib/schemas.ts`
2. `LANG_LABELS` em `components/app/NewProjectForm.tsx`
3. Blocos em `lib/legal-templates.ts` (todas as funções)
4. `labelsForLang` em `lib/html-template.ts`

Textos não traduzidos caem em inglês como fallback.

## Adicionar novo nicho

1. `NICHE_VALUES` em `lib/schemas.ts`
2. `NICHE_LABELS` em `components/app/NewProjectForm.tsx` e `ProjectCard.tsx`
3. Se precisar de disclaimer novo, adicione em `legal-templates.ts` e ajuste `buildLegalTexts`

---

## Notas de compliance

Gera páginas baseado nos critérios Digistore24 GmbH documentados em **abril/2026**. A Digistore pode atualizar critérios; a aprovação final é responsabilidade do vendor. O system prompt em `lib/ai.ts` é o ponto central das 12 hard rules — não modifique sem testar em ambiente de aprovação.

Templates legais adaptam-se automaticamente para mencionar Digistore24 GmbH como **Merchant of Record**. Seus dados aparecem como **product vendor**, conforme exigido pela Digistore24.
