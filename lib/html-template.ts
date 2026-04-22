import type { CompanyProfile, Project } from "@prisma/client";
import type { PageCopy } from "./schemas";
import type { LegalTexts } from "./legal-templates";
import { formatFullAddress } from "./legal-templates";

// =======================================================================
// Public API
// =======================================================================

export type RenderMode = "standalone" | "embed";

export interface RenderHtmlArgs {
  copy: PageCopy;
  project: Project;
  companyProfile: CompanyProfile;
  legalTexts: LegalTexts;
  mode?: RenderMode;
}

export function renderHtml(args: RenderHtmlArgs): string {
  const mode = args.mode ?? "standalone";
  const body = renderBody(args);

  if (mode === "embed") {
    return body;
  }

  const { copy } = args;
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
</head>
<body style="margin:0;padding:0;background:#faf8f4">
${body}
</body>
</html>`;
}

// =======================================================================
// Body renderer (produces .dsf-page wrapper with scoped styles)
// =======================================================================

function renderBody(args: RenderHtmlArgs): string {
  const { copy, project, companyProfile: p, legalTexts } = args;
  const checkoutUrl = project.checkoutUrl || "#offer";
  const fullAddress = formatFullAddress(p);
  const year = new Date().getFullYear();
  const lang = copy.language;
  const L = labelsForLang(lang);
  const priceLabel =
    copy.offer.price || formatMoney(project.priceGross, project.currency, lang);

  // Sections — ordered
  const sections = [
    heroSection(copy, checkoutUrl, L),
    problemSection(copy, L),
    solutionSection(copy, L),
    featuresSection(copy, L),
    socialProofSection(copy, L),
    offerSection(copy, checkoutUrl, priceLabel, L),
    guaranteeSection(copy, project.guaranteeDays),
    faqSection(copy, L),
    closingSection(copy, checkoutUrl, L),
    disclaimerBlock(legalTexts),
    footerSection(p, fullAddress, year, L),
  ].join("\n");

  const modals = [
    legalModal("modal-mentions", L.mentions, legalTexts.mentionsLegales, L),
    legalModal("modal-privacy", L.privacy, legalTexts.privacyPolicy, L),
    legalModal("modal-terms", L.terms, legalTexts.terms, L),
    legalModal("modal-refund", L.refund, legalTexts.refundPolicy, L),
  ].join("\n");

  return `<style>${scopedCss()}</style>
<div class="dsf-page">
${sections}
${modals}
</div>`;
}

// =======================================================================
// Sections
// =======================================================================

function heroSection(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="dsf-hero">
  <div class="dsf-wrap">
    <div class="dsf-label">${escapeHtml(c.hero.eyebrow)}</div>
    <h1 class="dsf-display dsf-hero-headline">${escapeHtml(c.hero.headline)}</h1>
    <p class="dsf-prose dsf-hero-sub">${escapeHtml(c.hero.subheadline)}</p>
    <div class="dsf-hero-ctarow">
      <a href="${escapeAttr(ctaUrl)}" class="dsf-btn dsf-btn-primary">
        ${escapeHtml(c.hero.ctaLabel)}
        ${SVG_ARROW}
      </a>
      <div class="dsf-trust">
        ${SVG_LOCK}
        <span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span>
      </div>
    </div>
  </div>
</section>`;
}

function problemSection(c: PageCopy, L: Labels): string {
  const paras = c.problem.paragraphs
    .map((p) => `<p class="dsf-prose dsf-body">${escapeHtml(p)}</p>`)
    .join("");
  return `
<section class="dsf-section dsf-problem">
  <div class="dsf-wrap">
    <div class="dsf-sectionhead">
      <span class="dsf-sectionnum">01</span>
      <span class="dsf-label">${escapeHtml(L.problem)}</span>
    </div>
    <h2 class="dsf-display dsf-h2">${escapeHtml(c.problem.title)}</h2>
    <div class="dsf-problem-body">
      ${paras}
    </div>
  </div>
</section>`;
}

function solutionSection(c: PageCopy, L: Labels): string {
  const bullets = c.solution.bulletPoints
    .map(
      (b, i) => `
      <li>
        <span class="dsf-numlist-n">${String(i + 1).padStart(2, "0")}</span>
        <span class="dsf-numlist-text dsf-prose">${escapeHtml(b)}</span>
      </li>`
    )
    .join("");
  return `
<section class="dsf-section dsf-solution">
  <div class="dsf-wrap">
    <div class="dsf-sectionhead">
      <span class="dsf-sectionnum">02</span>
      <span class="dsf-label">${escapeHtml(L.solution)}</span>
    </div>
    <div class="dsf-split">
      <h2 class="dsf-display dsf-h2">${escapeHtml(c.solution.title)}</h2>
      <p class="dsf-prose dsf-body">${escapeHtml(c.solution.description)}</p>
    </div>
    <ul class="dsf-numlist">${bullets}</ul>
  </div>
</section>`;
}

function featuresSection(c: PageCopy, L: Labels): string {
  const items = c.features.items
    .map(
      (f, i) => `
    <div class="dsf-feature">
      <div class="dsf-feature-n dsf-display">${String(i + 1).padStart(2, "0")}</div>
      <h3 class="dsf-feature-t">${escapeHtml(f.title)}</h3>
      <p class="dsf-prose dsf-feature-d">${escapeHtml(f.description)}</p>
    </div>`
    )
    .join("");
  return `
<section class="dsf-section dsf-features">
  <div class="dsf-wrap">
    <div class="dsf-sectionhead">
      <span class="dsf-sectionnum">03</span>
      <span class="dsf-label">${escapeHtml(L.features)}</span>
    </div>
    <h2 class="dsf-display dsf-h2">${escapeHtml(c.features.title)}</h2>
    <div class="dsf-feature-grid">${items}</div>
  </div>
</section>`;
}

function socialProofSection(c: PageCopy, L: Labels): string {
  const [featured, ...rest] = c.socialProof.testimonials;
  if (!featured) return "";
  const featBlock = `
    <figure class="dsf-testimonial-featured">
      <blockquote class="dsf-display dsf-testimonial-quote">“${escapeHtml(featured.text)}”</blockquote>
      <figcaption class="dsf-testimonial-caption">
        <div class="dsf-testimonial-avatar">${initials(featured.name)}</div>
        <div>
          <div class="dsf-testimonial-name">${escapeHtml(featured.name)}</div>
          <div class="dsf-testimonial-loc">${escapeHtml(featured.location)}</div>
        </div>
      </figcaption>
      <p class="dsf-testimonial-disc">${escapeHtml(featured.disclaimer)}</p>
    </figure>`;
  const restBlock = rest
    .map(
      (t) => `
      <figure class="dsf-testimonial-sm">
        <blockquote class="dsf-prose dsf-testimonial-smquote">“${escapeHtml(t.text)}”</blockquote>
        <figcaption class="dsf-testimonial-smcap">
          <span class="dsf-testimonial-name">${escapeHtml(t.name)}</span>
          <span class="dsf-testimonial-dot">·</span>
          <span class="dsf-testimonial-loc">${escapeHtml(t.location)}</span>
        </figcaption>
        <p class="dsf-testimonial-disc">${escapeHtml(t.disclaimer)}</p>
      </figure>`
    )
    .join("");
  return `
<section class="dsf-section dsf-social">
  <div class="dsf-wrap">
    <div class="dsf-sectionhead">
      <span class="dsf-sectionnum">04</span>
      <span class="dsf-label">${escapeHtml(L.testimonials)}</span>
    </div>
    <h2 class="dsf-display dsf-h2">${escapeHtml(c.socialProof.title)}</h2>
    ${featBlock}
    ${rest.length ? `<div class="dsf-testimonial-grid">${restBlock}</div>` : ""}
  </div>
</section>`;
}

function offerSection(
  c: PageCopy,
  ctaUrl: string,
  priceLabel: string,
  L: Labels
): string {
  const items = c.offer.items
    .map(
      (it) => `
      <li>
        <span class="dsf-offer-mark">—</span>
        <span class="dsf-prose">${escapeHtml(it)}</span>
      </li>`
    )
    .join("");
  return `
<section class="dsf-section dsf-offer" id="offer">
  <div class="dsf-wrap dsf-offer-wrap">
    <div class="dsf-sectionhead dsf-center">
      <span class="dsf-sectionnum">05</span>
      <span class="dsf-label">${escapeHtml(L.offer)}</span>
    </div>
    <h2 class="dsf-display dsf-h2 dsf-center">${escapeHtml(c.offer.title)}</h2>
    <div class="dsf-offer-card">
      <ul class="dsf-offer-list">${items}</ul>
      <div class="dsf-offer-divider"></div>
      <div class="dsf-offer-price-block">
        <div class="dsf-offer-pricerule"></div>
        <div class="dsf-offer-price dsf-display">${escapeHtml(priceLabel)}</div>
        <div class="dsf-offer-pricenote">${escapeHtml(c.offer.priceNote)}</div>
      </div>
      <a href="${escapeAttr(ctaUrl)}" class="dsf-btn dsf-btn-primary dsf-btn-lg">
        ${escapeHtml(c.offer.ctaLabel)}
        ${SVG_ARROW}
      </a>
      <div class="dsf-offer-digistore">
        ${SVG_LOCK}
        <span>${escapeHtml(c.offer.digistoreNote)}</span>
      </div>
    </div>
  </div>
</section>`;
}

function guaranteeSection(c: PageCopy, days: number): string {
  return `
<section class="dsf-section dsf-guarantee">
  <div class="dsf-wrap dsf-center">
    <div class="dsf-guarantee-seal">
      <div class="dsf-guarantee-days dsf-display">${days}</div>
      <div class="dsf-guarantee-sublabel dsf-label">${escapeHtml(daysLabel(c.language, days))}</div>
    </div>
    <h2 class="dsf-display dsf-h3">${escapeHtml(c.guarantee.title)}</h2>
    <p class="dsf-prose dsf-body dsf-center-p">${escapeHtml(c.guarantee.description)}</p>
  </div>
</section>`;
}

function faqSection(c: PageCopy, L: Labels): string {
  const items = c.faq.items
    .map(
      (q) => `
    <details class="dsf-faq-item">
      <summary>
        <span>${escapeHtml(q.question)}</span>
        <span class="dsf-faq-icon"></span>
      </summary>
      <div class="dsf-faq-answer dsf-prose">${escapeHtml(q.answer)}</div>
    </details>`
    )
    .join("");
  return `
<section class="dsf-section dsf-faq">
  <div class="dsf-wrap">
    <div class="dsf-sectionhead">
      <span class="dsf-sectionnum">06</span>
      <span class="dsf-label">${escapeHtml(L.faq)}</span>
    </div>
    <h2 class="dsf-display dsf-h2">${escapeHtml(c.faq.title)}</h2>
    <div class="dsf-faq-list">${items}</div>
  </div>
</section>`;
}

function closingSection(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="dsf-section dsf-closing">
  <div class="dsf-wrap dsf-center">
    <h2 class="dsf-display dsf-h2-lg">${escapeHtml(c.closingCta.title)}</h2>
    <p class="dsf-prose dsf-body dsf-center-p">${escapeHtml(c.closingCta.subtitle)}</p>
    <a href="${escapeAttr(ctaUrl)}" class="dsf-btn dsf-btn-primary dsf-btn-lg">
      ${escapeHtml(c.closingCta.ctaLabel)}
      ${SVG_ARROW}
    </a>
    <div class="dsf-trust dsf-trust-center">
      ${SVG_LOCK}
      <span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span>
    </div>
  </div>
</section>`;
}

function disclaimerBlock(lt: LegalTexts): string {
  const texts: string[] = [];
  if (lt.medicalDisclaimer) texts.push(lt.medicalDisclaimer);
  if (lt.earningsDisclaimer) texts.push(lt.earningsDisclaimer);
  if (texts.length === 0) return "";
  const blocks = texts
    .map((t) => `<div class="dsf-disc-block">${markdownToHtml(t)}</div>`)
    .join("");
  return `
<section class="dsf-disc">
  <div class="dsf-wrap">${blocks}</div>
</section>`;
}

function footerSection(
  p: CompanyProfile,
  fullAddress: string,
  year: number,
  L: Labels
): string {
  return `
<footer class="dsf-footer">
  <div class="dsf-wrap dsf-footer-grid">
    <div class="dsf-footer-col">
      <div class="dsf-footer-brand dsf-display">${escapeHtml(p.tradingName || p.legalName)}</div>
      <p class="dsf-footer-meta">
        ${escapeHtml(p.legalName)}<br>
        ${escapeHtml(p.taxIdType)}: ${escapeHtml(p.taxIdNumber)}<br>
        ${escapeHtml(fullAddress)}
      </p>
    </div>
    <div class="dsf-footer-col">
      <div class="dsf-label">${escapeHtml(L.contactTitle)}</div>
      <p class="dsf-footer-meta">
        <a href="mailto:${escapeAttr(p.supportEmail || p.contactEmail)}">
          ${escapeHtml(p.supportEmail || p.contactEmail)}
        </a>
      </p>
      <div class="dsf-footer-badge">
        ${SVG_LOCK}
        <span>${escapeHtml(L.securePayment)}</span>
      </div>
    </div>
    <div class="dsf-footer-col">
      <div class="dsf-label">${escapeHtml(L.legalTitle)}</div>
      <ul class="dsf-footer-legal">
        <li><a href="#modal-mentions">${escapeHtml(L.mentions)}</a></li>
        <li><a href="#modal-privacy">${escapeHtml(L.privacy)}</a></li>
        <li><a href="#modal-terms">${escapeHtml(L.terms)}</a></li>
        <li><a href="#modal-refund">${escapeHtml(L.refund)}</a></li>
      </ul>
    </div>
  </div>
  <div class="dsf-footer-bottom">
    <div class="dsf-wrap">© ${year} ${escapeHtml(p.legalName)}. ${escapeHtml(L.rights)}</div>
  </div>
</footer>`;
}

function legalModal(
  id: string,
  title: string,
  md: string,
  L: Labels
): string {
  return `
<div id="${id}" class="dsf-modal" role="dialog" aria-modal="true" aria-labelledby="${id}-t">
  <a href="#" class="dsf-modal-backdrop" aria-label="${escapeAttr(L.close)}"></a>
  <div class="dsf-modal-inner" role="document">
    <div class="dsf-modal-head">
      <h3 class="dsf-display dsf-modal-title" id="${id}-t">${escapeHtml(title)}</h3>
      <a href="#" class="dsf-modal-close" aria-label="${escapeAttr(L.close)}">×</a>
    </div>
    <div class="dsf-modal-body">${markdownToHtml(md)}</div>
  </div>
</div>`;
}

// =======================================================================
// Inline SVGs (minimal, editorial)
// =======================================================================

const SVG_ARROW = `<svg class="dsf-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const SVG_LOCK = `<svg class="dsf-icon-sm" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

// =======================================================================
// Scoped CSS
// =======================================================================

function scopedCss(): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

.dsf-page, .dsf-modal {
  --dsf-ink: #1a1815;
  --dsf-ink-2: #3a3730;
  --dsf-muted: #6b6760;
  --dsf-cream: #faf8f4;
  --dsf-cream-2: #f4f1ea;
  --dsf-sage: #ebe7dd;
  --dsf-rule: #d6d1c4;
  --dsf-accent: #b4653f;
  --dsf-accent-hover: #8e4d2f;
  --dsf-max: 1120px;
  --dsf-radius: 2px;
}
.dsf-page { color: var(--dsf-ink); background: var(--dsf-cream); font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.55; font-size: 16px; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; scroll-behavior: smooth; }
.dsf-page *, .dsf-page *::before, .dsf-page *::after, .dsf-modal *, .dsf-modal *::before, .dsf-modal *::after { box-sizing: border-box; }
.dsf-page p { margin: 0 0 1em; }
.dsf-page ul { margin: 0; padding: 0; }
.dsf-page a { color: inherit; text-decoration: none; }
.dsf-page img, .dsf-page svg { display: inline-block; vertical-align: middle; }
.dsf-page figure { margin: 0; }

.dsf-wrap { max-width: var(--dsf-max); margin: 0 auto; padding: 0 28px; }
.dsf-section { padding: 120px 0; border-top: 1px solid var(--dsf-rule); }
.dsf-center { text-align: center; }
.dsf-center-p { max-width: 640px; margin-left: auto; margin-right: auto; }

.dsf-display { font-family: 'Instrument Serif', 'Iowan Old Style', 'Apple Garamond', Georgia, serif; font-weight: 400; letter-spacing: -0.005em; line-height: 1.08; }
.dsf-prose { font-family: 'Lora', 'Iowan Old Style', Georgia, serif; font-weight: 400; }
.dsf-body { font-size: 18px; line-height: 1.7; color: var(--dsf-ink-2); }

.dsf-label { display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: var(--dsf-muted); }

.dsf-h2 { font-size: clamp(36px, 4.5vw, 60px); margin: 24px 0 56px; max-width: 24ch; }
.dsf-h2-lg { font-size: clamp(42px, 6vw, 80px); margin: 0 0 28px; max-width: 18ch; margin-left: auto; margin-right: auto; }
.dsf-h3 { font-size: clamp(28px, 3.2vw, 40px); margin: 40px 0 20px; }

.dsf-sectionhead { display: inline-flex; align-items: center; gap: 16px; margin-bottom: 4px; }
.dsf-sectionhead.dsf-center { display: flex; justify-content: center; }
.dsf-sectionnum { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 22px; color: var(--dsf-accent); }

/* ---------- Buttons ---------- */
.dsf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: var(--dsf-ink); color: var(--dsf-cream); padding: 18px 28px; border: none; border-radius: var(--dsf-radius); font-family: inherit; font-weight: 500; font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; transition: background 180ms ease, transform 180ms ease; }
.dsf-btn:hover { background: var(--dsf-accent-hover); transform: translateY(-1px); }
.dsf-btn-primary { background: var(--dsf-ink); color: var(--dsf-cream); }
.dsf-btn-lg { padding: 22px 36px; font-size: 15px; }
.dsf-icon { opacity: 0.9; transition: transform 180ms ease; }
.dsf-btn:hover .dsf-icon { transform: translateX(3px); }
.dsf-icon-sm { opacity: 0.7; }

/* ---------- Hero ---------- */
.dsf-hero { padding: 120px 0 96px; background: var(--dsf-cream); border-top: none; }
.dsf-hero .dsf-label { margin-bottom: 40px; }
.dsf-hero-headline { font-size: clamp(48px, 7.6vw, 112px); margin: 0 0 36px; max-width: 16ch; }
.dsf-hero-sub { font-size: 21px; line-height: 1.6; max-width: 56ch; color: var(--dsf-ink-2); margin: 0 0 56px; }
.dsf-hero-ctarow { display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
.dsf-trust { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: 0.03em; color: var(--dsf-muted); }
.dsf-trust-center { justify-content: center; margin-top: 24px; }

/* ---------- Problem ---------- */
.dsf-problem-body { max-width: 680px; }
.dsf-problem .dsf-body { margin-bottom: 24px; }

/* ---------- Solution ---------- */
.dsf-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; margin-bottom: 64px; }
.dsf-split .dsf-h2 { margin: 0; max-width: none; }
.dsf-split .dsf-body { margin: 0; }

.dsf-numlist { list-style: none; padding: 0; border-top: 1px solid var(--dsf-rule); }
.dsf-numlist > li { display: grid; grid-template-columns: 80px 1fr; gap: 24px; padding: 28px 0; border-bottom: 1px solid var(--dsf-rule); align-items: baseline; }
.dsf-numlist-n { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 40px; color: var(--dsf-accent); line-height: 1; }
.dsf-numlist-text { font-size: 19px; line-height: 1.55; color: var(--dsf-ink-2); }

/* ---------- Features ---------- */
.dsf-features { background: var(--dsf-cream-2); }
.dsf-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px 56px; margin-top: 16px; }
.dsf-feature { border-top: 1px solid var(--dsf-rule); padding-top: 28px; }
.dsf-feature-n { font-size: 36px; font-style: italic; color: var(--dsf-accent); line-height: 1; margin-bottom: 16px; }
.dsf-feature-t { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 18px; margin: 0 0 12px; letter-spacing: -0.005em; color: var(--dsf-ink); }
.dsf-feature-d { font-size: 16px; line-height: 1.65; color: var(--dsf-ink-2); margin: 0; }

/* ---------- Social proof ---------- */
.dsf-testimonial-featured { margin: 40px 0 64px; padding: 72px 64px; border: 1px solid var(--dsf-rule); background: #fff; text-align: center; }
.dsf-testimonial-quote { font-size: clamp(24px, 3vw, 36px); font-style: italic; color: var(--dsf-ink); margin: 0 auto 40px; max-width: 44ch; line-height: 1.35; }
.dsf-testimonial-caption { display: inline-flex; align-items: center; gap: 14px; }
.dsf-testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--dsf-sage); color: var(--dsf-ink); display: grid; place-items: center; font-weight: 500; font-size: 14px; letter-spacing: 0.04em; }
.dsf-testimonial-name { font-weight: 500; color: var(--dsf-ink); font-size: 14px; }
.dsf-testimonial-loc { font-size: 13px; color: var(--dsf-muted); }
.dsf-testimonial-disc { font-size: 11px; font-style: italic; color: var(--dsf-muted); margin-top: 16px; letter-spacing: 0.01em; }

.dsf-testimonial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.dsf-testimonial-sm { border-top: 1px solid var(--dsf-rule); padding-top: 24px; }
.dsf-testimonial-smquote { font-style: italic; font-size: 18px; line-height: 1.55; color: var(--dsf-ink-2); margin: 0 0 16px; }
.dsf-testimonial-smcap { font-size: 13px; color: var(--dsf-muted); display: flex; align-items: center; gap: 8px; }
.dsf-testimonial-dot { color: var(--dsf-rule); }

/* ---------- Offer ---------- */
.dsf-offer { background: var(--dsf-ink); color: var(--dsf-cream); border-top-color: var(--dsf-ink-2); }
.dsf-offer .dsf-label { color: rgba(250,248,244,0.6); }
.dsf-offer .dsf-sectionnum { color: var(--dsf-accent); }
.dsf-offer .dsf-h2 { color: var(--dsf-cream); margin-top: 24px; }
.dsf-offer-wrap { max-width: 720px; }
.dsf-offer-card { margin-top: 40px; padding: 56px 48px; border: 1px solid rgba(250,248,244,0.15); background: rgba(250,248,244,0.03); }
.dsf-offer-list { list-style: none; padding: 0; margin: 0 0 40px; }
.dsf-offer-list li { display: grid; grid-template-columns: 40px 1fr; gap: 16px; padding: 14px 0; font-size: 17px; line-height: 1.55; color: var(--dsf-cream); border-bottom: 1px solid rgba(250,248,244,0.1); }
.dsf-offer-list li:last-child { border-bottom: none; }
.dsf-offer-mark { color: var(--dsf-accent); font-weight: 500; }
.dsf-offer-divider { height: 1px; background: rgba(250,248,244,0.15); margin: 8px 0 40px; }
.dsf-offer-price-block { text-align: center; margin-bottom: 40px; }
.dsf-offer-pricerule { width: 40px; height: 1px; background: var(--dsf-accent); margin: 0 auto 24px; }
.dsf-offer-price { font-size: clamp(56px, 8vw, 96px); color: var(--dsf-cream); margin-bottom: 8px; }
.dsf-offer-pricenote { font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(250,248,244,0.6); }
.dsf-offer-card .dsf-btn { width: 100%; background: var(--dsf-cream); color: var(--dsf-ink); }
.dsf-offer-card .dsf-btn:hover { background: var(--dsf-accent); color: var(--dsf-cream); }
.dsf-offer-digistore { margin-top: 24px; text-align: center; font-size: 11px; color: rgba(250,248,244,0.6); display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.04em; }

/* ---------- Guarantee ---------- */
.dsf-guarantee { background: var(--dsf-cream); }
.dsf-guarantee-seal { width: 140px; height: 140px; border-radius: 50%; border: 1px solid var(--dsf-rule); display: grid; place-items: center; margin: 0 auto 32px; position: relative; }
.dsf-guarantee-seal::before, .dsf-guarantee-seal::after { content: ""; position: absolute; width: 120px; height: 120px; border-radius: 50%; border: 1px solid var(--dsf-rule); }
.dsf-guarantee-seal::before { opacity: 0.5; }
.dsf-guarantee-seal::after { width: 100px; height: 100px; opacity: 0.25; }
.dsf-guarantee-days { font-size: 56px; line-height: 1; color: var(--dsf-accent); position: relative; z-index: 1; }
.dsf-guarantee-sublabel { position: relative; z-index: 1; font-size: 10px; margin-top: 4px; }

/* ---------- FAQ ---------- */
.dsf-faq-list { border-top: 1px solid var(--dsf-rule); }
.dsf-faq-item { border-bottom: 1px solid var(--dsf-rule); }
.dsf-faq-item summary { list-style: none; cursor: pointer; padding: 26px 0; display: flex; justify-content: space-between; align-items: center; gap: 32px; font-size: 18px; font-weight: 500; color: var(--dsf-ink); }
.dsf-faq-item summary::-webkit-details-marker { display: none; }
.dsf-faq-item summary:hover { color: var(--dsf-accent); }
.dsf-faq-icon { width: 16px; height: 16px; position: relative; flex-shrink: 0; }
.dsf-faq-icon::before, .dsf-faq-icon::after { content: ""; position: absolute; background: var(--dsf-muted); transition: transform 200ms ease; }
.dsf-faq-icon::before { top: 7.5px; left: 0; width: 16px; height: 1px; }
.dsf-faq-icon::after { top: 0; left: 7.5px; width: 1px; height: 16px; }
.dsf-faq-item[open] .dsf-faq-icon::after { transform: scaleY(0); }
.dsf-faq-answer { padding: 0 0 28px; font-size: 17px; line-height: 1.7; color: var(--dsf-ink-2); max-width: 75ch; }

/* ---------- Closing ---------- */
.dsf-closing { padding: 140px 0; background: var(--dsf-cream-2); }
.dsf-closing .dsf-body { margin-bottom: 40px; font-size: 19px; }

/* ---------- Disclaimer ---------- */
.dsf-disc { padding: 64px 0; border-top: 1px solid var(--dsf-rule); background: var(--dsf-cream-2); }
.dsf-disc-block { max-width: 680px; margin: 0 auto 32px; font-size: 13px; line-height: 1.7; color: var(--dsf-muted); }
.dsf-disc-block h2 { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dsf-ink-2); margin: 0 0 16px; }
.dsf-disc-block h3 { display: none; }
.dsf-disc-block p { font-family: inherit; margin: 0 0 12px; }
.dsf-disc-block strong { color: var(--dsf-ink-2); font-weight: 500; }
.dsf-disc-block a { color: var(--dsf-accent); text-decoration: underline; text-underline-offset: 2px; }

/* ---------- Footer ---------- */
.dsf-footer { background: var(--dsf-ink); color: rgba(250,248,244,0.7); padding: 80px 0 0; border-top: none; }
.dsf-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 56px; padding-bottom: 56px; }
.dsf-footer-col .dsf-label { color: rgba(250,248,244,0.5); margin-bottom: 16px; }
.dsf-footer-brand { font-size: 28px; color: var(--dsf-cream); margin-bottom: 16px; }
.dsf-footer-meta { font-size: 13px; line-height: 1.7; margin: 0; color: rgba(250,248,244,0.6); }
.dsf-footer-meta a { color: var(--dsf-cream); text-decoration: underline; text-underline-offset: 3px; }
.dsf-footer-meta a:hover { color: var(--dsf-accent); }
.dsf-footer-badge { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; padding: 8px 12px; border: 1px solid rgba(250,248,244,0.15); font-size: 11px; letter-spacing: 0.04em; color: rgba(250,248,244,0.7); }
.dsf-footer-legal { list-style: none; padding: 0; margin: 0; }
.dsf-footer-legal li { margin-bottom: 10px; }
.dsf-footer-legal a { font-size: 13px; color: rgba(250,248,244,0.6); transition: color 120ms; }
.dsf-footer-legal a:hover { color: var(--dsf-accent); }
.dsf-footer-bottom { border-top: 1px solid rgba(250,248,244,0.12); padding: 24px 0; font-size: 11px; letter-spacing: 0.06em; color: rgba(250,248,244,0.4); text-align: center; }

/* ---------- Modals (:target, no JS) ---------- */
.dsf-modal { display: none; position: fixed; inset: 0; z-index: 1000; align-items: flex-start; justify-content: center; padding: 48px 20px; overflow-y: auto; font-family: 'Inter', sans-serif; }
.dsf-modal:target { display: flex; }
.dsf-modal-backdrop { position: fixed; inset: 0; background: rgba(26,24,21,0.72); backdrop-filter: blur(4px); cursor: pointer; }
.dsf-modal-inner { position: relative; background: var(--dsf-cream); max-width: 720px; width: 100%; border-radius: var(--dsf-radius); box-shadow: 0 30px 60px -12px rgba(26,24,21,0.4); }
.dsf-modal-head { position: sticky; top: 0; background: var(--dsf-cream); display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; border-bottom: 1px solid var(--dsf-rule); border-radius: var(--dsf-radius) var(--dsf-radius) 0 0; }
.dsf-modal-title { font-size: 22px; margin: 0; color: var(--dsf-ink); }
.dsf-modal-close { width: 32px; height: 32px; display: grid; place-items: center; font-size: 24px; line-height: 1; color: var(--dsf-muted); border: 1px solid var(--dsf-rule); border-radius: var(--dsf-radius); transition: all 140ms; }
.dsf-modal-close:hover { background: var(--dsf-ink); color: var(--dsf-cream); border-color: var(--dsf-ink); }
.dsf-modal-body { padding: 32px; font-size: 14px; line-height: 1.7; color: var(--dsf-ink-2); }
.dsf-modal-body h2 { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dsf-ink); margin: 0 0 20px; display: none; }
.dsf-modal-body h3 { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: var(--dsf-ink); margin: 24px 0 10px; }
.dsf-modal-body p { margin: 0 0 12px; }
.dsf-modal-body strong { color: var(--dsf-ink); font-weight: 600; }
.dsf-modal-body a { color: var(--dsf-accent); text-decoration: underline; text-underline-offset: 2px; }
.dsf-modal-body li { margin-bottom: 6px; }

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .dsf-section { padding: 88px 0; }
  .dsf-hero { padding: 80px 0 64px; }
  .dsf-split { grid-template-columns: 1fr; gap: 24px; }
  .dsf-feature-grid { grid-template-columns: repeat(2, 1fr); gap: 40px 32px; }
  .dsf-testimonial-grid { grid-template-columns: 1fr; gap: 32px; }
  .dsf-testimonial-featured { padding: 48px 32px; }
  .dsf-footer-grid { grid-template-columns: 1fr; gap: 40px; }
  .dsf-offer-card { padding: 40px 28px; }
}
@media (max-width: 640px) {
  .dsf-section { padding: 72px 0; }
  .dsf-hero { padding: 64px 0 48px; }
  .dsf-wrap { padding: 0 20px; }
  .dsf-feature-grid { grid-template-columns: 1fr; gap: 32px; }
  .dsf-numlist > li { grid-template-columns: 56px 1fr; gap: 16px; padding: 20px 0; }
  .dsf-numlist-n { font-size: 32px; }
  .dsf-btn, .dsf-btn-lg { width: 100%; }
  .dsf-hero-ctarow { gap: 20px; }
  .dsf-hero-ctarow .dsf-btn { width: auto; }
  .dsf-offer-card { padding: 32px 20px; }
  .dsf-modal-body { padding: 24px; }
  .dsf-modal-head { padding: 20px 24px; }
}

/* Print / accessibility */
@media (prefers-reduced-motion: reduce) {
  .dsf-page *, .dsf-modal * { transition: none !important; animation: none !important; }
}
`.trim();
}

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
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
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

function markdownToHtml(md: string): string {
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

// =======================================================================
// Localized labels
// =======================================================================

interface Labels {
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
  reviewedBy: string;
  officialReseller: string;
}

function labelsForLang(lang: string): Labels {
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
        reviewedBy: "Vendu via",
        officialReseller: "Revendeur officiel européen",
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
        reviewedBy: "Vendido por",
        officialReseller: "Revendedor oficial europeo",
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
        reviewedBy: "Vendido via",
        officialReseller: "Revendedor oficial europeu",
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
        reviewedBy: "Verkauft über",
        officialReseller: "Offizieller europäischer Händler",
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
        reviewedBy: "Venduto tramite",
        officialReseller: "Rivenditore ufficiale europeo",
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
        reviewedBy: "Verkocht via",
        officialReseller: "Officiële Europese wederverkoper",
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
        reviewedBy: "Sold via",
        officialReseller: "Official European reseller",
      };
  }
}

function daysLabel(lang: string, days: number): string {
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
