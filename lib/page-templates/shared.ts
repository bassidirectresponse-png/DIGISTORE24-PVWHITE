// Shared helpers used across all template variants.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function formatMoney(
  amount: number,
  currency: string,
  language: string
): string {
  const locale = localeFor(language);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function localeFor(lang: string): string {
  switch (lang) {
    case "fr":
      return "fr-FR";
    case "es":
      return "es-ES";
    case "pt":
      return "pt-PT";
    case "de":
      return "de-DE";
    case "it":
      return "it-IT";
    case "nl":
      return "nl-NL";
    default:
      return "en-GB";
  }
}

export function daysLabel(lang: string, days: number): string {
  switch (lang) {
    case "fr":
      return `${days} jours`;
    case "es":
      return `${days} días`;
    case "pt":
      return `${days} dias`;
    case "de":
      return `${days} Tage`;
    case "it":
      return `${days} giorni`;
    case "nl":
      return `${days} dagen`;
    default:
      return `${days} days`;
  }
}

export interface Labels {
  problem: string;
  solution: string;
  features: string;
  testimonials: string;
  offer: string;
  faq: string;
  mentions: string;
  privacy: string;
  terms: string;
  refund: string;
  contactTitle: string;
  legalTitle: string;
  rights: string;
  close: string;
  securePayment: string;
}

export function labelsForLang(lang: string): Labels {
  switch (lang) {
    case "fr":
      return {
        problem: "Le contexte",
        solution: "L'approche",
        features: "Ce qui est inclus",
        testimonials: "Témoignages",
        offer: "L'offre",
        faq: "Questions fréquentes",
        mentions: "Mentions Légales",
        privacy: "Politique de Confidentialité",
        terms: "CGV",
        refund: "Politique de Remboursement",
        contactTitle: "Contact",
        legalTitle: "Informations légales",
        rights: "Tous droits réservés.",
        close: "Fermer",
        securePayment: "Paiement sécurisé par Digistore24",
      };
    case "es":
      return {
        problem: "El contexto",
        solution: "El enfoque",
        features: "Lo que incluye",
        testimonials: "Testimonios",
        offer: "La oferta",
        faq: "Preguntas frecuentes",
        mentions: "Aviso Legal",
        privacy: "Política de Privacidad",
        terms: "Condiciones de venta",
        refund: "Política de Reembolso",
        contactTitle: "Contacto",
        legalTitle: "Información legal",
        rights: "Todos los derechos reservados.",
        close: "Cerrar",
        securePayment: "Pago seguro con Digistore24",
      };
    case "pt":
      return {
        problem: "O contexto",
        solution: "A abordagem",
        features: "O que está incluído",
        testimonials: "Testemunhos",
        offer: "A oferta",
        faq: "Perguntas frequentes",
        mentions: "Avisos Legais",
        privacy: "Política de Privacidade",
        terms: "Condições de Venda",
        refund: "Política de Reembolso",
        contactTitle: "Contacto",
        legalTitle: "Informação legal",
        rights: "Todos os direitos reservados.",
        close: "Fechar",
        securePayment: "Pagamento seguro por Digistore24",
      };
    case "de":
      return {
        problem: "Der Kontext",
        solution: "Der Ansatz",
        features: "Im Paket enthalten",
        testimonials: "Erfahrungen",
        offer: "Das Angebot",
        faq: "Häufige Fragen",
        mentions: "Impressum",
        privacy: "Datenschutz",
        terms: "AGB",
        refund: "Rückerstattung",
        contactTitle: "Kontakt",
        legalTitle: "Rechtliches",
        rights: "Alle Rechte vorbehalten.",
        close: "Schließen",
        securePayment: "Sichere Zahlung via Digistore24",
      };
    case "it":
      return {
        problem: "Il contesto",
        solution: "L'approccio",
        features: "Cosa è incluso",
        testimonials: "Testimonianze",
        offer: "L'offerta",
        faq: "Domande frequenti",
        mentions: "Note Legali",
        privacy: "Privacy",
        terms: "Termini di vendita",
        refund: "Rimborso",
        contactTitle: "Contatti",
        legalTitle: "Informazioni legali",
        rights: "Tutti i diritti riservati.",
        close: "Chiudi",
        securePayment: "Pagamento sicuro tramite Digistore24",
      };
    case "nl":
      return {
        problem: "De context",
        solution: "De aanpak",
        features: "Wat is inbegrepen",
        testimonials: "Ervaringen",
        offer: "Het aanbod",
        faq: "Veelgestelde vragen",
        mentions: "Juridische kennisgeving",
        privacy: "Privacybeleid",
        terms: "Algemene voorwaarden",
        refund: "Terugbetalingsbeleid",
        contactTitle: "Contact",
        legalTitle: "Juridisch",
        rights: "Alle rechten voorbehouden.",
        close: "Sluiten",
        securePayment: "Veilige betaling via Digistore24",
      };
    default:
      return {
        problem: "The context",
        solution: "The approach",
        features: "What's included",
        testimonials: "Testimonials",
        offer: "The offer",
        faq: "Frequently asked",
        mentions: "Legal Notice",
        privacy: "Privacy Policy",
        terms: "Terms of Sale",
        refund: "Refund Policy",
        contactTitle: "Contact",
        legalTitle: "Legal",
        rights: "All rights reserved.",
        close: "Close",
        securePayment: "Secure payment by Digistore24",
      };
  }
}

// Minimal markdown → HTML (headings, bold, links, paragraphs, bullets).
export function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let para: string[] = [];
  let inList = false;

  const inline = (t: string): string =>
    escapeHtml(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /(https?:\/\/[^\s)]+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
      );

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join(" ").trim();
      if (text) out.push(`<p>${inline(text)}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      closeList();
      out.push(`<h2>${inline(line.slice(2))}</h2>`);
    } else if (line.startsWith("## ")) {
      flushPara();
      closeList();
      out.push(`<h3>${inline(line.slice(3))}</h3>`);
    } else if (line.startsWith("- ")) {
      flushPara();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else {
      if (inList) closeList();
      para.push(line);
    }
  }
  flushPara();
  closeList();
  return out.join("\n");
}

// Wrap body in a full HTML doc for standalone mode.
export function wrapStandalone(args: {
  lang: string;
  title: string;
  description: string;
  bodyBg: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="${escapeAttr(args.lang)}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">
<title>${escapeHtml(args.title)}</title>
<meta name="description" content="${escapeAttr(args.description)}">
<meta property="og:title" content="${escapeAttr(args.title)}">
<meta property="og:description" content="${escapeAttr(args.description)}">
<meta property="og:type" content="website">
</head>
<body style="margin:0;padding:0;background:${args.bodyBg}">
${args.body}
</body>
</html>`;
}

// Deterministic pick based on project.id — same project always gets same variant.
// djb2 string hash.
export function hashPick<T>(seed: string, options: readonly T[]): T {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % options.length;
  return options[idx]!;
}
