import type { PageCopy } from "@/lib/schemas";
import type { CompanyProfile } from "@prisma/client";
import { formatFullAddress } from "@/lib/legal-templates";
import type { LegalTexts } from "@/lib/legal-templates";
import type { RenderArgs } from "./types";
import {
  escapeHtml,
  escapeAttr,
  initials,
  formatMoney,
  daysLabel,
  labelsForLang,
  markdownToHtml,
  wrapStandalone,
  type Labels,
} from "./shared";

const P = "dsf-ed"; // class prefix

const SVG_ARROW = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const SVG_LOCK = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

export function renderEditorial(args: RenderArgs): string {
  const mode = args.mode ?? "standalone";
  const body = renderBody(args);
  if (mode === "embed") return body;
  return wrapStandalone({
    lang: args.copy.language,
    title: args.copy.meta.title,
    description: args.copy.meta.description,
    bodyBg: "#faf8f4",
    body,
  });
}

function renderBody(args: RenderArgs): string {
  const { copy, project, companyProfile: p, legalTexts } = args;
  const ctaUrl = project.checkoutUrl || "#offer";
  const fullAddress = formatFullAddress(p);
  const year = new Date().getFullYear();
  const lang = copy.language;
  const L = labelsForLang(lang);
  const priceLabel = copy.offer.price || formatMoney(project.priceGross, project.currency, lang);

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
    <div class="${P}-label">${escapeHtml(c.hero.eyebrow)}</div>
    <h1 class="${P}-display ${P}-hero-h">${escapeHtml(c.hero.headline)}</h1>
    <p class="${P}-prose ${P}-hero-sub">${escapeHtml(c.hero.subheadline)}</p>
    <div class="${P}-ctarow">
      <a href="${escapeAttr(ctaUrl)}" class="${P}-btn">${escapeHtml(c.hero.ctaLabel)} ${SVG_ARROW}</a>
      <div class="${P}-trust">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span></div>
    </div>
  </div>
</section>`;
}

function problem(c: PageCopy, L: Labels): string {
  const paras = c.problem.paragraphs.map((p) => `<p class="${P}-prose ${P}-body">${escapeHtml(p)}</p>`).join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-shead"><span class="${P}-snum">01</span><span class="${P}-label">${escapeHtml(L.problem)}</span></div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.problem.title)}</h2>
    <div class="${P}-narrow">${paras}</div>
  </div>
</section>`;
}

function solution(c: PageCopy, L: Labels): string {
  const bullets = c.solution.bulletPoints
    .map((b, i) => `<li><span class="${P}-num">${String(i + 1).padStart(2, "0")}</span><span class="${P}-prose">${escapeHtml(b)}</span></li>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-shead"><span class="${P}-snum">02</span><span class="${P}-label">${escapeHtml(L.solution)}</span></div>
    <div class="${P}-split">
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.solution.title)}</h2>
      <p class="${P}-prose ${P}-body">${escapeHtml(c.solution.description)}</p>
    </div>
    <ul class="${P}-numlist">${bullets}</ul>
  </div>
</section>`;
}

function features(c: PageCopy, L: Labels): string {
  const items = c.features.items
    .map((f, i) => `
    <div class="${P}-feat">
      <div class="${P}-feat-n ${P}-display">${String(i + 1).padStart(2, "0")}</div>
      <h3 class="${P}-feat-t">${escapeHtml(f.title)}</h3>
      <p class="${P}-prose ${P}-feat-d">${escapeHtml(f.description)}</p>
    </div>`)
    .join("");
  return `
<section class="${P}-sect ${P}-feat-sect">
  <div class="${P}-wrap">
    <div class="${P}-shead"><span class="${P}-snum">03</span><span class="${P}-label">${escapeHtml(L.features)}</span></div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.features.title)}</h2>
    <div class="${P}-feat-grid">${items}</div>
  </div>
</section>`;
}

function social(c: PageCopy, L: Labels): string {
  const [feat, ...rest] = c.socialProof.testimonials;
  if (!feat) return "";
  const featHtml = `
    <figure class="${P}-tfeat">
      <blockquote class="${P}-display ${P}-tquote">“${escapeHtml(feat.text)}”</blockquote>
      <figcaption class="${P}-tcap">
        <div class="${P}-avatar">${initials(feat.name)}</div>
        <div><div class="${P}-tname">${escapeHtml(feat.name)}</div><div class="${P}-tloc">${escapeHtml(feat.location)}</div></div>
      </figcaption>
      <p class="${P}-tdisc">${escapeHtml(feat.disclaimer)}</p>
    </figure>`;
  const restHtml = rest
    .map((t) => `
      <figure class="${P}-tsm">
        <blockquote class="${P}-prose ${P}-tsmq">“${escapeHtml(t.text)}”</blockquote>
        <figcaption class="${P}-tsmc"><span class="${P}-tname">${escapeHtml(t.name)}</span> · <span class="${P}-tloc">${escapeHtml(t.location)}</span></figcaption>
        <p class="${P}-tdisc">${escapeHtml(t.disclaimer)}</p>
      </figure>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-shead"><span class="${P}-snum">04</span><span class="${P}-label">${escapeHtml(L.testimonials)}</span></div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.socialProof.title)}</h2>
    ${featHtml}
    ${rest.length ? `<div class="${P}-tgrid">${restHtml}</div>` : ""}
  </div>
</section>`;
}

function offer(c: PageCopy, ctaUrl: string, price: string, L: Labels): string {
  const items = c.offer.items.map((it) => `<li><span class="${P}-offm">—</span><span class="${P}-prose">${escapeHtml(it)}</span></li>`).join("");
  return `
<section class="${P}-sect ${P}-offer" id="offer">
  <div class="${P}-wrap-sm">
    <div class="${P}-shead ${P}-center"><span class="${P}-snum">05</span><span class="${P}-label">${escapeHtml(L.offer)}</span></div>
    <h2 class="${P}-display ${P}-h2 ${P}-center">${escapeHtml(c.offer.title)}</h2>
    <div class="${P}-offc">
      <ul class="${P}-offl">${items}</ul>
      <div class="${P}-offd"></div>
      <div class="${P}-offp-block">
        <div class="${P}-offp-rule"></div>
        <div class="${P}-offp ${P}-display">${escapeHtml(price)}</div>
        <div class="${P}-offp-note">${escapeHtml(c.offer.priceNote)}</div>
      </div>
      <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-lg ${P}-btn-oncard">${escapeHtml(c.offer.ctaLabel)} ${SVG_ARROW}</a>
      <div class="${P}-off-digi">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote)}</span></div>
    </div>
  </div>
</section>`;
}

function guarantee(c: PageCopy, days: number): string {
  return `
<section class="${P}-sect ${P}-center">
  <div class="${P}-wrap">
    <div class="${P}-seal">
      <div class="${P}-seal-n ${P}-display">${days}</div>
      <div class="${P}-seal-l ${P}-label">${escapeHtml(daysLabel(c.language, days))}</div>
    </div>
    <h2 class="${P}-display ${P}-h3">${escapeHtml(c.guarantee.title)}</h2>
    <p class="${P}-prose ${P}-body ${P}-narrow-p">${escapeHtml(c.guarantee.description)}</p>
  </div>
</section>`;
}

function faq(c: PageCopy, L: Labels): string {
  const items = c.faq.items
    .map((q) => `
    <details class="${P}-faq-it">
      <summary><span>${escapeHtml(q.question)}</span><span class="${P}-faq-icon"></span></summary>
      <div class="${P}-faq-a ${P}-prose">${escapeHtml(q.answer)}</div>
    </details>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-shead"><span class="${P}-snum">06</span><span class="${P}-label">${escapeHtml(L.faq)}</span></div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.faq.title)}</h2>
    <div class="${P}-faq-list">${items}</div>
  </div>
</section>`;
}

function closing(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="${P}-sect ${P}-closing">
  <div class="${P}-wrap ${P}-center">
    <h2 class="${P}-display ${P}-h2-lg">${escapeHtml(c.closingCta.title)}</h2>
    <p class="${P}-prose ${P}-body ${P}-narrow-p">${escapeHtml(c.closingCta.subtitle)}</p>
    <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-lg">${escapeHtml(c.closingCta.ctaLabel)} ${SVG_ARROW}</a>
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
  <div class="${P}-wrap ${P}-foot-grid">
    <div>
      <div class="${P}-foot-brand ${P}-display">${escapeHtml(p.tradingName || p.legalName)}</div>
      <p class="${P}-foot-meta">${escapeHtml(p.legalName)}<br>${escapeHtml(p.taxIdType)}: ${escapeHtml(p.taxIdNumber)}<br>${escapeHtml(addr)}</p>
    </div>
    <div>
      <div class="${P}-label">${escapeHtml(L.contactTitle)}</div>
      <p class="${P}-foot-meta"><a href="mailto:${escapeAttr(p.supportEmail || p.contactEmail)}">${escapeHtml(p.supportEmail || p.contactEmail)}</a></p>
      <div class="${P}-foot-badge">${SVG_LOCK}<span>${escapeHtml(L.securePayment)}</span></div>
    </div>
    <div>
      <div class="${P}-label">${escapeHtml(L.legalTitle)}</div>
      <ul class="${P}-foot-leg">
        <li><a href="#modal-${P}-mentions">${escapeHtml(L.mentions)}</a></li>
        <li><a href="#modal-${P}-privacy">${escapeHtml(L.privacy)}</a></li>
        <li><a href="#modal-${P}-terms">${escapeHtml(L.terms)}</a></li>
        <li><a href="#modal-${P}-refund">${escapeHtml(L.refund)}</a></li>
      </ul>
    </div>
  </div>
  <div class="${P}-foot-bot"><div class="${P}-wrap">© ${year} ${escapeHtml(p.legalName)}. ${escapeHtml(L.rights)}</div></div>
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
    <div class="${P}-modal-h"><h3 class="${P}-display ${P}-modal-t">${escapeHtml(title)}</h3><a href="#" class="${P}-modal-x" aria-label="${escapeAttr(L.close)}">×</a></div>
    <div class="${P}-modal-b">${markdownToHtml(md)}</div>
  </div>
</div>`;
}

function css(): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
.${P}-page, .${P}-modal { --i:#1a1815; --i2:#3a3730; --mu:#6b6760; --cr:#faf8f4; --cr2:#f4f1ea; --sg:#ebe7dd; --rl:#d6d1c4; --ac:#b4653f; --acH:#8e4d2f; --mx:1120px; }
.${P}-page { color:var(--i); background:var(--cr); font-family:'Inter',-apple-system,system-ui,sans-serif; line-height:1.55; font-size:16px; -webkit-font-smoothing:antialiased; }
.${P}-page *, .${P}-page *::before, .${P}-page *::after, .${P}-modal *, .${P}-modal *::before, .${P}-modal *::after { box-sizing:border-box; }
.${P}-page p { margin:0 0 1em; } .${P}-page ul { margin:0; padding:0; } .${P}-page a { color:inherit; text-decoration:none; } .${P}-page figure { margin:0; }
.${P}-wrap { max-width:var(--mx); margin:0 auto; padding:0 28px; }
.${P}-wrap-sm { max-width:720px; margin:0 auto; padding:0 28px; }
.${P}-narrow { max-width:680px; } .${P}-narrow-p { max-width:640px; margin-left:auto; margin-right:auto; }
.${P}-sect { padding:120px 0; border-top:1px solid var(--rl); }
.${P}-center { text-align:center; }
.${P}-display { font-family:'Instrument Serif','Iowan Old Style',Georgia,serif; font-weight:400; letter-spacing:-0.005em; line-height:1.08; }
.${P}-prose { font-family:'Lora',Georgia,serif; font-weight:400; }
.${P}-body { font-size:18px; line-height:1.7; color:var(--i2); margin-bottom:24px; }
.${P}-label { display:inline-block; font-size:11px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:var(--mu); }
.${P}-h2 { font-size:clamp(36px,4.5vw,60px); margin:24px 0 56px; max-width:24ch; }
.${P}-h2-lg { font-size:clamp(42px,6vw,80px); margin:0 0 28px; max-width:18ch; margin-left:auto; margin-right:auto; }
.${P}-h3 { font-size:clamp(28px,3.2vw,40px); margin:40px 0 20px; }
.${P}-shead { display:inline-flex; align-items:center; gap:16px; margin-bottom:4px; }
.${P}-shead.${P}-center { display:flex; justify-content:center; }
.${P}-snum { font-family:'Instrument Serif',serif; font-style:italic; font-size:22px; color:var(--ac); }
.${P}-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; background:var(--i); color:var(--cr); padding:18px 28px; border:none; border-radius:2px; font-family:inherit; font-weight:500; font-size:14px; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; transition:background 180ms, transform 180ms; }
.${P}-btn:hover { background:var(--acH); transform:translateY(-1px); }
.${P}-btn svg { transition:transform 180ms; } .${P}-btn:hover svg { transform:translateX(3px); }
.${P}-btn-lg { padding:22px 36px; font-size:15px; }
.${P}-trust { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:0.03em; color:var(--mu); } .${P}-trust-c { justify-content:center; margin-top:24px; }
.${P}-hero { padding:120px 0 96px; background:var(--cr); border-top:none; }
.${P}-hero .${P}-label { margin-bottom:40px; }
.${P}-hero-h { font-size:clamp(48px,7.6vw,112px); margin:0 0 36px; max-width:16ch; }
.${P}-hero-sub { font-size:21px; line-height:1.6; max-width:56ch; color:var(--i2); margin:0 0 56px; }
.${P}-ctarow { display:flex; align-items:center; gap:32px; flex-wrap:wrap; }
.${P}-split { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:start; margin-bottom:64px; }
.${P}-split .${P}-h2 { margin:0; max-width:none; } .${P}-split .${P}-body { margin:0; }
.${P}-numlist { list-style:none; padding:0; border-top:1px solid var(--rl); }
.${P}-numlist > li { display:grid; grid-template-columns:80px 1fr; gap:24px; padding:28px 0; border-bottom:1px solid var(--rl); align-items:baseline; }
.${P}-num { font-family:'Instrument Serif',serif; font-style:italic; font-size:40px; color:var(--ac); line-height:1; }
.${P}-numlist span.${P}-prose { font-size:19px; line-height:1.55; color:var(--i2); }
.${P}-feat-sect { background:var(--cr2); }
.${P}-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:48px 56px; margin-top:16px; }
.${P}-feat { border-top:1px solid var(--rl); padding-top:28px; }
.${P}-feat-n { font-size:36px; font-style:italic; color:var(--ac); line-height:1; margin-bottom:16px; }
.${P}-feat-t { font-family:'Inter',sans-serif; font-weight:500; font-size:18px; margin:0 0 12px; color:var(--i); }
.${P}-feat-d { font-size:16px; line-height:1.65; color:var(--i2); margin:0; }
.${P}-tfeat { margin:40px 0 64px; padding:72px 64px; border:1px solid var(--rl); background:#fff; text-align:center; }
.${P}-tquote { font-size:clamp(24px,3vw,36px); font-style:italic; color:var(--i); margin:0 auto 40px; max-width:44ch; line-height:1.35; }
.${P}-tcap { display:inline-flex; align-items:center; gap:14px; }
.${P}-avatar { width:40px; height:40px; border-radius:50%; background:var(--sg); color:var(--i); display:grid; place-items:center; font-weight:500; font-size:14px; }
.${P}-tname { font-weight:500; color:var(--i); font-size:14px; } .${P}-tloc { font-size:13px; color:var(--mu); }
.${P}-tdisc { font-size:11px; font-style:italic; color:var(--mu); margin-top:16px; }
.${P}-tgrid { display:grid; grid-template-columns:1fr 1fr; gap:40px; }
.${P}-tsm { border-top:1px solid var(--rl); padding-top:24px; }
.${P}-tsmq { font-style:italic; font-size:18px; line-height:1.55; color:var(--i2); margin:0 0 16px; }
.${P}-tsmc { font-size:13px; color:var(--mu); }
.${P}-offer { background:var(--i); color:var(--cr); border-top-color:var(--i2); }
.${P}-offer .${P}-label { color:rgba(250,248,244,0.6); } .${P}-offer .${P}-snum { color:var(--ac); } .${P}-offer .${P}-h2 { color:var(--cr); margin-top:24px; }
.${P}-offc { margin-top:40px; padding:56px 48px; border:1px solid rgba(250,248,244,0.15); background:rgba(250,248,244,0.03); }
.${P}-offl { list-style:none; padding:0; margin:0 0 40px; }
.${P}-offl li { display:grid; grid-template-columns:40px 1fr; gap:16px; padding:14px 0; font-size:17px; line-height:1.55; color:var(--cr); border-bottom:1px solid rgba(250,248,244,0.1); }
.${P}-offl li:last-child { border-bottom:none; } .${P}-offm { color:var(--ac); font-weight:500; }
.${P}-offd { height:1px; background:rgba(250,248,244,0.15); margin:8px 0 40px; }
.${P}-offp-block { text-align:center; margin-bottom:40px; }
.${P}-offp-rule { width:40px; height:1px; background:var(--ac); margin:0 auto 24px; }
.${P}-offp { font-size:clamp(56px,8vw,96px); color:var(--cr); margin-bottom:8px; }
.${P}-offp-note { font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(250,248,244,0.6); }
.${P}-btn-oncard { width:100%; background:var(--cr); color:var(--i); } .${P}-btn-oncard:hover { background:var(--ac); color:var(--cr); }
.${P}-off-digi { margin-top:24px; text-align:center; font-size:11px; color:rgba(250,248,244,0.6); display:flex; align-items:center; justify-content:center; gap:8px; }
.${P}-seal { width:140px; height:140px; border-radius:50%; border:1px solid var(--rl); display:grid; place-items:center; margin:0 auto 32px; position:relative; }
.${P}-seal::before, .${P}-seal::after { content:""; position:absolute; width:120px; height:120px; border-radius:50%; border:1px solid var(--rl); }
.${P}-seal::before { opacity:0.5; } .${P}-seal::after { width:100px; height:100px; opacity:0.25; }
.${P}-seal-n { font-size:56px; line-height:1; color:var(--ac); position:relative; z-index:1; }
.${P}-seal-l { position:relative; z-index:1; font-size:10px; margin-top:4px; }
.${P}-faq-list { border-top:1px solid var(--rl); }
.${P}-faq-it { border-bottom:1px solid var(--rl); }
.${P}-faq-it summary { list-style:none; cursor:pointer; padding:26px 0; display:flex; justify-content:space-between; align-items:center; gap:32px; font-size:18px; font-weight:500; color:var(--i); }
.${P}-faq-it summary::-webkit-details-marker { display:none; }
.${P}-faq-it summary:hover { color:var(--ac); }
.${P}-faq-icon { width:16px; height:16px; position:relative; flex-shrink:0; }
.${P}-faq-icon::before, .${P}-faq-icon::after { content:""; position:absolute; background:var(--mu); transition:transform 200ms; }
.${P}-faq-icon::before { top:7.5px; left:0; width:16px; height:1px; }
.${P}-faq-icon::after { top:0; left:7.5px; width:1px; height:16px; }
.${P}-faq-it[open] .${P}-faq-icon::after { transform:scaleY(0); }
.${P}-faq-a { padding:0 0 28px; font-size:17px; line-height:1.7; color:var(--i2); max-width:75ch; }
.${P}-closing { padding:140px 0; background:var(--cr2); }
.${P}-closing .${P}-body { margin-bottom:40px; font-size:19px; }
.${P}-disc { padding:64px 0; border-top:1px solid var(--rl); background:var(--cr2); }
.${P}-disc-b { max-width:680px; margin:0 auto 32px; font-size:13px; line-height:1.7; color:var(--mu); font-family:'Inter',sans-serif; }
.${P}-disc-b h2 { font-family:'Inter',sans-serif; font-size:13px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:var(--i2); margin:0 0 16px; }
.${P}-disc-b p { font-family:inherit; margin:0 0 12px; } .${P}-disc-b strong { color:var(--i2); font-weight:500; }
.${P}-footer { background:var(--i); color:rgba(250,248,244,0.7); padding:80px 0 0; border-top:none; }
.${P}-foot-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:56px; padding-bottom:56px; }
.${P}-footer .${P}-label { color:rgba(250,248,244,0.5); margin-bottom:16px; }
.${P}-foot-brand { font-size:28px; color:var(--cr); margin-bottom:16px; }
.${P}-foot-meta { font-size:13px; line-height:1.7; margin:0; color:rgba(250,248,244,0.6); }
.${P}-foot-meta a { color:var(--cr); text-decoration:underline; }
.${P}-foot-badge { display:inline-flex; align-items:center; gap:8px; margin-top:20px; padding:8px 12px; border:1px solid rgba(250,248,244,0.15); font-size:11px; color:rgba(250,248,244,0.7); }
.${P}-foot-leg { list-style:none; padding:0; margin:0; }
.${P}-foot-leg li { margin-bottom:10px; }
.${P}-foot-leg a { font-size:13px; color:rgba(250,248,244,0.6); }
.${P}-foot-leg a:hover { color:var(--ac); }
.${P}-foot-bot { border-top:1px solid rgba(250,248,244,0.12); padding:24px 0; font-size:11px; letter-spacing:0.06em; color:rgba(250,248,244,0.4); text-align:center; }
.${P}-modal { display:none; position:fixed; inset:0; z-index:1000; align-items:flex-start; justify-content:center; padding:48px 20px; overflow-y:auto; font-family:'Inter',sans-serif; }
.${P}-modal:target { display:flex; }
.${P}-modal-bd { position:fixed; inset:0; background:rgba(26,24,21,0.72); backdrop-filter:blur(4px); }
.${P}-modal-in { position:relative; background:var(--cr); max-width:720px; width:100%; border-radius:2px; box-shadow:0 30px 60px -12px rgba(26,24,21,0.4); }
.${P}-modal-h { position:sticky; top:0; background:var(--cr); display:flex; justify-content:space-between; align-items:center; padding:24px 32px; border-bottom:1px solid var(--rl); }
.${P}-modal-t { font-size:22px; margin:0; color:var(--i); }
.${P}-modal-x { width:32px; height:32px; display:grid; place-items:center; font-size:24px; color:var(--mu); border:1px solid var(--rl); border-radius:2px; }
.${P}-modal-x:hover { background:var(--i); color:var(--cr); }
.${P}-modal-b { padding:32px; font-size:14px; line-height:1.7; color:var(--i2); }
.${P}-modal-b h2 { display:none; } .${P}-modal-b h3 { font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:var(--i); margin:24px 0 10px; }
.${P}-modal-b p { margin:0 0 12px; } .${P}-modal-b strong { color:var(--i); font-weight:600; } .${P}-modal-b a { color:var(--ac); text-decoration:underline; }
.${P}-modal-b li { margin-bottom:6px; }
@media (max-width:960px) {
  .${P}-sect { padding:88px 0; } .${P}-hero { padding:80px 0 64px; }
  .${P}-split { grid-template-columns:1fr; gap:24px; }
  .${P}-feat-grid { grid-template-columns:repeat(2,1fr); gap:40px 32px; }
  .${P}-tgrid { grid-template-columns:1fr; gap:32px; } .${P}-tfeat { padding:48px 32px; }
  .${P}-foot-grid { grid-template-columns:1fr; gap:40px; } .${P}-offc { padding:40px 28px; }
}
@media (max-width:640px) {
  .${P}-sect { padding:72px 0; } .${P}-hero { padding:64px 0 48px; } .${P}-wrap, .${P}-wrap-sm { padding:0 20px; }
  .${P}-feat-grid { grid-template-columns:1fr; gap:32px; }
  .${P}-numlist > li { grid-template-columns:56px 1fr; gap:16px; padding:20px 0; } .${P}-num { font-size:32px; }
  .${P}-btn, .${P}-btn-lg { width:100%; } .${P}-ctarow .${P}-btn { width:auto; }
  .${P}-offc { padding:32px 20px; } .${P}-modal-b { padding:24px; } .${P}-modal-h { padding:20px 24px; }
}
`.replace(/\s+/g, " ").trim();
}
