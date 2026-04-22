import type { PageCopy } from "@/lib/schemas";
import type { CompanyProfile } from "@prisma/client";
import { formatFullAddress } from "@/lib/legal-templates";
import type { LegalTexts } from "@/lib/legal-templates";
import type { RenderArgs } from "./types";
import {
  escapeHtml,
  escapeAttr,
  formatMoney,
  daysLabel,
  labelsForLang,
  markdownToHtml,
  wrapStandalone,
  type Labels,
} from "./shared";

const P = "dsf-sw";

const SVG_ARROW = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const SVG_LOCK = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true"><rect x="4" y="11" width="16" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

export function renderSwiss(args: RenderArgs): string {
  const mode = args.mode ?? "standalone";
  const body = renderBody(args);
  if (mode === "embed") return body;
  return wrapStandalone({
    lang: args.copy.language,
    title: args.copy.meta.title,
    description: args.copy.meta.description,
    bodyBg: "#ffffff",
    body,
  });
}

function renderBody(args: RenderArgs): string {
  const { copy, project, companyProfile: p, legalTexts } = args;
  const ctaUrl = project.checkoutUrl || "#offer";
  const fullAddress = formatFullAddress(p);
  const year = new Date().getFullYear();
  const L = labelsForLang(copy.language);
  const priceLabel = copy.offer.price || formatMoney(project.priceGross, project.currency, copy.language);

  return `<style>${css()}</style>
<div class="${P}-page">
${hero(copy, ctaUrl, L)}
${problem(copy, L)}
${solution(copy, L)}
${features(copy, L)}
${social(copy, L)}
${offer(copy, ctaUrl, priceLabel, L)}
${guarantee(copy, project.guaranteeDays)}
${faq(copy, L)}
${closing(copy, ctaUrl, L)}
${disclaimerBlock(legalTexts)}
${footer(p, fullAddress, year, L)}
${modals(legalTexts, L)}
</div>`;
}

function hero(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="${P}-hero">
  <div class="${P}-wrap">
    <div class="${P}-hero-grid">
      <div class="${P}-hero-idx">
        <div class="${P}-mono">§ 00 / ${escapeHtml(c.hero.eyebrow)}</div>
      </div>
      <div>
        <h1 class="${P}-display ${P}-hero-h">${escapeHtml(c.hero.headline)}</h1>
        <p class="${P}-hero-sub">${escapeHtml(c.hero.subheadline)}</p>
        <div class="${P}-ctarow">
          <a href="${escapeAttr(ctaUrl)}" class="${P}-btn">${escapeHtml(c.hero.ctaLabel)} ${SVG_ARROW}</a>
          <div class="${P}-trust">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function problem(c: PageCopy, L: Labels): string {
  const paras = c.problem.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-grid">
    <aside class="${P}-side"><span class="${P}-mono">§ 01</span><span class="${P}-mono-sm">${escapeHtml(L.problem)}</span></aside>
    <div class="${P}-main">
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.problem.title)}</h2>
      <div class="${P}-body">${paras}</div>
    </div>
  </div>
</section>`;
}

function solution(c: PageCopy, L: Labels): string {
  const bullets = c.solution.bulletPoints
    .map((b, i) => `<tr><td class="${P}-mono">${String(i + 1).padStart(2, "0")}</td><td>${escapeHtml(b)}</td></tr>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-grid">
    <aside class="${P}-side"><span class="${P}-mono">§ 02</span><span class="${P}-mono-sm">${escapeHtml(L.solution)}</span></aside>
    <div class="${P}-main">
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.solution.title)}</h2>
      <p class="${P}-body">${escapeHtml(c.solution.description)}</p>
      <table class="${P}-table">${bullets}</table>
    </div>
  </div>
</section>`;
}

function features(c: PageCopy, L: Labels): string {
  const items = c.features.items
    .map((f, i) => `
    <div class="${P}-feat">
      <div class="${P}-mono">${String(i + 1).padStart(2, "0")} / ${c.features.items.length.toString().padStart(2, "0")}</div>
      <h3 class="${P}-feat-t">${escapeHtml(f.title)}</h3>
      <p>${escapeHtml(f.description)}</p>
    </div>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-grid">
    <aside class="${P}-side"><span class="${P}-mono">§ 03</span><span class="${P}-mono-sm">${escapeHtml(L.features)}</span></aside>
    <div class="${P}-main">
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.features.title)}</h2>
      <div class="${P}-feat-grid">${items}</div>
    </div>
  </div>
</section>`;
}

function social(c: PageCopy, L: Labels): string {
  const items = c.socialProof.testimonials
    .map((t, i) => `
    <figure class="${P}-tm">
      <div class="${P}-mono">★ ${String(i + 1).padStart(2, "0")}</div>
      <blockquote>${escapeHtml(t.text)}</blockquote>
      <figcaption><strong>${escapeHtml(t.name)}</strong> · ${escapeHtml(t.location)}</figcaption>
      <p class="${P}-disc">${escapeHtml(t.disclaimer)}</p>
    </figure>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-grid">
    <aside class="${P}-side"><span class="${P}-mono">§ 04</span><span class="${P}-mono-sm">${escapeHtml(L.testimonials)}</span></aside>
    <div class="${P}-main">
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.socialProof.title)}</h2>
      <div class="${P}-tgrid">${items}</div>
    </div>
  </div>
</section>`;
}

function offer(c: PageCopy, ctaUrl: string, price: string, L: Labels): string {
  const items = c.offer.items.map((it) => `<li><span class="${P}-mono-sm">+</span><span>${escapeHtml(it)}</span></li>`).join("");
  return `
<section class="${P}-sect ${P}-offer-sect" id="offer">
  <div class="${P}-wrap">
    <div class="${P}-offc">
      <div class="${P}-offc-head">
        <div class="${P}-mono">§ 05 / ${escapeHtml(L.offer)}</div>
        <h2 class="${P}-display ${P}-offc-h">${escapeHtml(c.offer.title)}</h2>
      </div>
      <div class="${P}-offc-body">
        <ul class="${P}-offl">${items}</ul>
        <div class="${P}-offp-block">
          <div class="${P}-mono-sm">${escapeHtml(c.offer.priceNote)}</div>
          <div class="${P}-offp">${escapeHtml(price)}</div>
          <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-accent">${escapeHtml(c.offer.ctaLabel)} ${SVG_ARROW}</a>
          <div class="${P}-trust">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote)}</span></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function guarantee(c: PageCopy, days: number): string {
  return `
<section class="${P}-sect ${P}-guar">
  <div class="${P}-wrap">
    <div class="${P}-guar-grid">
      <div class="${P}-guar-num ${P}-display">${days}</div>
      <div>
        <div class="${P}-mono-sm">${escapeHtml(daysLabel(c.language, days))}</div>
        <h3 class="${P}-guar-t">${escapeHtml(c.guarantee.title)}</h3>
        <p>${escapeHtml(c.guarantee.description)}</p>
      </div>
    </div>
  </div>
</section>`;
}

function faq(c: PageCopy, L: Labels): string {
  const items = c.faq.items
    .map((q, i) => `
    <details class="${P}-faq-it">
      <summary>
        <span class="${P}-mono-sm">${String(i + 1).padStart(2, "0")}</span>
        <span class="${P}-faq-q">${escapeHtml(q.question)}</span>
        <span class="${P}-faq-i"></span>
      </summary>
      <div class="${P}-faq-a">${escapeHtml(q.answer)}</div>
    </details>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-grid">
    <aside class="${P}-side"><span class="${P}-mono">§ 06</span><span class="${P}-mono-sm">${escapeHtml(L.faq)}</span></aside>
    <div class="${P}-main">
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.faq.title)}</h2>
      <div class="${P}-faq-list">${items}</div>
    </div>
  </div>
</section>`;
}

function closing(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="${P}-sect ${P}-closing">
  <div class="${P}-wrap">
    <h2 class="${P}-display ${P}-closing-h">${escapeHtml(c.closingCta.title)}</h2>
    <p class="${P}-closing-p">${escapeHtml(c.closingCta.subtitle)}</p>
    <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-accent">${escapeHtml(c.closingCta.ctaLabel)} ${SVG_ARROW}</a>
    <div class="${P}-trust" style="margin-top:20px;">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span></div>
  </div>
</section>`;
}

function disclaimerBlock(lt: LegalTexts): string {
  const texts: string[] = [];
  if (lt.medicalDisclaimer) texts.push(lt.medicalDisclaimer);
  if (lt.earningsDisclaimer) texts.push(lt.earningsDisclaimer);
  if (!texts.length) return "";
  const blocks = texts.map((t) => `<div class="${P}-disc-b">${markdownToHtml(t)}</div>`).join("");
  return `<section class="${P}-disc"><div class="${P}-wrap">${blocks}</div></section>`;
}

function footer(p: CompanyProfile, addr: string, year: number, L: Labels): string {
  return `
<footer class="${P}-footer">
  <div class="${P}-wrap">
    <div class="${P}-foot-grid">
      <div>
        <div class="${P}-foot-brand">${escapeHtml(p.tradingName || p.legalName)}</div>
        <p class="${P}-foot-meta">${escapeHtml(p.legalName)}<br>${escapeHtml(p.taxIdType)}: ${escapeHtml(p.taxIdNumber)}<br>${escapeHtml(addr)}</p>
      </div>
      <div>
        <div class="${P}-mono-sm">${escapeHtml(L.contactTitle)}</div>
        <p class="${P}-foot-meta"><a href="mailto:${escapeAttr(p.supportEmail || p.contactEmail)}">${escapeHtml(p.supportEmail || p.contactEmail)}</a></p>
      </div>
      <div>
        <div class="${P}-mono-sm">${escapeHtml(L.legalTitle)}</div>
        <ul class="${P}-foot-leg">
          <li><a href="#modal-${P}-mentions">${escapeHtml(L.mentions)}</a></li>
          <li><a href="#modal-${P}-privacy">${escapeHtml(L.privacy)}</a></li>
          <li><a href="#modal-${P}-terms">${escapeHtml(L.terms)}</a></li>
          <li><a href="#modal-${P}-refund">${escapeHtml(L.refund)}</a></li>
        </ul>
      </div>
    </div>
    <div class="${P}-foot-bot"><span class="${P}-mono-sm">© ${year} / ${escapeHtml(p.legalName)} / ${escapeHtml(L.rights)}</span></div>
  </div>
</footer>`;
}

function modals(lt: LegalTexts, L: Labels): string {
  return [
    modal("mentions", L.mentions, lt.mentionsLegales, L),
    modal("privacy", L.privacy, lt.privacyPolicy, L),
    modal("terms", L.terms, lt.terms, L),
    modal("refund", L.refund, lt.refundPolicy, L),
  ].join("\n");
}
function modal(key: string, title: string, md: string, L: Labels): string {
  const id = `modal-${P}-${key}`;
  return `
<div id="${id}" class="${P}-modal" role="dialog" aria-modal="true">
  <a href="#" class="${P}-modal-bd" aria-label="${escapeAttr(L.close)}"></a>
  <div class="${P}-modal-in">
    <div class="${P}-modal-h"><h3 class="${P}-modal-t">${escapeHtml(title)}</h3><a href="#" class="${P}-modal-x" aria-label="${escapeAttr(L.close)}">×</a></div>
    <div class="${P}-modal-b">${markdownToHtml(md)}</div>
  </div>
</div>`;
}

function css(): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
.${P}-page, .${P}-modal { --ink:#0a0a0a; --ink2:#3a3a3a; --mu:#737373; --bg:#fff; --bg2:#f5f5f5; --rl:#e5e5e5; --ac:#ff3b00; --mx:1280px; }
.${P}-page { color:var(--ink); background:var(--bg); font-family:'Inter',-apple-system,system-ui,sans-serif; line-height:1.5; font-size:15px; -webkit-font-smoothing:antialiased; }
.${P}-page *, .${P}-modal * { box-sizing:border-box; }
.${P}-page p { margin:0 0 1em; } .${P}-page ul { margin:0; padding:0; } .${P}-page a { color:inherit; text-decoration:none; } .${P}-page figure { margin:0; }
.${P}-wrap { max-width:var(--mx); margin:0 auto; padding:0 32px; }
.${P}-sect { padding:96px 0; border-top:1px solid var(--rl); }
.${P}-grid { display:grid; grid-template-columns:180px 1fr; gap:48px; }
.${P}-side { position:sticky; top:32px; align-self:start; display:flex; flex-direction:column; gap:4px; }
.${P}-main { min-width:0; }
.${P}-mono { font-family:'JetBrains Mono',ui-monospace,Menlo,monospace; font-size:12px; font-weight:500; letter-spacing:0.02em; color:var(--ink); text-transform:uppercase; }
.${P}-mono-sm { font-family:'JetBrains Mono',ui-monospace,Menlo,monospace; font-size:11px; font-weight:400; color:var(--mu); text-transform:uppercase; letter-spacing:0.04em; }
.${P}-display { font-family:'Inter',sans-serif; font-weight:700; letter-spacing:-0.03em; line-height:1.02; }
.${P}-h2 { font-size:clamp(36px,5vw,64px); margin:16px 0 40px; max-width:22ch; }
.${P}-body { font-size:17px; line-height:1.65; color:var(--ink2); max-width:66ch; }
.${P}-body p { margin-bottom:20px; }
.${P}-btn { display:inline-flex; align-items:center; gap:10px; background:var(--ink); color:var(--bg); padding:16px 24px; border:none; border-radius:0; font:inherit; font-weight:500; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; transition:all 180ms; }
.${P}-btn:hover { background:var(--ac); transform:translate(2px,-2px); box-shadow:-2px 2px 0 var(--ink); }
.${P}-btn-accent { background:var(--ac); color:var(--bg); }
.${P}-btn-accent:hover { background:var(--ink); box-shadow:-2px 2px 0 var(--ac); }
.${P}-trust { display:inline-flex; align-items:center; gap:8px; font-size:11px; color:var(--mu); font-family:'JetBrains Mono',monospace; letter-spacing:0.03em; }
.${P}-ctarow { display:flex; align-items:center; gap:24px; flex-wrap:wrap; margin-top:40px; }
.${P}-hero { padding:80px 0 120px; border-top:none; }
.${P}-hero-grid { display:grid; grid-template-columns:180px 1fr; gap:48px; align-items:start; }
.${P}-hero-h { font-size:clamp(56px,9vw,140px); margin:0 0 32px; max-width:14ch; letter-spacing:-0.04em; }
.${P}-hero-sub { font-size:20px; line-height:1.5; color:var(--ink2); max-width:56ch; margin:0; }
.${P}-table { width:100%; border-collapse:collapse; margin-top:24px; border-top:1px solid var(--rl); }
.${P}-table td { padding:16px 0; border-bottom:1px solid var(--rl); vertical-align:baseline; font-size:16px; color:var(--ink); }
.${P}-table td:first-child { width:80px; color:var(--mu); }
.${P}-feat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0; border-top:1px solid var(--rl); border-left:1px solid var(--rl); margin-top:16px; }
.${P}-feat { padding:32px; border-right:1px solid var(--rl); border-bottom:1px solid var(--rl); }
.${P}-feat-t { font-family:'Inter',sans-serif; font-weight:600; font-size:19px; margin:16px 0 10px; letter-spacing:-0.01em; }
.${P}-feat p { margin:0; color:var(--ink2); font-size:15px; line-height:1.6; }
.${P}-tgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; margin-top:16px; }
.${P}-tm { border-top:2px solid var(--ink); padding-top:20px; }
.${P}-tm blockquote { font-size:17px; line-height:1.55; color:var(--ink); margin:12px 0 16px; }
.${P}-tm figcaption { font-size:13px; color:var(--ink2); }
.${P}-tm figcaption strong { font-weight:600; color:var(--ink); }
.${P}-tm .${P}-disc { font-size:10px; color:var(--mu); margin-top:10px; font-style:italic; }
.${P}-offer-sect { background:var(--ink); color:var(--bg); border-top:1px solid var(--ink); padding:120px 0; }
.${P}-offer-sect .${P}-mono { color:var(--bg); }
.${P}-offer-sect .${P}-mono-sm { color:rgba(255,255,255,0.5); }
.${P}-offc { display:grid; grid-template-columns:1fr 1fr; gap:64px; max-width:960px; margin:0 auto; }
.${P}-offc-head .${P}-mono { margin-bottom:24px; display:inline-block; }
.${P}-offc-h { font-size:clamp(32px,4vw,52px); color:var(--bg); max-width:18ch; line-height:1.05; }
.${P}-offc-body { display:flex; flex-direction:column; }
.${P}-offl { list-style:none; padding:0; margin:0 0 40px; }
.${P}-offl li { display:grid; grid-template-columns:24px 1fr; gap:12px; padding:12px 0; font-size:15px; border-bottom:1px solid rgba(255,255,255,0.15); color:var(--bg); }
.${P}-offl li:last-child { border-bottom:none; } .${P}-offl .${P}-mono-sm { color:var(--ac); }
.${P}-offp-block { border-top:2px solid var(--ac); padding-top:24px; }
.${P}-offp { font-family:'Inter',sans-serif; font-weight:700; font-size:clamp(48px,7vw,88px); letter-spacing:-0.04em; line-height:1; margin:8px 0 24px; color:var(--bg); }
.${P}-offp-block .${P}-btn { width:100%; background:var(--ac); color:var(--bg); } .${P}-offp-block .${P}-btn:hover { background:var(--bg); color:var(--ink); box-shadow:-2px 2px 0 var(--ac); }
.${P}-offp-block .${P}-trust { margin-top:16px; color:rgba(255,255,255,0.5); }
.${P}-guar-grid { display:grid; grid-template-columns:auto 1fr; gap:48px; align-items:start; max-width:880px; }
.${P}-guar-num { font-size:clamp(96px,14vw,200px); color:var(--ac); line-height:0.9; letter-spacing:-0.06em; }
.${P}-guar-t { font-family:'Inter',sans-serif; font-weight:600; font-size:clamp(24px,3vw,36px); margin:12px 0 16px; letter-spacing:-0.02em; }
.${P}-guar p { font-size:17px; line-height:1.55; color:var(--ink2); max-width:56ch; }
.${P}-faq-list { border-top:1px solid var(--rl); margin-top:16px; }
.${P}-faq-it { border-bottom:1px solid var(--rl); }
.${P}-faq-it summary { list-style:none; cursor:pointer; padding:24px 0; display:grid; grid-template-columns:60px 1fr 24px; gap:16px; align-items:center; }
.${P}-faq-it summary::-webkit-details-marker { display:none; }
.${P}-faq-q { font-family:'Inter',sans-serif; font-weight:500; font-size:18px; color:var(--ink); letter-spacing:-0.01em; }
.${P}-faq-i { width:14px; height:14px; position:relative; justify-self:end; }
.${P}-faq-i::before, .${P}-faq-i::after { content:""; position:absolute; background:var(--ink); transition:transform 200ms; }
.${P}-faq-i::before { top:6.5px; left:0; width:14px; height:1px; }
.${P}-faq-i::after { top:0; left:6.5px; width:1px; height:14px; }
.${P}-faq-it[open] .${P}-faq-i::after { transform:scaleY(0); }
.${P}-faq-a { padding:0 0 24px 76px; font-size:16px; line-height:1.65; color:var(--ink2); }
.${P}-closing { background:var(--ac); color:var(--bg); padding:140px 0; border-top:none; }
.${P}-closing-h { font-size:clamp(48px,8vw,120px); max-width:18ch; margin:0 0 24px; letter-spacing:-0.04em; }
.${P}-closing-p { font-size:20px; line-height:1.5; max-width:48ch; margin:0 0 40px; color:rgba(255,255,255,0.85); }
.${P}-closing .${P}-btn { background:var(--ink); color:var(--bg); } .${P}-closing .${P}-btn:hover { background:var(--bg); color:var(--ink); box-shadow:-2px 2px 0 var(--ink); }
.${P}-closing .${P}-trust { color:rgba(255,255,255,0.7); }
.${P}-disc { padding:56px 0; background:var(--bg2); border-top:1px solid var(--rl); }
.${P}-disc-b { max-width:720px; margin:0 auto 24px; font-size:12px; line-height:1.65; color:var(--mu); font-family:'Inter',sans-serif; }
.${P}-disc-b h2 { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink2); margin:0 0 14px; }
.${P}-disc-b p { margin:0 0 10px; } .${P}-disc-b strong { color:var(--ink2); font-weight:500; }
.${P}-footer { background:var(--bg); color:var(--ink2); border-top:1px solid var(--rl); padding:64px 0 24px; }
.${P}-foot-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; padding-bottom:48px; border-bottom:1px solid var(--rl); }
.${P}-foot-brand { font-family:'Inter',sans-serif; font-weight:700; font-size:22px; letter-spacing:-0.02em; color:var(--ink); margin-bottom:12px; }
.${P}-foot-meta { font-size:13px; line-height:1.65; margin:0; color:var(--mu); }
.${P}-foot-meta a { color:var(--ink); text-decoration:underline; text-underline-offset:2px; }
.${P}-foot-leg { list-style:none; padding:0; margin:8px 0 0; } .${P}-foot-leg li { margin-bottom:6px; }
.${P}-foot-leg a { font-size:13px; color:var(--ink2); } .${P}-foot-leg a:hover { color:var(--ac); }
.${P}-foot-bot { padding-top:24px; text-align:center; color:var(--mu); }
.${P}-modal { display:none; position:fixed; inset:0; z-index:1000; align-items:flex-start; justify-content:center; padding:48px 20px; overflow-y:auto; font-family:'Inter',sans-serif; }
.${P}-modal:target { display:flex; }
.${P}-modal-bd { position:fixed; inset:0; background:rgba(10,10,10,0.8); backdrop-filter:blur(4px); }
.${P}-modal-in { position:relative; background:var(--bg); max-width:720px; width:100%; border-radius:0; border:1px solid var(--ink); }
.${P}-modal-h { position:sticky; top:0; background:var(--bg); display:flex; justify-content:space-between; align-items:center; padding:20px 28px; border-bottom:1px solid var(--rl); }
.${P}-modal-t { font-family:'Inter',sans-serif; font-weight:600; font-size:18px; margin:0; color:var(--ink); letter-spacing:-0.01em; }
.${P}-modal-x { width:32px; height:32px; display:grid; place-items:center; font-size:24px; color:var(--ink); border:1px solid var(--ink); }
.${P}-modal-x:hover { background:var(--ink); color:var(--bg); }
.${P}-modal-b { padding:28px; font-size:14px; line-height:1.65; color:var(--ink2); }
.${P}-modal-b h2 { display:none; } .${P}-modal-b h3 { font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--ink); margin:20px 0 8px; }
.${P}-modal-b p { margin:0 0 10px; } .${P}-modal-b strong { color:var(--ink); font-weight:600; } .${P}-modal-b a { color:var(--ac); text-decoration:underline; }
.${P}-modal-b li { margin-bottom:6px; }
@media (max-width:960px) {
  .${P}-sect { padding:72px 0; } .${P}-hero { padding:64px 0 96px; }
  .${P}-grid, .${P}-hero-grid, .${P}-offc, .${P}-foot-grid { grid-template-columns:1fr; gap:32px; }
  .${P}-side { position:static; flex-direction:row; gap:12px; }
  .${P}-feat-grid { grid-template-columns:1fr; } .${P}-tgrid { grid-template-columns:1fr; }
  .${P}-guar-grid { grid-template-columns:1fr; gap:16px; }
}
@media (max-width:640px) { .${P}-wrap { padding:0 20px; } .${P}-feat { padding:24px 20px; } .${P}-faq-it summary { grid-template-columns:40px 1fr 20px; gap:12px; } .${P}-faq-a { padding-left:52px; } }
`.replace(/\s+/g, " ").trim();
}
