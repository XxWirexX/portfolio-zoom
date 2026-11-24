/**
 * Point d'entrée : branche le canvas, la caméra, les entrées et l'interface.
 * Le dessin est dans src/levels/, les textes dans src/content.ts.
 */
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import './style.css';

import { Camera, bindInput } from './engine/camera';
import { ZoomRenderer, devicePixelRatioClamp } from './engine/zoom';
import { LEVELS } from './levels';
import { levels as texts, site, spots } from './content';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false })!;
const overCanvas = document.getElementById('scene-over') as HTMLCanvasElement;
const over = overCanvas.getContext('2d', { alpha: false })!;
let overShown = false;
const renderer = new ZoomRenderer(LEVELS);
const N = LEVELS.length;
const mod = (i: number) => ((i % N) + N) % N;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(location.search);

// ---------- Point de départ : #niveau dans l'URL, ou ?t= pour déboguer ----------
const fromHash = LEVELS.findIndex((l) => `#${l.key}` === location.hash);
const start = params.has('t') ? Number(params.get('t')) : Math.max(0, fromHash);
const cam = new Camera(start);

// ---------- Interface ----------
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const cap = { box: $('caption'), kicker: $('cap-kicker'), title: $('cap-title'), body: $('cap-body') };
const hint = $('hint');
const tooltip = $('tooltip');
const panel = $<HTMLDialogElement>('panel');
const textVersion = $<HTMLDialogElement>('text-version');
($<HTMLAnchorElement>('gh-link')).href = site.github;

// Légende repliable (mémorisé dans le navigateur quand c'est possible)
const capToggle = $<HTMLButtonElement>('cap-toggle');
function setCollapsed(c: boolean) {
  cap.box.classList.toggle('collapsed', c);
  capToggle.textContent = c ? '+' : '–';
  capToggle.setAttribute('aria-expanded', String(!c));
  capToggle.setAttribute('aria-label', c ? 'Afficher la légende' : 'Réduire la légende');
}
try {
  setCollapsed(localStorage.getItem('caption-collapsed') === '1');
} catch {
  /* stockage indisponible : tant pis */
}
capToggle.addEventListener('click', () => {
  const c = !cap.box.classList.contains('collapsed');
  setCollapsed(c);
  try {
    localStorage.setItem('caption-collapsed', c ? '1' : '0');
  } catch {
    /* rien */
  }
});

if (params.has('nohud')) document.querySelectorAll<HTMLElement>('.brand,.top-actions,.levels,.caption,.hint').forEach((e) => (e.style.display = 'none'));

/** Va vers le niveau `idx` par le chemin le plus court (en avant ou en arrière). */
function travelTo(idx: number) {
  const cur = Math.round(cam.target);
  let delta = mod(idx - cur);
  if (delta > N / 2) delta -= N;
  cam.goTo(cur + delta);
  hideHint();
}

const list = $('level-list');
const navButtons = texts.map((t, i) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = `<span class="lbl">${t.nav}</span><span class="tick"></span>`;
  b.setAttribute('aria-label', `Aller au niveau ${t.nav}`);
  b.addEventListener('click', () => travelTo(i));
  li.appendChild(b);
  list.appendChild(li);
  return b;
});
document.querySelector<HTMLAnchorElement>('.brand-name')!.addEventListener('click', (e) => {
  e.preventDefault();
  travelTo(0);
});

let hintHidden = false;
function hideHint() {
  if (hintHidden) return;
  hintHidden = true;
  hint.classList.add('gone');
}

function openSpot(id: string) {
  const sp = spots[id];
  if (!sp) return;
  const lvl = texts.findIndex((t) => t.spots.includes(id));
  $('panel-kicker').textContent = lvl >= 0 ? texts[lvl].kicker : '';
  $('panel-title').textContent = sp.title;
  $('panel-tags').innerHTML = (sp.tags ?? []).map((t) => `<li>${esc(t)}</li>`).join('');
  $('panel-body').innerHTML = sp.body.map((p) => `<p>${esc(p)}</p>`).join('');
  $('panel-links').innerHTML = (sp.links ?? [])
    .map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
    .join('');
  tooltip.classList.remove('show');
  panel.showModal();
}

function buildTextVersion() {
  const html = texts
    .map((t, i) => {
      const items = t.spots
        .map((id) => {
          const sp = spots[id];
          if (!sp) return '';
          const tags = sp.tags?.length ? `<ul class="tags">${sp.tags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
          const links = (sp.links ?? [])
            .map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`)
            .join('');
          return `<h4>${esc(sp.title)}</h4>${sp.body.map((p) => `<p>${esc(p)}</p>`).join('')}${tags}${links ? `<div class="links">${links}</div>` : ''}`;
        })
        .join('');
      return `<h3><button type="button" data-go="${i}">${esc(t.kicker)} — ${esc(t.title)}</button></h3><p>${esc(t.body)}</p>${items}`;
    })
    .join('');
  $('tv-content').innerHTML = html;
  $('tv-content').querySelectorAll<HTMLButtonElement>('[data-go]').forEach((b) =>
    b.addEventListener('click', () => {
      textVersion.close();
      travelTo(Number(b.dataset.go));
    }),
  );
}
buildTextVersion();
$('text-btn').addEventListener('click', () => textVersion.showModal());

for (const dlg of [panel, textVersion]) {
  dlg.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // clic sur le fond (hors de la boîte) ou sur la croix
    if (target === dlg || target.closest('[data-close]')) dlg.close();
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// ---------- Entrées ----------
let dpr = devicePixelRatioClamp();
let mouse: { x: number; y: number } | null = null;

bindInput(
  canvas,
  cam,
  {
    onHover(x, y) {
      mouse = { x, y };
    },
    onLeave() {
      mouse = null;
    },
    onClick(x, y) {
      const id = renderer.hitTest(x * dpr, y * dpr);
      if (id) openSpot(id);
    },
    onFirstInput: hideHint,
  },
  () => N,
);
setTimeout(hideHint, 9000);

// ---------- Taille du canvas ----------
function resize() {
  dpr = devicePixelRatioClamp();
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  for (const c of [canvas, overCanvas]) {
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
  }
}
new ResizeObserver(resize).observe(canvas);
resize();

// ---------- Boucle ----------
let shownLevel = -1;
let lastHash = '';
let last = performance.now();
const t0 = last;

function updateHud() {
  const near = Math.round(cam.t);
  const idx = mod(near);
  const dist = Math.abs(cam.t - near);
  if (idx !== shownLevel) {
    shownLevel = idx;
    const t = texts[idx];
    cap.kicker.textContent = t.kicker;
    cap.title.textContent = t.title;
    cap.body.textContent = t.body;
    navButtons.forEach((b, i) => {
      b.classList.toggle('active', i === idx);
      if (i === idx) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
  }
  const a = 1 - Math.min(1, Math.max(0, (dist - 0.06) / 0.22));
  cap.box.style.opacity = String(a);
  cap.box.style.visibility = a < 0.02 ? 'hidden' : 'visible';
  cap.box.style.transform = `translateY(${(1 - a) * 12}px)`;

  // URL partageable (#chambre…) quand on est posé
  if (dist < 0.01) {
    const hash = `#${LEVELS[idx].key}`;
    if (hash !== lastHash) {
      lastHash = hash;
      history.replaceState(null, '', location.pathname + location.search + hash);
    }
  }

  // Survol
  let hover: string | null = null;
  if (mouse && !panel.open && !textVersion.open) hover = renderer.hitTest(mouse.x * dpr, mouse.y * dpr);
  renderer.hover = hover;
  canvas.classList.toggle('pointer', !!hover);
  if (hover && mouse) {
    const sp = spots[hover];
    tooltip.innerHTML = `${esc(sp?.title ?? hover)}<small>${esc(sp?.hint ?? '')}</small>`;
    const x = Math.min(mouse.x + 16, window.innerWidth - tooltip.offsetWidth - 8);
    tooltip.style.transform = `translate(${x}px, ${mouse.y + 18}px)`;
    tooltip.classList.add('show');
  } else {
    tooltip.classList.remove('show');
  }
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!params.has('t')) cam.step(dt, reduced);
  const a = renderer.render(ctx, over, canvas.width, canvas.height, cam.t, (now - t0) / 1000);
  if (a > 0 || overShown) {
    overCanvas.style.opacity = a.toFixed(3);
    overShown = a > 0;
  }
  updateHud();
  requestAnimationFrame(frame);
}

// On attend les polices (sinon le canvas dessine avec une police de secours).
Promise.race([
  Promise.all(
    ['500 16px "Space Grotesk"', '700 16px "Space Grotesk"', '400 16px "JetBrains Mono"', '600 16px "JetBrains Mono"', '700 16px "JetBrains Mono"'].map(
      (f) => document.fonts.load(f),
    ),
  ),
  new Promise((r) => setTimeout(r, 1500)),
]).finally(() => requestAnimationFrame(frame));

// Petit accès de débogage depuis la console : __zoom.go(3.5)
(window as unknown as { __zoom: unknown }).__zoom = {
  go: (t: number) => {
    cam.t = t;
    cam.target = t;
  },
  cam,
  /** Temps moyen (ms) pour dessiner une image à la position t. */
  bench: (t: number, n = 30) => {
    const s = performance.now();
    for (let i = 0; i < n; i++) renderer.render(ctx, over, canvas.width, canvas.height, t, i / 60);
    return (performance.now() - s) / n;
  },
};
