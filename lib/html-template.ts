import type { CompanyProfile, Project } from "@prisma/client";
import type { PageCopy } from "./schemas";
import type { LegalTexts } from "./legal-templates";
import { formatFullAddress } from "./legal-templates";

// =======================================================================
// Helpers
// =======================================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}

// Minimal markdown → HTML for legal texts (headings, bold, paragraphs, line breaks).
function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join(" ").trim();
      if (text) out.push(`<p class="mb-3 text-slate-700 leading-relaxed">${inline(text)}</p>`);
      para = [];
    }
  };

  const inline = (t: string): string =>
    escapeHtml(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /(https?:\/\/[^\s)]+)/g,
        '<a href="$1" class="text-indigo-600 underline" target="_blank" rel="noopener">$1</a>'
      );

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      out.push(
        `<h2 class="text-xl font-bold text-slate-900 mb-3 mt-2">${inline(line.slice(2))}</h2>`
      );
    } else if (line.startsWith("## ")) {
      flushPara();
      out.push(
        `<h3 class="text-base font-semibold text-slate-900 mb-2 mt-4">${inline(line.slice(3))}</h3>`
      );
    } else if (line.startsWith("- ")) {
      flushPara();
      out.push(
        `<li class="ml-5 list-disc text-slate-700 mb-1">${inline(line.slice(2))}</li>`
      );
    } else {
      para.push(line);
    }
  }
  flushPara();
  return out.join("\n");
}

function formatMoney(
  amount: number,
  currency: string,
  language: string
): string {
  const locale =
    language === "fr"
      ? "fr-FR"
      : language === "es"
        ? "es-ES"
        : language === "pt"
          ? "pt-PT"
          : language === "de"
            ? "de-DE"
            : language === "it"
              ? "it-IT"
              : language === "nl"
                ? "nl-NL"
                : "en-GB";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

// =======================================================================
// Renderer
// =======================================================================

export interface RenderHtmlArgs {
  copy: PageCopy;
  project: Project;
  companyProfile: CompanyProfile;
  legalTexts: LegalTexts;
}

export function renderHtml(args: RenderHtmlArgs): string {
  const { copy, project, companyProfile: p, legalTexts } = args;
  const checkoutUrl = project.checkoutUrl || "#checkout";
  const fullAddress = formatFullAddress(p);
  const year = new Date().getFullYear();
  const priceLabel = copy.offer.price || formatMoney(project.priceGross, project.currency, copy.language);

  const digistoreBadge = (variant: "hero" | "footer") => {
    const cls =
      variant === "hero"
        ? "inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur"
        : "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700";
    return `<div class="${cls}"><i data-lucide="shield-check" class="h-3.5 w-3.5 text-indigo-600"></i><span>${escapeHtml(copy.offer.digistoreNote || "Secure payment by Digistore24")}</span></div>`;
  };

  // ---------- Hero ----------
  const heroSection = `
  <section class="relative overflow-hidden min-h-[92vh] flex items-center justify-center px-4 py-24">
    <div class="absolute inset-0 gradient-bg"></div>
    <div class="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"></div>
    <div class="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-slate-200/60 blur-3xl"></div>
    <div class="relative z-10 max-w-4xl mx-auto text-center">
      <div class="mb-6 flex justify-center">
        <span class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 backdrop-blur">
          ${escapeHtml(copy.hero.eyebrow)}
        </span>
      </div>
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
        ${escapeHtml(copy.hero.headline)}
      </h1>
      <p class="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
        ${escapeHtml(copy.hero.subheadline)}
      </p>
      <div class="flex flex-col items-center gap-4">
        <a href="${escapeAttr(checkoutUrl)}" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 hover:shadow-indigo-600/40">
          ${escapeHtml(copy.hero.ctaLabel)}
          <i data-lucide="arrow-right" class="h-5 w-5"></i>
        </a>
        ${digistoreBadge("hero")}
      </div>
      <div class="mt-16 flex justify-center">
        <a href="#problem" class="text-slate-400 hover:text-slate-600 transition">
          <i data-lucide="chevron-down" class="h-8 w-8 animate-bounce"></i>
        </a>
      </div>
    </div>
  </section>`;

  // ---------- Problem ----------
  const problemSection = `
  <section id="problem" class="bg-slate-50 py-24 px-4">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-8">${escapeHtml(copy.problem.title)}</h2>
      ${copy.problem.paragraphs.map((para) => `<p class="text-lg text-slate-700 mb-5 leading-relaxed">${escapeHtml(para)}</p>`).join("")}
    </div>
  </section>`;

  // ---------- Solution ----------
  const solutionSection = `
  <section class="py-24 px-4 bg-white">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-6">${escapeHtml(copy.solution.title)}</h2>
        <p class="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">${escapeHtml(copy.solution.description)}</p>
      </div>
      <ul class="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        ${copy.solution.bulletPoints
          .map(
            (b) => `
          <li class="flex items-start gap-3 glass rounded-lg p-4">
            <i data-lucide="check-circle-2" class="h-5 w-5 text-indigo-600 shrink-0 mt-0.5"></i>
            <span class="text-slate-800">${escapeHtml(b)}</span>
          </li>`
          )
          .join("")}
      </ul>
    </div>
  </section>`;

  // ---------- Features ----------
  const featuresSection = `
  <section class="py-24 px-4 gradient-bg">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-14">${escapeHtml(copy.features.title)}</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${copy.features.items
          .map(
            (f) => `
          <div class="glass rounded-2xl p-6 hover:shadow-lg transition">
            <div class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
              <i data-lucide="${escapeAttr(lucideSlug(f.icon))}" class="h-6 w-6"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">${escapeHtml(f.title)}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(f.description)}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>`;

  // ---------- Social Proof ----------
  const socialProofSection = `
  <section class="py-24 px-4 bg-white">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-14">${escapeHtml(copy.socialProof.title)}</h2>
      <div class="grid md:grid-cols-3 gap-6">
        ${copy.socialProof.testimonials
          .map(
            (t) => `
          <div class="glass rounded-2xl p-6">
            <div class="mb-3 flex gap-0.5 text-amber-400">
              ${Array(5).fill('<i data-lucide="star" class="h-4 w-4 fill-current"></i>').join("")}
            </div>
            <p class="text-slate-700 leading-relaxed mb-4 italic">"${escapeHtml(t.text)}"</p>
            <div class="border-t border-slate-200 pt-4">
              <p class="font-semibold text-slate-900">${escapeHtml(t.name)}</p>
              <p class="text-sm text-slate-500">${escapeHtml(t.location)}</p>
              <p class="mt-2 text-xs italic text-slate-400">${escapeHtml(t.disclaimer)}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>`;

  // ---------- Offer ----------
  const offerSection = `
  <section class="py-24 px-4 gradient-bg">
    <div class="max-w-3xl mx-auto">
      <div class="glass rounded-3xl p-8 md:p-12 shadow-xl">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">${escapeHtml(copy.offer.title)}</h2>
        <ul class="space-y-3 mb-8">
          ${copy.offer.items
            .map(
              (it) => `
            <li class="flex items-start gap-3">
              <i data-lucide="check" class="h-5 w-5 text-indigo-600 shrink-0 mt-0.5"></i>
              <span class="text-slate-800">${escapeHtml(it)}</span>
            </li>`
            )
            .join("")}
        </ul>
        <div class="text-center border-t border-slate-200 pt-8">
          <div class="text-5xl md:text-6xl font-extrabold text-slate-900 mb-2">${escapeHtml(priceLabel)}</div>
          <p class="text-sm text-slate-500 mb-8">${escapeHtml(copy.offer.priceNote)}</p>
          <a href="${escapeAttr(checkoutUrl)}" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700">
            ${escapeHtml(copy.offer.ctaLabel)}
            <i data-lucide="arrow-right" class="h-5 w-5"></i>
          </a>
          <p class="mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
            <i data-lucide="lock" class="h-3.5 w-3.5"></i>
            <span>${escapeHtml(copy.offer.digistoreNote)}</span>
          </p>
        </div>
      </div>
    </div>
  </section>`;

  // ---------- Guarantee ----------
  const guaranteeSection = `
  <section class="py-20 px-4 bg-white">
    <div class="max-w-3xl mx-auto text-center">
      <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
        <i data-lucide="shield-check" class="h-10 w-10"></i>
      </div>
      <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-4">${escapeHtml(copy.guarantee.title)}</h2>
      <p class="text-lg text-slate-700 leading-relaxed">${escapeHtml(copy.guarantee.description)}</p>
    </div>
  </section>`;

  // ---------- FAQ ----------
  const faqSection = `
  <section class="py-24 px-4 bg-slate-50">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">${escapeHtml(copy.faq.title)}</h2>
      <div class="space-y-3">
        ${copy.faq.items
          .map(
            (q) => `
          <details class="group glass rounded-xl overflow-hidden">
            <summary class="flex items-center justify-between p-5 cursor-pointer hover:bg-white/50 transition">
              <span class="font-semibold text-slate-900 pr-4">${escapeHtml(q.question)}</span>
              <i data-lucide="chevron-down" class="h-5 w-5 text-slate-400 group-open:rotate-180 transition shrink-0"></i>
            </summary>
            <div class="px-5 pb-5 text-slate-700 leading-relaxed">${escapeHtml(q.answer)}</div>
          </details>`
          )
          .join("")}
      </div>
    </div>
  </section>`;

  // ---------- Closing CTA ----------
  const closingSection = `
  <section class="py-24 px-4 bg-white">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">${escapeHtml(copy.closingCta.title)}</h2>
      <p class="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">${escapeHtml(copy.closingCta.subtitle)}</p>
      <a href="${escapeAttr(checkoutUrl)}" class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700">
        ${escapeHtml(copy.closingCta.ctaLabel)}
        <i data-lucide="arrow-right" class="h-5 w-5"></i>
      </a>
    </div>
  </section>`;

  // ---------- Disclaimer Block (visible, not modal) ----------
  const disclaimerBlock = (() => {
    const texts: string[] = [];
    if (legalTexts.medicalDisclaimer) texts.push(legalTexts.medicalDisclaimer);
    if (legalTexts.earningsDisclaimer) texts.push(legalTexts.earningsDisclaimer);
    if (texts.length === 0) return "";
    return `
  <section class="py-16 px-4 bg-slate-100 border-t border-slate-200">
    <div class="max-w-3xl mx-auto">
      <div class="space-y-8">
        ${texts
          .map(
            (t) => `
          <div class="text-sm text-slate-600 leading-relaxed">
            ${markdownToHtml(t)}
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>`;
  })();

  // ---------- Modals ----------
  const legalModal = (id: string, title: string, md: string) => `
  <dialog id="${id}" class="glass-modal">
    <div class="p-6 overflow-y-auto max-h-[85vh]">
      <div class="flex items-center justify-between mb-4 sticky top-0 bg-white/95 backdrop-blur py-2 -mt-2 -mx-2 px-2">
        <h3 class="text-xl font-bold text-slate-900">${escapeHtml(title)}</h3>
        <button onclick="closeModal('${id}')" class="text-slate-400 hover:text-slate-700" aria-label="Fermer">
          <i data-lucide="x" class="h-5 w-5"></i>
        </button>
      </div>
      <div class="prose prose-sm max-w-none">
        ${markdownToHtml(md)}
      </div>
    </div>
  </dialog>`;

  const modalLabels = labelsForLang(copy.language);

  // ---------- Footer ----------
  const footerSection = `
  <footer class="bg-slate-900 text-slate-300 py-12 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="grid md:grid-cols-3 gap-10 mb-10">
        <div>
          <h4 class="text-white font-semibold mb-3">${escapeHtml(p.tradingName || p.legalName)}</h4>
          <p class="text-sm leading-relaxed">
            ${escapeHtml(p.legalName)}<br>
            ${escapeHtml(p.taxIdType)}: ${escapeHtml(p.taxIdNumber)}<br>
            ${escapeHtml(fullAddress)}
          </p>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-3">${escapeHtml(modalLabels.contactTitle)}</h4>
          <p class="text-sm">
            <a href="mailto:${escapeAttr(p.supportEmail || p.contactEmail)}" class="hover:text-white">
              ${escapeHtml(p.supportEmail || p.contactEmail)}
            </a>
          </p>
          <div class="mt-4">${digistoreBadge("footer")}</div>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-3">${escapeHtml(modalLabels.legalTitle)}</h4>
          <ul class="space-y-2 text-sm">
            <li><button onclick="openModal('modal-mentions')" class="hover:text-white text-left">${escapeHtml(modalLabels.mentions)}</button></li>
            <li><button onclick="openModal('modal-privacy')" class="hover:text-white text-left">${escapeHtml(modalLabels.privacy)}</button></li>
            <li><button onclick="openModal('modal-terms')" class="hover:text-white text-left">${escapeHtml(modalLabels.terms)}</button></li>
            <li><button onclick="openModal('modal-refund')" class="hover:text-white text-left">${escapeHtml(modalLabels.refund)}</button></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        © ${year} ${escapeHtml(p.legalName)}. ${escapeHtml(modalLabels.rights)}
      </div>
    </div>
  </footer>`;

  return `<!DOCTYPE html>
<html lang="${escapeAttr(copy.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <title>${escapeHtml(copy.meta.title)}</title>
  <meta name="description" content="${escapeAttr(copy.meta.description)}">
  <meta property="og:title" content="${escapeAttr(copy.meta.title)}">
  <meta property="og:description" content="${escapeAttr(copy.meta.description)}">
  <meta property="og:type" content="website">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    .glass {
      backdrop-filter: blur(20px);
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .gradient-bg {
      background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%);
    }
    details > summary { list-style: none; cursor: pointer; }
    details > summary::-webkit-details-marker { display: none; }
    dialog.glass-modal {
      padding: 0;
      border: none;
      border-radius: 16px;
      max-width: 720px;
      width: 92%;
      max-height: 85vh;
      background: rgba(255,255,255,0.98);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    dialog.glass-modal::backdrop {
      background: rgba(15,23,42,0.55);
      backdrop-filter: blur(6px);
    }
    [data-lucide] { display: inline-block; }
  </style>
</head>
<body class="bg-white text-slate-900 antialiased">

  ${heroSection}
  ${problemSection}
  ${solutionSection}
  ${featuresSection}
  ${socialProofSection}
  ${offerSection}
  ${guaranteeSection}
  ${faqSection}
  ${closingSection}
  ${disclaimerBlock}
  ${footerSection}

  ${legalModal("modal-mentions", modalLabels.mentions, legalTexts.mentionsLegales)}
  ${legalModal("modal-privacy", modalLabels.privacy, legalTexts.privacyPolicy)}
  ${legalModal("modal-terms", modalLabels.terms, legalTexts.terms)}
  ${legalModal("modal-refund", modalLabels.refund, legalTexts.refundPolicy)}

  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <script>
    if (window.lucide) window.lucide.createIcons();
    function openModal(id) {
      var d = document.getElementById(id);
      if (d && typeof d.showModal === 'function') d.showModal();
    }
    function closeModal(id) {
      var d = document.getElementById(id);
      if (d && typeof d.close === 'function') d.close();
    }
  </script>
</body>
</html>`;
}

// Normalize lucide icon names: allow "BookOpen" → "book-open"
function lucideSlug(name: string): string {
  if (!name) return "check";
  // already kebab-case
  if (/^[a-z0-9-]+$/.test(name)) return name;
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

interface FooterLabels {
  mentions: string;
  privacy: string;
  terms: string;
  refund: string;
  contactTitle: string;
  legalTitle: string;
  rights: string;
}

function labelsForLang(lang: string): FooterLabels {
  switch (lang) {
    case "fr":
      return {
        mentions: "Mentions Légales",
        privacy: "Politique de Confidentialité",
        terms: "CGV",
        refund: "Politique de Remboursement",
        contactTitle: "Contact",
        legalTitle: "Informations Légales",
        rights: "Tous droits réservés.",
      };
    case "es":
      return {
        mentions: "Aviso Legal",
        privacy: "Política de Privacidad",
        terms: "Condiciones de Venta",
        refund: "Política de Reembolso",
        contactTitle: "Contacto",
        legalTitle: "Información Legal",
        rights: "Todos los derechos reservados.",
      };
    case "pt":
      return {
        mentions: "Avisos Legais",
        privacy: "Política de Privacidade",
        terms: "Condições de Venda",
        refund: "Política de Reembolso",
        contactTitle: "Contacto",
        legalTitle: "Informação Legal",
        rights: "Todos os direitos reservados.",
      };
    case "de":
      return {
        mentions: "Impressum",
        privacy: "Datenschutz",
        terms: "AGB",
        refund: "Rückerstattung",
        contactTitle: "Kontakt",
        legalTitle: "Rechtliches",
        rights: "Alle Rechte vorbehalten.",
      };
    case "it":
      return {
        mentions: "Note Legali",
        privacy: "Privacy",
        terms: "Termini di Vendita",
        refund: "Rimborso",
        contactTitle: "Contatti",
        legalTitle: "Informazioni Legali",
        rights: "Tutti i diritti riservati.",
      };
    case "nl":
      return {
        mentions: "Juridische kennisgeving",
        privacy: "Privacybeleid",
        terms: "Algemene voorwaarden",
        refund: "Terugbetalingsbeleid",
        contactTitle: "Contact",
        legalTitle: "Juridisch",
        rights: "Alle rechten voorbehouden.",
      };
    default:
      return {
        mentions: "Legal Notice",
        privacy: "Privacy Policy",
        terms: "Terms of Sale",
        refund: "Refund Policy",
        contactTitle: "Contact",
        legalTitle: "Legal",
        rights: "All rights reserved.",
      };
  }
}
