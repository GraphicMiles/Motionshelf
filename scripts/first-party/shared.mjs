// Shared design system for every first-party component.
// Tokens, reset, motion primitives and the preview shell.
// Each component adds its own layout on top; nothing here is per-component.
//
// Reference: easyui.site, measured in-browser rather than guessed.
// Light page, white surface on a #f1f1f2 canvas, Geist, 24-26px radii,
// and exactly one soft shadow. Colour is SEMANTIC ONLY: green / amber / red
// appear solely to report deltas and status, never as brand decoration.

import { geistFace } from './font.mjs';

export const tokens = `
:root{
  color-scheme:light;
  --bg:#ffffff;
  --canvas:#f1f1f2;
  --s1:#ffffff;
  --s2:#f8f8f9;
  --s3:#f1f1f2;
  --s4:#e8e8ea;
  --s5:#dcdce0;
  --line:rgba(0,0,0,.075);
  --line-2:rgba(0,0,0,.1);
  --line-3:rgba(0,0,0,.16);
  --fg:#0a0a0a;
  --fg-2:#52525b;
  --fg-3:#5f5f68;
  --fg-4:#6b6b75;
  --accent:#0a0a0a;
  --accent-ink:#ffffff;
  --accent-soft:rgba(0,0,0,.05);
  --accent-line:rgba(0,0,0,.22);
  --ok:#146c34;
  --ok-bg:rgba(20,108,52,.1);
  --warn:#96500b;
  --warn-bg:rgba(180,83,9,.1);
  --danger:#b91c1c;
  --danger-bg:rgba(185,28,28,.09);
  --info:#1d4ed8;
  --r-xs:8px;
  --r-sm:12px;
  --r-md:14px;
  --r-lg:18px;
  --r-xl:24px;
  --r-2xl:26px;
  --r-full:999px;
  --shadow-1:0 1px 2px rgba(0,0,0,.04);
  --shadow-2:0 1px 2px rgba(0,0,0,.04),0 24px 48px -32px rgba(0,0,0,.2);
  --shadow-pop:0 2px 4px rgba(0,0,0,.04),0 16px 40px -16px rgba(0,0,0,.18);
  --ease-out:cubic-bezier(.16,1,.3,1);
  --ease-in-out:cubic-bezier(.65,0,.35,1);
  --spring:cubic-bezier(.34,1.36,.64,1);
  --t-1:130ms;
  --t-2:200ms;
  --t-3:300ms;
  --t-4:440ms;
  --font:Geist,"Geist Sans",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --mono:"Geist Mono",ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
}
`;

export const reset = `
${geistFace}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;height:100%}
body{
  background:var(--canvas);color:var(--fg);font-family:var(--font);
  font-size:15px;line-height:1.56;letter-spacing:-.011em;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  padding:12px;display:grid;place-items:start center;overflow:hidden;
}
button,input,select,textarea{font:inherit;color:inherit;letter-spacing:inherit;margin:0}
button{background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
a{color:inherit;text-decoration:none}
p{margin:0}
ol,ul{margin:0;padding:0;list-style:none}
h1,h2,h3,h4{margin:0;font-weight:600;letter-spacing:-.025em;line-height:1.25}
svg{display:block;flex:none}
::selection{background:rgba(0,0,0,.14)}
[hidden]{display:none!important}
`;

// A white surface on the grey canvas is the single strongest signal of the
// reference design, so the shell owns it and nothing else re-declares it.
export const shell = `
.demo{
  width:min(100%,460px);
  height:calc(100vh - 24px);
  min-height:0;
  display:flex;flex-direction:column;
  background:var(--s1);
  border:1px solid var(--line);
  border-radius:var(--r-2xl);
  box-shadow:var(--shadow-2);
  overflow:hidden;
  container-type:inline-size;
  container-name:preview;
  position:relative;
}
.frame-bar{
  display:flex;align-items:center;gap:8px;flex-wrap:nowrap;
  padding:11px 16px;flex:none;min-width:0;overflow:hidden;
  border-bottom:1px solid var(--line);
}
.frame-bar .pip{width:6px;height:6px;border-radius:50%;background:var(--fg-4);flex:none}
.frame-bar .frame-name{font-size:12px;color:var(--fg-3);font-weight:510;letter-spacing:-.006em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
.frame-bar .frame-tag{flex:none;font-size:11px;color:var(--fg-4);white-space:nowrap;letter-spacing:-.004em}
.stage{
  flex:1;min-height:0;display:flex;flex-direction:column;
  padding:18px;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--s5) transparent;
}
.stage::-webkit-scrollbar{width:8px;height:8px}
.stage::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px;border:2px solid var(--s1)}
.stage::-webkit-scrollbar-track{background:transparent}
.stage--center{justify-content:center}
/* short-content components get centred, which reads as a deliberate canvas
   rather than an unfinished panel. Matches easyui's own preview behaviour. */
.stage--opt{justify-content:center;padding-block:18px}
.stage--opt>*{flex:0 0 auto}
/* a component whose content is shorter than the frame should sit in it, not
   float at the top of a mostly-empty white box */
.stage--fill{align-items:stretch}
.stage--fill>*{flex:1;min-height:0}
.stage--pad0{padding:0}
/* short frames (the 296px phone preview) get a tighter frame, not squeezed content */
@media (max-height:320px){
  body{padding:7px}
  .demo{height:calc(100vh - 14px)}
  .frame-bar{padding:7px 13px}
  .stage{padding:10px}
}
@container preview (max-width:400px){
  .stage{padding:15px}
  .frame-bar{padding:10px 14px;gap:7px}
}
@container preview (max-width:330px){
  .stage{padding:13px}
  .frame-bar .frame-tag{display:none}
  .frame-bar .frame-name{font-size:11px}
}
`;

export const primitives = `
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  min-height:34px;padding:0 14px;border-radius:var(--r-sm);
  background:var(--s1);color:var(--fg);
  border:1px solid var(--line-2);
  box-shadow:var(--shadow-1);
  font-size:13px;font-weight:510;letter-spacing:-.008em;white-space:nowrap;
  transition:background var(--t-1) var(--ease-out),border-color var(--t-1) var(--ease-out),
             transform var(--t-1) var(--spring),box-shadow var(--t-1) var(--ease-out),
             opacity var(--t-1) var(--ease-out);
}
.btn:hover{background:var(--s2);border-color:var(--line-3)}
.btn:active{transform:scale(.97)}
.btn:focus-visible{outline:2px solid var(--fg);outline-offset:2px}
.btn:focus:not(:focus-visible){outline:none}
[tabindex]:focus:not(:focus-visible){outline:none}
.btn[disabled],.btn[aria-disabled=true]{opacity:.4;pointer-events:none}
.btn-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:520}
.btn-primary:hover{background:#262626;border-color:#262626}
.btn-danger{background:var(--danger);color:#fff;border-color:var(--danger);font-weight:520}
.btn-danger:hover{background:#b91c1c;border-color:#b91c1c}
.btn-ghost{background:transparent;border-color:transparent;box-shadow:none;color:var(--fg-2)}
.btn-ghost:hover{background:var(--s3);color:var(--fg);border-color:transparent}
.btn-sm{min-height:28px;padding:0 10px;font-size:12px;border-radius:var(--r-xs)}
.btn-icon{min-height:34px;width:34px;padding:0;border-radius:var(--r-sm)}

.field{display:block}
.label{display:block;font-size:12.5px;font-weight:510;color:var(--fg-2);margin:0 0 6px;letter-spacing:-.005em}
.input{
  width:100%;min-height:36px;padding:0 12px;
  background:var(--s1);color:var(--fg);
  border:1px solid var(--line-2);border-radius:var(--r-sm);
  box-shadow:var(--shadow-1);
  font-size:13.5px;letter-spacing:-.008em;
  transition:border-color var(--t-1) var(--ease-out),box-shadow var(--t-2) var(--ease-out),
             background var(--t-1) var(--ease-out);
}
.input::placeholder{color:var(--fg-4)}
.input:hover{border-color:var(--line-3)}
.input:focus{outline:none;border-color:var(--fg);box-shadow:0 0 0 3.5px rgba(0,0,0,.07)}
.input[aria-invalid=true]{border-color:var(--danger);box-shadow:0 0 0 3.5px rgba(220,38,38,.1)}
textarea.input{padding:10px 12px;min-height:68px;resize:none;line-height:1.55}
select.input{display:block;overflow:visible;padding:0 30px 0 12px;height:36px;line-height:34px;appearance:none;
  background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b75' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 11px center}

/* pill controls: easyui's search field and segmented switcher */
.pill{
  display:inline-flex;align-items:center;gap:7px;
  height:34px;padding:0 13px;border-radius:var(--r-full);
  background:var(--s3);border:1px solid transparent;color:var(--fg-2);
  font-size:13px;font-weight:510;letter-spacing:-.008em;white-space:nowrap;
  transition:background var(--t-1) var(--ease-out),color var(--t-1) var(--ease-out),
             box-shadow var(--t-1) var(--ease-out),transform var(--t-1) var(--spring);
}
.pill:hover{background:var(--s4);color:var(--fg)}
.pill:active{transform:scale(.98)}
.pill[aria-pressed=true],.pill.is-on{background:var(--s1);color:var(--fg);box-shadow:var(--shadow-1),0 0 0 1px var(--line-2)}
.pill:focus-visible{outline:2px solid var(--fg);outline-offset:2px}

.chip{
  display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;
  background:var(--s3);border:1px solid transparent;border-radius:var(--r-full);
  font-size:12px;color:var(--fg-2);letter-spacing:-.006em;white-space:nowrap;
  transition:background var(--t-1) var(--ease-out),color var(--t-1) var(--ease-out);
}
.chip:hover{background:var(--s4);color:var(--fg)}
.badge{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:20px;height:20px;padding:0 6px;border-radius:var(--r-full);
  background:var(--s4);color:var(--fg-2);font-size:11px;font-weight:550;
  letter-spacing:-.004em;font-variant-numeric:tabular-nums;
}
.badge-accent{background:var(--accent);color:var(--accent-ink)}
/* semantic tints: the only place colour is permitted to appear */
.badge-ok{background:var(--ok-bg);color:var(--ok)}
.badge-warn{background:var(--warn-bg);color:var(--warn)}
.badge-danger{background:var(--danger-bg);color:var(--danger)}
.dot{width:6px;height:6px;border-radius:50%;flex:none;background:var(--fg-4)}
.dot-ok{background:var(--ok)}
.dot-warn{background:var(--warn)}
.dot-danger{background:var(--danger)}
.kbd{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:19px;height:19px;padding:0 5px;
  background:var(--s3);border:1px solid var(--line-2);
  border-radius:6px;font-family:var(--mono);font-size:10.5px;color:var(--fg-3);
}
.sr-only,.viv{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0,0,0,0);white-space:nowrap;border:0}
.hint{font-size:12px;color:var(--fg-3);letter-spacing:-.004em}
.muted{color:var(--fg-3)}
.stack{display:grid;gap:12px}
.row{display:flex;align-items:center;gap:9px}
.spacer{flex:1}
.tnum{font-variant-numeric:tabular-nums}
`;

export const motion = `
@keyframes m-fade{from{opacity:0}to{opacity:1}}
@keyframes m-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes m-rise-sm{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
@keyframes m-pop{0%{opacity:0;transform:scale(.88)}60%{opacity:1;transform:scale(1.03)}100%{transform:scale(1)}}
@keyframes m-pop-tight{0%{opacity:0;transform:scale(.6)}100%{opacity:1;transform:scale(1)}}
@keyframes m-slide-in-right{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
@keyframes m-slide-in-left{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
@keyframes m-slide-in-bottom{from{opacity:0;transform:translateY(16px) scale(.985)}to{opacity:1;transform:none}}
@keyframes m-shimmer{from{background-position:-160% 0}to{background-position:260% 0}}
@keyframes m-spin{to{transform:rotate(360deg)}}
@keyframes m-pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes m-draw{from{stroke-dashoffset:20}to{stroke-dashoffset:0}}
@keyframes m-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes m-collapse{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.94)}}
@keyframes m-sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}

.anim-rise{animation:m-rise var(--t-3) var(--ease-out) both}
.anim-fade{animation:m-fade var(--t-2) var(--ease-out) both}
.anim-pop{animation:m-pop var(--t-3) var(--spring) both}
.anim-shake{animation:m-shake 360ms var(--ease-in-out)}

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important;scroll-behavior:auto!important;
  }
}
`;

// Inlined into every component bundle so each ZIP stays standalone.
export const prelude = `
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const raf=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));
const bump=(el,cls='anim-shake')=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
const glider=(el,fn)=>{ // move a shared indicator to a target, in one frame
  const t=fn(); if(!t||!el) return;
  el.style.transform='translate('+t.x+'px,'+t.y+'px)';
  el.style.width=t.w+'px'; el.style.height=t.h+'px';
};
`;

export const sharedCSS = [tokens, reset, shell, primitives, motion].join('\n');

// Renders the html wrapper for a component body.
export function htmlShell(title, slug, body, tag, stageClass = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — MotionShelf</title><link rel="stylesheet" href="./${slug}.css"></head><body><main class="demo"><div class="frame-bar"><span class="pip" aria-hidden="true"></span><span class="frame-name">${title}</span><span class="frame-tag">${tag}</span></div><h1 class="sr-only">${title}</h1><div class="stage${stageClass ? ' ' + stageClass : ''}">${body}</div></main><script src="./${slug}.js" defer></script></body></html>\n`;
}
