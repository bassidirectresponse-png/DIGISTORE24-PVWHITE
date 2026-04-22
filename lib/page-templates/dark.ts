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

const P = "dsf-dk";

const SVG_ARROW = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const SVG_LOCK = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
const SVG_CHECK = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>`;
const SVG_SHIELD = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`;

export function renderDark(args: RenderArgs): string {
  const mode = args.mode ?? "standalone";
  const body = renderBody(args);
  if (mode === "embed") return body;
  return wrapStandalone({
    lang: args.copy.language,
    title: args.copy.meta.title,
    description: args.copy.meta.description,
    bodyBg: "#0a0a0b",
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
  <div class="${P}-grid-bg"></div>
  <div class="${P}-glow ${P}-glow-1"></div>
  <div class="${P}-glow ${P}-glow-2"></div>
  <div class="${P}-wrap ${P}-hero-inner">
    <div class="${P}-pill">
      <span class="${P}-pill-dot"></span>
      <span>${escapeHtml(c.hero.eyebrow)}</span>
    </div>
    <h1 class="${P}-hero-h">${escapeHtml(c.hero.headline)}</h1>
    <p class="${P}-hero-sub">${escapeHtml(c.hero.subheadline)}</p>
    <div class="${P}-ctarow">
      <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-accent">${escapeHtml(c.hero.ctaLabel)} ${SVG_ARROW}</a>
      <div class="${P}-trust">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span></div>
    </div>
  </div>
</section>`;
}

function problem(c: PageCopy, L: Labels): string {
  const paras = c.problem.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-mono">${escapeHtml(L.problem).toUpperCase()}</div>
    <h2 class="${P}-h2">${escapeHtml(c.problem.title)}</h2>
    <div class="${P}-body ${P}-narrow">${paras}</div>
  </div>
</section>`;
}

function solution(c: PageCopy, L: Labels): string {
  const bullets = c.solution.bulletPoints
    .map((b) => `<li><span class="${P}-check">${SVG_CHECK}</span><span>${escapeHtml(b)}</span></li>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-sol-grid">
    <div>
      <div class="${P}-mono">${escapeHtml(L.solution).toUpperCase()}</div>
      <h2 class="${P}-h2">${escapeHtml(c.solution.title)}</h2>
      <p class="${P}-body">${escapeHtml(c.solution.description)}</p>
    </div>
    <ul class="${P}-sollist">${bullets}</ul>
  </div>
</section>`;
}

function features(c: PageCopy, L: Labels): string {
  const items = c.features.items
    .map((f, i) => `
    <div class="${P}-card">
      <div class="${P}-card-n">0${i + 1}</div>
      <h3 class="${P}-card-t">${escapeHtml(f.title)}</h3>
      <p class="${P}-card-d">${escapeHtml(f.description)}</p>
    </div>`)
    .join("");
  return `
<section class="${P}-sect ${P}-feat-sect">
  <div class="${P}-wrap">
    <div class="${P}-mono">${escapeHtml(L.features).toUpperCase()}</div>
    <h2 class="${P}-h2">${escapeHtml(c.features.title)}</h2>
    <div class="${P}-card-grid">${items}</div>
  </div>
</section>`;
}

function social(c: PageCopy, L: Labels): string {
  const items = c.socialProof.testimonials
    .map((t) => `
    <figure class="${P}-tm">
      <blockquote>“${escapeHtml(t.text)}”</blockquote>
      <figcaption>
        <span class="${P}-tm-name">${escapeHtml(t.name)}</span>
        <span class="${P}-tm-loc">${escapeHtml(t.location)}</span>
      </figcaption>
      <p class="${P}-tm-disc">${escapeHtml(t.disclaimer)}</p>
    </figure>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-mono">${escapeHtml(L.testimonials).toUpperCase()}</div>
    <h2 class="${P}-h2">${escapeHtml(c.socialProof.title)}</h2>
    <div class="${P}-tgrid">${items}</div>
  </div>
</section>`;
}

function offer(c: PageCopy, ctaUrl: string, price: string, L: Labels): string {
  const items = c.offer.items.map((it) => `<li>${SVG_CHECK}<span>${escapeHtml(it)}</span></li>`).join("");
  return `
<section class="${P}-sect ${P}-offer-sect" id="offer">
  <div class="${P}-wrap">
    <div class="${P}-mono ${P}-center">${escapeHtml(L.offer).toUpperCase()}</div>
    <h2 class="${P}-h2 ${P}-center">${escapeHtml(c.offer.title)}</h2>
    <div class="${P}-offc">
      <div class="${P}-offc-head">
        <div class="${P}-mono-ac">${escapeHtml(c.offer.priceNote)}</div>
        <div class="${P}-offp">${escapeHtml(price)}</div>
      </div>
      <ul class="${P}-offl">${items}</ul>
      <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-accent ${P}-btn-lg ${P}-btn-full">${escapeHtml(c.offer.ctaLabel)} ${SVG_ARROW}</a>
      <div class="${P}-trust ${P}-trust-c">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote)}</span></div>
    </div>
  </div>
</section>`;
}

function guarantee(c: PageCopy, days: number): string {
  return `
<section class="${P}-sect ${P}-center">
  <div class="${P}-wrap">
    <div class="${P}-guar-ic">${SVG_SHIELD}</div>
    <div class="${P}-guar-badge"><span>${days}</span><span class="${P}-mono-sm">${escapeHtml(daysLabel(c.language, days))}</span></div>
    <h2 class="${P}-h3">${escapeHtml(c.guarantee.title)}</h2>
    <p class="${P}-body ${P}-narrow-c">${escapeHtml(c.guarantee.description)}</p>
  </div>
</section>`;
}

function faq(c: PageCopy, L: Labels): string {
  const items = c.faq.items
    .map((q) => `
    <details class="${P}-faq-it">
      <summary><span>${escapeHtml(q.question)}</span><span class="${P}-faq-i"></span></summary>
      <div class="${P}-faq-a">${escapeHtml(q.answer)}</div>
    </details>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-mono">${escapeHtml(L.faq).toUpperCase()}</div>
    <h2 class="${P}-h2">${escapeHtml(c.faq.title)}</h2>
    <div class="${P}-faq-list">${items}</div>
  </div>
</section>`;
}

function closing(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="${P}-sect ${P}-closing">
  <div class="${P}-glow ${P}-glow-c"></div>
  <div class="${P}-wrap ${P}-center">
    <h2 class="${P}-h2-lg">${escapeHtml(c.closingCta.title)}</h2>
    <p class="${P}-body ${P}-narrow-c">${escapeHtml(c.closingCta.subtitle)}</p>
    <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-accent ${P}-btn-lg">${escapeHtml(c.closingCta.ctaLabel)} ${SVG_ARROW}</a>
    <div class="${P}-trust ${P}-trust-c">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span></div>
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
        <div class="${P}-foot-h">${escapeHtml(L.contactTitle)}</div>
        <p class="${P}-foot-meta"><a href="mailto:${escapeAttr(p.supportEmail || p.contactEmail)}">${escapeHtml(p.supportEmail || p.contactEmail)}</a></p>
      </div>
      <div>
        <div class="${P}-foot-h">${escapeHtml(L.legalTitle)}</div>
        <ul class="${P}-foot-leg">
          <li><a href="#modal-${P}-mentions">${escapeHtml(L.mentions)}</a></li>
          <li><a href="#modal-${P}-privacy">${escapeHtml(L.privacy)}</a></li>
          <li><a href="#modal-${P}-terms">${escapeHtml(L.terms)}</a></li>
          <li><a href="#modal-${P}-refund">${escapeHtml(L.refund)}</a></li>
        </ul>
      </div>
    </div>
    <div class="${P}-foot-bot">© ${year} ${escapeHtml(p.legalName)}. ${escapeHtml(L.rights)}</div>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
.${P}-page, .${P}-modal { --bg:#0a0a0b; --bg2:#111114; --card:#141418; --ink:#f5f5f7; --ink2:#a8a8b0; --mu:#6b6b75; --rl:#23232a; --ac:#7c5cff; --acH:#a387ff; --gr1:#2dd4bf; --gr2:#ec4899; --mx:1200px; }
.${P}-page { color:var(--ink); background:var(--bg); font-family:'Inter',-apple-system,system-ui,sans-serif; line-height:1.55; font-size:15px; -webkit-font-smoothing:antialiased; }
.${P}-page *, .${P}-modal * { box-sizing:border-box; }
.${P}-page p { margin:0 0 1em; } .${P}-page ul { margin:0; padding:0; list-style:none; } .${P}-page a { color:inherit; text-decoration:none; } .${P}-page figure { margin:0; }
.${P}-wrap { max-width:var(--mx); margin:0 auto; padding:0 28px; position:relative; z-index:1; }
.${P}-sect { padding:120px 0; border-top:1px solid var(--rl); position:relative; overflow:hidden; }
.${P}-center { text-align:center; }
.${P}-narrow { max-width:680px; } .${P}-narrow-c { max-width:560px; margin-left:auto; margin-right:auto; }
.${P}-mono { font-family:'JetBrains Mono',ui-monospace,monospace; font-size:11px; letter-spacing:0.14em; color:var(--mu); margin-bottom:20px; font-weight:500; }
.${P}-mono-sm { font-family:'JetBrains Mono',ui-monospace,monospace; font-size:10px; letter-spacing:0.12em; color:var(--mu); text-transform:uppercase; }
.${P}-mono-ac { font-family:'JetBrains Mono',ui-monospace,monospace; font-size:11px; letter-spacing:0.14em; color:var(--ac); text-transform:uppercase; margin-bottom:12px; font-weight:500; }
.${P}-h2 { font-family:'Inter',sans-serif; font-weight:600; font-size:clamp(32px,4.5vw,56px); letter-spacing:-0.025em; line-height:1.08; margin:0 0 48px; max-width:22ch; color:var(--ink); }
.${P}-h3 { font-family:'Inter',sans-serif; font-weight:600; font-size:clamp(26px,3.5vw,40px); letter-spacing:-0.02em; margin:24px 0 16px; color:var(--ink); }
.${P}-h2-lg { font-family:'Inter',sans-serif; font-weight:700; font-size:clamp(44px,7vw,88px); letter-spacing:-0.035em; line-height:1.02; margin:0 0 24px; max-width:20ch; margin-left:auto; margin-right:auto; background:linear-gradient(135deg,var(--ink) 0%,var(--acH) 80%,var(--gr1) 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
.${P}-body { font-size:17px; line-height:1.65; color:var(--ink2); } .${P}-body p { margin:0 0 18px; }
.${P}-pill { display:inline-flex; align-items:center; gap:10px; padding:6px 14px; border:1px solid var(--rl); border-radius:99px; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--ink2); letter-spacing:0.06em; text-transform:uppercase; background:rgba(124,92,255,0.05); margin-bottom:40px; }
.${P}-pill-dot { width:6px; height:6px; border-radius:50%; background:var(--gr1); box-shadow:0 0 8px var(--gr1); }
.${P}-btn { display:inline-flex; align-items:center; gap:10px; background:var(--ink); color:var(--bg); padding:14px 22px; border:1px solid var(--ink); border-radius:8px; font:inherit; font-weight:500; font-size:14px; cursor:pointer; transition:all 180ms; }
.${P}-btn:hover { background:var(--bg); color:var(--ink); }
.${P}-btn-accent { background:var(--ac); color:#fff; border-color:var(--ac); box-shadow:0 8px 30px -8px rgba(124,92,255,0.5); }
.${P}-btn-accent:hover { background:var(--acH); border-color:var(--acH); box-shadow:0 10px 40px -6px rgba(163,135,255,0.6); transform:translateY(-1px); }
.${P}-btn-lg { padding:18px 32px; font-size:15px; }
.${P}-btn-full { width:100%; justify-content:center; }
.${P}-trust { display:inline-flex; align-items:center; gap:8px; font-size:12px; color:var(--mu); } .${P}-trust-c { justify-content:center; margin-top:24px; }
.${P}-ctarow { display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
.${P}-hero { padding:140px 0 120px; border-top:none; position:relative; overflow:hidden; background:var(--bg); }
.${P}-hero-inner { text-align:center; max-width:900px; }
.${P}-hero-h { font-family:'Inter',sans-serif; font-weight:700; font-size:clamp(44px,7.5vw,100px); letter-spacing:-0.045em; line-height:0.98; margin:0 0 32px; background:linear-gradient(135deg,var(--ink) 0%,var(--ink) 50%,var(--acH) 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
.${P}-hero-sub { font-size:20px; line-height:1.5; color:var(--ink2); max-width:560px; margin:0 auto 48px; }
.${P}-hero .${P}-ctarow { justify-content:center; }
.${P}-grid-bg { position:absolute; inset:0; background-image:linear-gradient(var(--rl) 1px,transparent 1px),linear-gradient(90deg,var(--rl) 1px,transparent 1px); background-size:56px 56px; opacity:0.3; mask-image:radial-gradient(ellipse at center top,#000 0%,transparent 70%); -webkit-mask-image:radial-gradient(ellipse at center top,#000 0%,transparent 70%); pointer-events:none; }
.${P}-glow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
.${P}-glow-1 { top:-100px; right:10%; width:420px; height:420px; background:radial-gradient(circle,var(--ac) 0%,transparent 60%); opacity:0.3; }
.${P}-glow-2 { bottom:-100px; left:5%; width:360px; height:360px; background:radial-gradient(circle,var(--gr1) 0%,transparent 60%); opacity:0.2; }
.${P}-glow-c { top:-200px; left:50%; transform:translateX(-50%); width:600px; height:600px; background:radial-gradient(circle,var(--ac) 0%,transparent 60%); opacity:0.15; }
.${P}-sol-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:start; }
.${P}-sol-grid .${P}-h2 { margin-bottom:24px; } .${P}-sol-grid .${P}-body { margin:0; }
.${P}-sollist { display:flex; flex-direction:column; gap:16px; border-left:1px solid var(--rl); padding-left:32px; }
.${P}-sollist li { display:flex; gap:14px; font-size:16px; color:var(--ink); line-height:1.5; padding:8px 0; }
.${P}-check { color:var(--gr1); flex-shrink:0; margin-top:2px; }
.${P}-feat-sect { background:var(--bg2); }
.${P}-card-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.${P}-card { background:var(--card); border:1px solid var(--rl); border-radius:12px; padding:28px; transition:all 250ms; position:relative; overflow:hidden; }
.${P}-card::before { content:""; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0; transition:opacity 250ms; }
.${P}-card:hover { border-color:rgba(124,92,255,0.35); transform:translateY(-2px); }
.${P}-card:hover::before { opacity:1; }
.${P}-card-n { font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--ac); margin-bottom:16px; }
.${P}-card-t { font-weight:600; font-size:17px; color:var(--ink); margin:0 0 10px; letter-spacing:-0.01em; }
.${P}-card-d { font-size:14px; line-height:1.6; color:var(--ink2); margin:0; }
.${P}-tgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
.${P}-tm { background:var(--card); border:1px solid var(--rl); border-radius:12px; padding:28px; }
.${P}-tm blockquote { font-size:15px; line-height:1.55; color:var(--ink); margin:0 0 20px; }
.${P}-tm figcaption { display:flex; flex-direction:column; gap:2px; padding-top:16px; border-top:1px solid var(--rl); }
.${P}-tm-name { font-weight:500; font-size:14px; color:var(--ink); }
.${P}-tm-loc { font-size:12px; color:var(--mu); font-family:'JetBrains Mono',monospace; }
.${P}-tm-disc { font-size:10px; color:var(--mu); margin-top:12px; font-style:italic; }
.${P}-offer-sect { background:linear-gradient(180deg,var(--bg) 0%,var(--bg2) 100%); }
.${P}-offer-sect .${P}-mono { text-align:center; }
.${P}-offc { max-width:560px; margin:40px auto 0; background:var(--card); border:1px solid var(--rl); border-radius:16px; padding:48px 40px; position:relative; }
.${P}-offc::before { content:""; position:absolute; inset:-1px; border-radius:16px; padding:1px; background:linear-gradient(135deg,var(--ac),var(--gr1),var(--gr2)); -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; }
.${P}-offc-head { text-align:center; margin-bottom:32px; padding-bottom:32px; border-bottom:1px solid var(--rl); }
.${P}-offp { font-family:'Inter',sans-serif; font-weight:700; font-size:clamp(48px,7vw,88px); letter-spacing:-0.04em; line-height:1; background:linear-gradient(135deg,var(--ink) 0%,var(--acH) 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
.${P}-offl { display:flex; flex-direction:column; gap:12px; margin:0 0 32px; }
.${P}-offl li { display:flex; gap:12px; align-items:flex-start; font-size:15px; color:var(--ink2); line-height:1.55; }
.${P}-offl svg { color:var(--gr1); flex-shrink:0; margin-top:3px; }
.${P}-guar-ic { display:inline-grid; place-items:center; width:80px; height:80px; border-radius:50%; background:rgba(124,92,255,0.1); border:1px solid rgba(124,92,255,0.25); color:var(--ac); margin-bottom:24px; }
.${P}-guar-badge { display:inline-flex; align-items:baseline; gap:8px; padding:8px 18px; border-radius:99px; background:var(--card); border:1px solid var(--rl); margin-bottom:24px; font-weight:600; font-size:18px; }
.${P}-guar-badge .${P}-mono-sm { margin-left:4px; }
.${P}-faq-list { border-top:1px solid var(--rl); margin-top:16px; }
.${P}-faq-it { border-bottom:1px solid var(--rl); }
.${P}-faq-it summary { list-style:none; cursor:pointer; padding:24px 0; display:flex; justify-content:space-between; align-items:center; gap:24px; font-weight:500; font-size:16px; color:var(--ink); transition:color 180ms; }
.${P}-faq-it summary::-webkit-details-marker { display:none; }
.${P}-faq-it summary:hover { color:var(--acH); }
.${P}-faq-i { width:14px; height:14px; position:relative; flex-shrink:0; }
.${P}-faq-i::before, .${P}-faq-i::after { content:""; position:absolute; background:var(--ink2); transition:transform 200ms; }
.${P}-faq-i::before { top:6.5px; left:0; width:14px; height:1px; }
.${P}-faq-i::after { top:0; left:6.5px; width:1px; height:14px; }
.${P}-faq-it[open] .${P}-faq-i::after { transform:scaleY(0); }
.${P}-faq-a { padding:0 0 24px; font-size:15px; line-height:1.65; color:var(--ink2); max-width:72ch; }
.${P}-closing { padding:160px 0; background:var(--bg); border-top:1px solid var(--rl); position:relative; overflow:hidden; }
.${P}-closing .${P}-body { margin-bottom:40px; }
.${P}-disc { padding:64px 0; background:var(--bg2); border-top:1px solid var(--rl); }
.${P}-disc-b { max-width:720px; margin:0 auto 28px; font-size:12px; line-height:1.7; color:var(--mu); }
.${P}-disc-b h2 { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; color:var(--ink2); margin:0 0 14px; }
.${P}-disc-b p { margin:0 0 10px; } .${P}-disc-b strong { color:var(--ink2); font-weight:500; }
.${P}-footer { background:var(--bg); border-top:1px solid var(--rl); padding:64px 0 24px; color:var(--mu); }
.${P}-foot-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; padding-bottom:48px; border-bottom:1px solid var(--rl); }
.${P}-foot-brand { font-weight:700; font-size:20px; color:var(--ink); margin-bottom:12px; letter-spacing:-0.02em; }
.${P}-foot-meta { font-size:13px; line-height:1.65; margin:0; color:var(--mu); }
.${P}-foot-meta a { color:var(--ink2); } .${P}-foot-meta a:hover { color:var(--acH); }
.${P}-foot-h { font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink2); margin-bottom:16px; }
.${P}-foot-leg { list-style:none; padding:0; margin:0; }
.${P}-foot-leg li { margin-bottom:10px; } .${P}-foot-leg a { font-size:13px; color:var(--mu); } .${P}-foot-leg a:hover { color:var(--acH); }
.${P}-foot-bot { padding-top:24px; text-align:center; font-size:12px; color:var(--mu); }
.${P}-modal { display:none; position:fixed; inset:0; z-index:1000; align-items:flex-start; justify-content:center; padding:48px 20px; overflow-y:auto; font-family:'Inter',sans-serif; }
.${P}-modal:target { display:flex; }
.${P}-modal-bd { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); }
.${P}-modal-in { position:relative; background:var(--bg2); border:1px solid var(--rl); max-width:720px; width:100%; border-radius:12px; box-shadow:0 40px 80px -20px rgba(0,0,0,0.8); }
.${P}-modal-h { position:sticky; top:0; background:var(--bg2); display:flex; justify-content:space-between; align-items:center; padding:20px 28px; border-bottom:1px solid var(--rl); border-radius:12px 12px 0 0; }
.${P}-modal-t { font-family:'Inter',sans-serif; font-weight:600; font-size:18px; margin:0; color:var(--ink); letter-spacing:-0.01em; }
.${P}-modal-x { width:32px; height:32px; display:grid; place-items:center; font-size:22px; color:var(--ink2); border:1px solid var(--rl); border-radius:8px; background:var(--card); }
.${P}-modal-x:hover { background:var(--card); color:var(--ink); border-color:var(--ink2); }
.${P}-modal-b { padding:28px; font-size:14px; line-height:1.7; color:var(--ink2); }
.${P}-modal-b h2 { display:none; } .${P}-modal-b h3 { font-family:'Inter',sans-serif; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--ink); margin:20px 0 10px; }
.${P}-modal-b p { margin:0 0 12px; } .${P}-modal-b strong { color:var(--ink); font-weight:600; } .${P}-modal-b a { color:var(--acH); text-decoration:underline; }
.${P}-modal-b li { margin-bottom:6px; }
@media (max-width:960px) {
  .${P}-sect { padding:80px 0; } .${P}-hero { padding:100px 0 80px; }
  .${P}-sol-grid, .${P}-foot-grid { grid-template-columns:1fr; gap:32px; }
  .${P}-card-grid, .${P}-tgrid { grid-template-columns:1fr; gap:16px; }
  .${P}-offc { padding:32px 24px; }
}
@media (max-width:640px) { .${P}-wrap { padding:0 20px; } .${P}-hero-inner { text-align:left; } .${P}-hero .${P}-ctarow { justify-content:flex-start; } .${P}-closing { padding:100px 0; } }
`.replace(/\s+/g, " ").trim();
}
