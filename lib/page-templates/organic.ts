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

const P = "dsf-og";

const SVG_ARROW = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const SVG_LOCK = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
const SVG_LEAF = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20s-2-6 2-10c4-4 10-5 13-4 0 3-0 9-4 13s-10 3-11 1z"/><path d="M5 21c0-6 3-10 6-12"/></svg>`;
const SVG_CIRCLE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="4"/></svg>`;

export function renderOrganic(args: RenderArgs): string {
  const mode = args.mode ?? "standalone";
  const body = renderBody(args);
  if (mode === "embed") return body;
  return wrapStandalone({
    lang: args.copy.language,
    title: args.copy.meta.title,
    description: args.copy.meta.description,
    bodyBg: "#fbf8f3",
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
  <div class="${P}-blob ${P}-blob-1"></div>
  <div class="${P}-blob ${P}-blob-2"></div>
  <div class="${P}-wrap ${P}-hero-grid">
    <div>
      <div class="${P}-tag">${SVG_LEAF}<span>${escapeHtml(c.hero.eyebrow)}</span></div>
      <h1 class="${P}-display ${P}-hero-h">${escapeHtml(c.hero.headline)}</h1>
      <p class="${P}-hero-sub">${escapeHtml(c.hero.subheadline)}</p>
      <div class="${P}-ctarow">
        <a href="${escapeAttr(ctaUrl)}" class="${P}-btn">${escapeHtml(c.hero.ctaLabel)} ${SVG_ARROW}</a>
        <div class="${P}-trust">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote || L.securePayment)}</span></div>
      </div>
    </div>
    <div class="${P}-hero-art">
      <div class="${P}-hero-art-inner">
        <div class="${P}-hero-art-circle"></div>
      </div>
    </div>
  </div>
</section>`;
}

function problem(c: PageCopy, L: Labels): string {
  const paras = c.problem.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-center">
    <div class="${P}-kicker">${escapeHtml(L.problem)}</div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.problem.title)}</h2>
    <div class="${P}-body ${P}-narrow">${paras}</div>
  </div>
</section>`;
}

function solution(c: PageCopy, L: Labels): string {
  const bullets = c.solution.bulletPoints
    .map((b) => `<li><span class="${P}-dot"></span><span>${escapeHtml(b)}</span></li>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-sol-grid">
    <div>
      <div class="${P}-kicker">${escapeHtml(L.solution)}</div>
      <h2 class="${P}-display ${P}-h2">${escapeHtml(c.solution.title)}</h2>
      <p class="${P}-body">${escapeHtml(c.solution.description)}</p>
    </div>
    <div class="${P}-sol-card">
      <ul class="${P}-sollist">${bullets}</ul>
    </div>
  </div>
</section>`;
}

function features(c: PageCopy, L: Labels): string {
  const items = c.features.items
    .map((f) => `
    <div class="${P}-card">
      <div class="${P}-card-ic">${SVG_CIRCLE}</div>
      <h3 class="${P}-card-t">${escapeHtml(f.title)}</h3>
      <p class="${P}-card-d">${escapeHtml(f.description)}</p>
    </div>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap ${P}-center">
    <div class="${P}-kicker">${escapeHtml(L.features)}</div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.features.title)}</h2>
    <div class="${P}-card-grid">${items}</div>
  </div>
</section>`;
}

function social(c: PageCopy, L: Labels): string {
  const items = c.socialProof.testimonials
    .map((t) => `
    <figure class="${P}-tm">
      <div class="${P}-tm-avatar">${initials(t.name)}</div>
      <blockquote>“${escapeHtml(t.text)}”</blockquote>
      <figcaption><strong>${escapeHtml(t.name)}</strong><span> · ${escapeHtml(t.location)}</span></figcaption>
      <p class="${P}-tm-disc">${escapeHtml(t.disclaimer)}</p>
    </figure>`)
    .join("");
  return `
<section class="${P}-sect ${P}-social-sect">
  <div class="${P}-wrap ${P}-center">
    <div class="${P}-kicker">${escapeHtml(L.testimonials)}</div>
    <h2 class="${P}-display ${P}-h2">${escapeHtml(c.socialProof.title)}</h2>
    <div class="${P}-tgrid">${items}</div>
  </div>
</section>`;
}

function offer(c: PageCopy, ctaUrl: string, price: string, L: Labels): string {
  const items = c.offer.items.map((it) => `<li><span class="${P}-dot"></span><span>${escapeHtml(it)}</span></li>`).join("");
  return `
<section class="${P}-sect" id="offer">
  <div class="${P}-wrap">
    <div class="${P}-offc">
      <div class="${P}-kicker ${P}-center">${escapeHtml(L.offer)}</div>
      <h2 class="${P}-display ${P}-h2 ${P}-center">${escapeHtml(c.offer.title)}</h2>
      <div class="${P}-offc-body">
        <ul class="${P}-offl">${items}</ul>
        <div class="${P}-offp-block">
          <div class="${P}-offp-label">${escapeHtml(c.offer.priceNote)}</div>
          <div class="${P}-offp ${P}-display">${escapeHtml(price)}</div>
          <a href="${escapeAttr(ctaUrl)}" class="${P}-btn ${P}-btn-lg ${P}-btn-full">${escapeHtml(c.offer.ctaLabel)} ${SVG_ARROW}</a>
          <div class="${P}-trust ${P}-trust-c">${SVG_LOCK}<span>${escapeHtml(c.offer.digistoreNote)}</span></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function guarantee(c: PageCopy, days: number): string {
  return `
<section class="${P}-sect ${P}-center">
  <div class="${P}-wrap">
    <div class="${P}-guar-badge">
      <span class="${P}-guar-days">${days}</span>
      <span class="${P}-guar-sub">${escapeHtml(daysLabel(c.language, days))}</span>
    </div>
    <h2 class="${P}-display ${P}-h3">${escapeHtml(c.guarantee.title)}</h2>
    <p class="${P}-body ${P}-narrow">${escapeHtml(c.guarantee.description)}</p>
  </div>
</section>`;
}

function faq(c: PageCopy, L: Labels): string {
  const items = c.faq.items
    .map((q) => `
    <details class="${P}-faq-it">
      <summary>${escapeHtml(q.question)}<span class="${P}-faq-i"></span></summary>
      <div class="${P}-faq-a">${escapeHtml(q.answer)}</div>
    </details>`)
    .join("");
  return `
<section class="${P}-sect">
  <div class="${P}-wrap">
    <div class="${P}-kicker ${P}-center">${escapeHtml(L.faq)}</div>
    <h2 class="${P}-display ${P}-h2 ${P}-center">${escapeHtml(c.faq.title)}</h2>
    <div class="${P}-faq-list">${items}</div>
  </div>
</section>`;
}

function closing(c: PageCopy, ctaUrl: string, L: Labels): string {
  return `
<section class="${P}-sect ${P}-closing">
  <div class="${P}-blob ${P}-blob-3"></div>
  <div class="${P}-wrap ${P}-center">
    <h2 class="${P}-display ${P}-h2-lg">${escapeHtml(c.closingCta.title)}</h2>
    <p class="${P}-body ${P}-narrow">${escapeHtml(c.closingCta.subtitle)}</p>
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
  <div class="${P}-wrap">
    <div class="${P}-foot-grid">
      <div>
        <div class="${P}-foot-brand ${P}-display">${escapeHtml(p.tradingName || p.legalName)}</div>
        <p class="${P}-foot-meta">${escapeHtml(p.legalName)}<br>${escapeHtml(p.taxIdType)}: ${escapeHtml(p.taxIdNumber)}<br>${escapeHtml(addr)}</p>
      </div>
      <div>
        <div class="${P}-foot-h">${escapeHtml(L.contactTitle)}</div>
        <p class="${P}-foot-meta"><a href="mailto:${escapeAttr(p.supportEmail || p.contactEmail)}">${escapeHtml(p.supportEmail || p.contactEmail)}</a></p>
        <div class="${P}-foot-pill">${SVG_LOCK}<span>${escapeHtml(L.securePayment)}</span></div>
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
    <div class="${P}-modal-h"><h3 class="${P}-display ${P}-modal-t">${escapeHtml(title)}</h3><a href="#" class="${P}-modal-x" aria-label="${escapeAttr(L.close)}">×</a></div>
    <div class="${P}-modal-b">${markdownToHtml(md)}</div>
  </div>
</div>`;
}

function css(): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
.${P}-page, .${P}-modal { --bg:#fbf8f3; --bg2:#f3ede2; --card:#ffffff; --ink:#2d2a26; --ink2:#55514a; --mu:#8a857c; --rl:#e8dfd0; --ac:#7a8970; --acH:#5e6c56; --blush:#e6ccbe; --sand:#efe4d0; --mx:1200px; }
.${P}-page { color:var(--ink); background:var(--bg); font-family:'DM Sans',-apple-system,system-ui,sans-serif; line-height:1.6; font-size:16px; -webkit-font-smoothing:antialiased; }
.${P}-page *, .${P}-modal * { box-sizing:border-box; }
.${P}-page p { margin:0 0 1em; } .${P}-page ul { margin:0; padding:0; list-style:none; } .${P}-page a { color:inherit; text-decoration:none; } .${P}-page figure { margin:0; }
.${P}-wrap { max-width:var(--mx); margin:0 auto; padding:0 28px; position:relative; z-index:1; }
.${P}-sect { padding:112px 0; }
.${P}-center { text-align:center; }
.${P}-narrow { max-width:620px; margin-left:auto; margin-right:auto; }
.${P}-display { font-family:'Cormorant Garamond',Georgia,serif; font-weight:500; letter-spacing:-0.005em; line-height:1.08; }
.${P}-h2 { font-size:clamp(40px,5.2vw,72px); margin:0 0 40px; }
.${P}-h2-lg { font-size:clamp(48px,7vw,96px); margin:0 0 24px; max-width:18ch; margin-left:auto; margin-right:auto; }
.${P}-h3 { font-size:clamp(28px,3.2vw,40px); margin:32px 0 16px; }
.${P}-kicker { display:inline-block; padding:6px 18px; border-radius:99px; background:var(--sand); color:var(--ink2); font-size:12px; font-weight:500; letter-spacing:0.06em; margin-bottom:20px; }
.${P}-kicker.${P}-center { display:inline-block; }
.${P}-tag { display:inline-flex; align-items:center; gap:8px; padding:8px 18px; border-radius:99px; background:var(--card); border:1px solid var(--rl); color:var(--ac); font-size:13px; font-weight:500; margin-bottom:32px; box-shadow:0 2px 8px rgba(45,42,38,0.04); }
.${P}-body { font-size:18px; line-height:1.7; color:var(--ink2); } .${P}-body p { margin:0 0 18px; }
.${P}-btn { display:inline-flex; align-items:center; gap:10px; background:var(--ink); color:var(--bg); padding:16px 28px; border:none; border-radius:99px; font-family:inherit; font-weight:500; font-size:15px; cursor:pointer; transition:all 240ms cubic-bezier(.2,.8,.2,1); box-shadow:0 4px 12px rgba(45,42,38,0.12); }
.${P}-btn:hover { background:var(--ac); transform:translateY(-2px); box-shadow:0 8px 24px rgba(122,137,112,0.3); }
.${P}-btn-lg { padding:18px 36px; font-size:16px; }
.${P}-btn-full { width:100%; justify-content:center; }
.${P}-trust { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:var(--mu); } .${P}-trust-c { justify-content:center; margin-top:20px; }
.${P}-ctarow { display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
.${P}-hero { padding:128px 0 104px; position:relative; overflow:hidden; background:var(--bg); }
.${P}-hero-grid { display:grid; grid-template-columns:1.3fr 1fr; gap:72px; align-items:center; }
.${P}-hero-h { font-size:clamp(48px,7.5vw,108px); margin:0 0 28px; max-width:15ch; line-height:1; }
.${P}-hero-sub { font-size:20px; line-height:1.6; color:var(--ink2); max-width:52ch; margin:0 0 40px; }
.${P}-hero-art { aspect-ratio:1; max-width:440px; margin:0 0 0 auto; position:relative; }
.${P}-hero-art-inner { position:absolute; inset:0; border-radius:50%; background:linear-gradient(135deg,var(--sand) 0%,var(--blush) 100%); display:grid; place-items:center; overflow:hidden; }
.${P}-hero-art-circle { width:52%; height:52%; border-radius:50%; background:rgba(255,255,255,0.55); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.7); }
.${P}-blob { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; opacity:0.35; }
.${P}-blob-1 { top:-80px; left:-80px; width:320px; height:320px; background:var(--blush); }
.${P}-blob-2 { bottom:-60px; right:-100px; width:360px; height:360px; background:var(--ac); opacity:0.18; }
.${P}-blob-3 { top:-80px; left:50%; transform:translateX(-50%); width:500px; height:500px; background:var(--blush); opacity:0.25; }
.${P}-sol-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
.${P}-sol-card { background:var(--card); border-radius:24px; padding:48px; box-shadow:0 20px 60px -20px rgba(45,42,38,0.12); border:1px solid var(--rl); }
.${P}-sollist { display:flex; flex-direction:column; gap:18px; }
.${P}-sollist li { display:flex; gap:14px; align-items:flex-start; font-size:16px; line-height:1.55; color:var(--ink); }
.${P}-dot { width:8px; height:8px; border-radius:50%; background:var(--ac); flex-shrink:0; margin-top:8px; }
.${P}-card-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:16px; text-align:left; }
.${P}-card { background:var(--card); border:1px solid var(--rl); border-radius:20px; padding:32px; transition:all 300ms cubic-bezier(.2,.8,.2,1); }
.${P}-card:hover { transform:translateY(-4px); box-shadow:0 20px 50px -20px rgba(45,42,38,0.15); border-color:var(--ac); }
.${P}-card-ic { display:inline-grid; place-items:center; width:44px; height:44px; border-radius:50%; background:var(--sand); color:var(--ac); margin-bottom:20px; }
.${P}-card-t { font-family:'DM Sans',sans-serif; font-weight:600; font-size:18px; margin:0 0 10px; color:var(--ink); letter-spacing:-0.01em; }
.${P}-card-d { font-size:15px; line-height:1.65; color:var(--ink2); margin:0; }
.${P}-social-sect { background:var(--bg2); }
.${P}-tgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:16px; text-align:left; }
.${P}-tm { background:var(--card); border-radius:20px; padding:32px; border:1px solid var(--rl); }
.${P}-tm-avatar { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,var(--sand),var(--blush)); display:grid; place-items:center; font-weight:600; color:var(--ink); margin-bottom:20px; font-size:14px; letter-spacing:0.04em; }
.${P}-tm blockquote { font-family:'Cormorant Garamond',serif; font-size:19px; line-height:1.5; color:var(--ink); margin:0 0 16px; font-style:italic; }
.${P}-tm figcaption { font-size:13px; color:var(--ink2); padding-top:14px; border-top:1px solid var(--rl); }
.${P}-tm figcaption strong { font-weight:600; color:var(--ink); }
.${P}-tm figcaption span { color:var(--mu); }
.${P}-tm-disc { font-size:11px; color:var(--mu); margin-top:10px; font-style:italic; }
.${P}-offc { background:var(--card); border-radius:32px; padding:56px; border:1px solid var(--rl); box-shadow:0 30px 80px -30px rgba(45,42,38,0.18); max-width:720px; margin:0 auto; }
.${P}-offc-body { margin-top:32px; display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
.${P}-offl { display:flex; flex-direction:column; gap:14px; }
.${P}-offl li { display:flex; gap:12px; align-items:flex-start; font-size:16px; line-height:1.5; color:var(--ink); }
.${P}-offp-block { background:var(--bg2); border-radius:20px; padding:32px 28px; text-align:center; }
.${P}-offp-label { font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--mu); margin-bottom:12px; }
.${P}-offp { font-size:clamp(52px,8vw,80px); color:var(--ink); line-height:1; margin-bottom:24px; }
.${P}-guar-badge { display:inline-flex; align-items:baseline; gap:10px; padding:14px 32px; border-radius:99px; background:var(--card); border:1px solid var(--rl); box-shadow:0 8px 24px rgba(45,42,38,0.08); margin-bottom:24px; }
.${P}-guar-days { font-family:'Cormorant Garamond',serif; font-size:44px; line-height:1; color:var(--ac); font-weight:500; }
.${P}-guar-sub { font-size:13px; color:var(--mu); font-weight:500; letter-spacing:0.04em; }
.${P}-faq-list { display:flex; flex-direction:column; gap:12px; margin-top:24px; max-width:800px; margin-left:auto; margin-right:auto; }
.${P}-faq-it { background:var(--card); border:1px solid var(--rl); border-radius:16px; transition:all 200ms; }
.${P}-faq-it:hover { border-color:var(--ac); }
.${P}-faq-it summary { list-style:none; cursor:pointer; padding:24px 28px; display:flex; justify-content:space-between; align-items:center; gap:20px; font-weight:500; font-size:17px; color:var(--ink); }
.${P}-faq-it summary::-webkit-details-marker { display:none; }
.${P}-faq-i { width:16px; height:16px; position:relative; flex-shrink:0; }
.${P}-faq-i::before, .${P}-faq-i::after { content:""; position:absolute; background:var(--ac); transition:transform 200ms; }
.${P}-faq-i::before { top:7.5px; left:0; width:16px; height:1px; }
.${P}-faq-i::after { top:0; left:7.5px; width:1px; height:16px; }
.${P}-faq-it[open] .${P}-faq-i::after { transform:scaleY(0); }
.${P}-faq-a { padding:0 28px 24px; font-size:16px; line-height:1.7; color:var(--ink2); }
.${P}-closing { padding:140px 0; background:var(--bg2); position:relative; overflow:hidden; }
.${P}-closing .${P}-body { margin-bottom:36px; }
.${P}-disc { padding:64px 0; background:var(--bg); }
.${P}-disc-b { max-width:720px; margin:0 auto 28px; font-size:13px; line-height:1.7; color:var(--mu); }
.${P}-disc-b h2 { font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; color:var(--ink2); margin:0 0 14px; }
.${P}-disc-b p { margin:0 0 10px; } .${P}-disc-b strong { color:var(--ink2); font-weight:500; }
.${P}-footer { background:var(--ink); color:rgba(251,248,243,0.7); padding:72px 0 24px; }
.${P}-foot-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:48px; padding-bottom:48px; border-bottom:1px solid rgba(251,248,243,0.1); }
.${P}-foot-brand { font-size:28px; color:var(--bg); margin-bottom:12px; }
.${P}-foot-meta { font-size:13px; line-height:1.7; margin:0; color:rgba(251,248,243,0.6); }
.${P}-foot-meta a { color:var(--bg); text-decoration:underline; text-underline-offset:2px; }
.${P}-foot-h { font-size:12px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:rgba(251,248,243,0.8); margin-bottom:16px; }
.${P}-foot-pill { display:inline-flex; align-items:center; gap:8px; margin-top:20px; padding:8px 14px; border-radius:99px; border:1px solid rgba(251,248,243,0.15); font-size:11px; color:rgba(251,248,243,0.7); }
.${P}-foot-leg { list-style:none; padding:0; margin:0; } .${P}-foot-leg li { margin-bottom:10px; }
.${P}-foot-leg a { font-size:13px; color:rgba(251,248,243,0.6); } .${P}-foot-leg a:hover { color:var(--bg); }
.${P}-foot-bot { padding-top:24px; text-align:center; font-size:12px; color:rgba(251,248,243,0.4); }
.${P}-modal { display:none; position:fixed; inset:0; z-index:1000; align-items:flex-start; justify-content:center; padding:48px 20px; overflow-y:auto; font-family:'DM Sans',sans-serif; }
.${P}-modal:target { display:flex; }
.${P}-modal-bd { position:fixed; inset:0; background:rgba(45,42,38,0.55); backdrop-filter:blur(6px); }
.${P}-modal-in { position:relative; background:var(--bg); max-width:720px; width:100%; border-radius:20px; box-shadow:0 30px 80px -20px rgba(45,42,38,0.4); }
.${P}-modal-h { position:sticky; top:0; background:var(--bg); display:flex; justify-content:space-between; align-items:center; padding:24px 32px; border-bottom:1px solid var(--rl); border-radius:20px 20px 0 0; }
.${P}-modal-t { font-size:24px; margin:0; color:var(--ink); font-weight:500; }
.${P}-modal-x { width:36px; height:36px; display:grid; place-items:center; font-size:22px; color:var(--mu); border:1px solid var(--rl); border-radius:50%; background:var(--card); }
.${P}-modal-x:hover { background:var(--ink); color:var(--bg); border-color:var(--ink); }
.${P}-modal-b { padding:32px; font-size:14px; line-height:1.7; color:var(--ink2); }
.${P}-modal-b h2 { display:none; } .${P}-modal-b h3 { font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; color:var(--ink); margin:24px 0 10px; }
.${P}-modal-b p { margin:0 0 12px; } .${P}-modal-b strong { color:var(--ink); font-weight:600; } .${P}-modal-b a { color:var(--ac); text-decoration:underline; }
.${P}-modal-b li { margin-bottom:6px; }
@media (max-width:960px) {
  .${P}-sect { padding:80px 0; } .${P}-hero { padding:80px 0 64px; }
  .${P}-hero-grid, .${P}-sol-grid, .${P}-foot-grid, .${P}-offc-body { grid-template-columns:1fr; gap:40px; }
  .${P}-hero-art { max-width:280px; margin:0 auto; }
  .${P}-card-grid, .${P}-tgrid { grid-template-columns:1fr; gap:16px; }
  .${P}-offc { padding:40px 28px; border-radius:24px; } .${P}-sol-card { padding:32px; }
}
@media (max-width:640px) { .${P}-wrap { padding:0 20px; } .${P}-btn, .${P}-btn-lg { width:100%; justify-content:center; } .${P}-ctarow .${P}-btn { width:auto; } }
`.replace(/\s+/g, " ").trim();
}
