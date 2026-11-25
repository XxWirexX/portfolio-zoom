/**
 * 07 · ~/projets : une grille de cartes. Titres, sous-titres et tags viennent
 * de `content.ts` (spots). La carte du milieu montre l'infra : sa vignette
 * est le portail vers la salle serveur.
 */
import type { Level } from '../engine/types';
import { spots } from '../content';
import { C, fillRR, glow, inView, rgba, text, textWidth, FONT } from '../engine/util';

const CARD_W = 1.0;
const CARD_H = 0.493;
const GAP = 0.06;
const X0 = -1.56;
const Y0 = -0.72;

/** Les cartes : colonne, ligne et largeur (en cases). `null` = la carte infra (portail). */
const CARDS: { id: string | null; col: number; row: number; span?: number }[] = [
  { id: 'dle', col: 0, row: 0, span: 2 },
  { id: 'intrasso', col: 2, row: 0 },
  { id: 'lucca', col: 0, row: 1 },
  { id: null, col: 1, row: 1 },
  { id: 'auth', col: 2, row: 1 },
  { id: 'zeste', col: 0, row: 2 },
  { id: 'panel', col: 1, row: 2 },
  { id: 'github', col: 2, row: 2 },
];

const STATUS: Record<string, [string, string]> = {
  dle: ['en ligne', '#3dd68c'],
  intrasso: ['en cours', '#ffcb6b'],
  lucca: ['pro · Axopen', C.blueSoft],
  auth: ['en ligne', '#3dd68c'],
  zeste: ['en ligne', '#3dd68c'],
  panel: ['en service', '#3dd68c'],
};

/** Mini-grille façon Wordle, pour illustrer la carte DLE. */
const DLE_ROWS = ['gyxgg', 'xgyxg', 'ggggg'];

const S = 0.15;
const PW = 1.6 * S;
const PH = 0.9 * S;
const PX = X0 + CARD_W + GAP + 0.03 + PW;
const PY = Y0 + CARD_H + GAP + CARD_H / 2 + 0.025;

export const projets: Level = {
  key: 'projets',
  scale: 0.88,
  portal: { x: PX, y: PY, s: S },
  clip(ctx) {
    ctx.rect(PX - PW, PY - PH, PW * 2, PH * 2);
  },
  draw(d) {
    const { ctx, time, px, view } = d;

    ctx.fillStyle = '#0b0d15';
    ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
    d.layer(0.9, (v) => {
      // grille de points
      if (!d.visible(0.08, 6)) return;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      const z = 1.5 / px;
      for (let x = Math.floor(v.x0 / 0.08) * 0.08; x < v.x1; x += 0.08)
        for (let y = Math.floor(v.y0 / 0.08) * 0.08; y < v.y1; y += 0.08) ctx.fillRect(x, y, z, z);
      glow(ctx, -1.4, -1.0, 1.1, C.red, 0.08);
      glow(ctx, 1.5, 1.0, 1.1, C.blue, 0.1);
    });

    d.layer(1, () => {
      // En-tête
      text(ctx, '~/', X0, -0.8, 0.05, C.red, { font: FONT.mono, weight: 700 });
      text(ctx, 'projets', X0 + 0.065, -0.8, 0.05, '#ffffff', { font: FONT.mono, weight: 700 });
      let cx = 0.62;
      for (const [i, f] of ['tout', 'web', 'infra', 'jeux', 'pro'].entries()) {
        const w = textWidth(ctx, f, 0.022, FONT.mono) + 0.05;
        fillRR(ctx, cx, -0.84, w, 0.05, 0.025, i === 0 ? '#ffffff' : 'rgba(255,255,255,0.07)');
        text(ctx, f, cx + w / 2, -0.807, 0.022, i === 0 ? '#0b0d15' : 'rgba(255,255,255,0.7)', {
          align: 'center',
          font: FONT.mono,
        });
        cx += w + 0.02;
      }

      CARDS.forEach(({ id, col, row, span = 1 }) => {
        const x = X0 + col * (CARD_W + GAP);
        const y = Y0 + row * (CARD_H + GAP);
        const W = CARD_W * span + GAP * (span - 1);

        if (id === null) {
          // Carte infra
          const g = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
          g.addColorStop(0, rgba(C.red, 0.18));
          g.addColorStop(1, rgba(C.blue, 0.22));
          fillRR(ctx, x, y, CARD_W, CARD_H, 0.03, '#121625');
          fillRR(ctx, x, y, CARD_W, CARD_H, 0.03, g);
          ctx.strokeStyle = rgba('#ffffff', 0.25);
          ctx.lineWidth = Math.max(1 / px, 0.003);
          ctx.beginPath();
          ctx.roundRect(x, y, CARD_W, CARD_H, 0.03);
          ctx.stroke();
          ctx.fillStyle = '#05070d';
          ctx.fillRect(PX - PW, PY - PH, PW * 2, PH * 2);
          d.portal();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1 / px;
          ctx.strokeRect(PX - PW, PY - PH, PW * 2, PH * 2);
          const tx = PX + PW + 0.035;
          text(ctx, 'infra', tx, y + 0.08, 0.022, 'rgba(255,255,255,0.6)', { font: FONT.mono });
          text(ctx, 'wireredblue', tx, y + 0.14, 0.04, '#ffffff', { weight: 700 });
          text(ctx, '.xyz', tx, y + 0.185, 0.04, '#ffffff', { weight: 700 });
          const lines = ['Docker · Traefik', 'CD GitHub Actions', 'VPS OVH'];
          lines.forEach((l, k) => text(ctx, l, tx, y + 0.26 + k * 0.045, 0.021, 'rgba(220,226,255,0.75)', { font: FONT.mono }));
          const pulse = 0.5 + 0.5 * Math.sin(time * 3);
          glow(ctx, tx + 0.01, y + CARD_H - 0.06, 0.03, '#3dd68c', 0.5 + pulse * 0.5);
          text(ctx, 'zoom ↓', tx + 0.04, y + CARD_H - 0.05, 0.022, '#ffffff', { font: FONT.mono, weight: 600 });
          return;
        }

        if (!inView(view, x, y, W, CARD_H)) return;
        const sp = spots[id];
        if (id === 'github') {
          const hov = d.isHover(id);
          ctx.save();
          ctx.setLineDash([0.02, 0.014]);
          ctx.strokeStyle = hov ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.22)';
          ctx.lineWidth = Math.max(1.2 / px, 0.003);
          ctx.beginPath();
          ctx.roundRect(x, y, W, CARD_H, 0.03);
          ctx.stroke();
          ctx.restore();
          if (d.visible(0.03, 3)) {
            text(ctx, sp.title, x + W / 2, y + CARD_H / 2 - 0.01, 0.05, '#ffffff', { align: 'center', weight: 700 });
            text(ctx, 'github.com/XxWirexX  →', x + W / 2, y + CARD_H / 2 + 0.06, 0.024, 'rgba(220,226,255,0.7)', {
              align: 'center',
              font: FONT.mono,
            });
          }
          d.hot(id, { kind: 'rect', x, y, w: W, h: CARD_H });
          return;
        }
        const hov = d.isHover(id);
        const lift = hov ? -0.012 : 0;
        if (hov) glow(ctx, x + W / 2, y + CARD_H / 2, 0.7, C.blue, 0.18);
        fillRR(ctx, x, y + lift, W, CARD_H, 0.03, hov ? '#181c2e' : '#121522');
        ctx.strokeStyle = hov ? rgba('#ffffff', 0.35) : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = Math.max(1 / px, 0.002);
        ctx.beginPath();
        ctx.roundRect(x, y + lift, W, CARD_H, 0.03);
        ctx.stroke();
        // bande colorée
        fillRR(ctx, x, y + lift + 0.04, 0.008, CARD_H - 0.08, 0.004, col === 0 ? C.red : col === 2 ? C.blue : '#c3a6ff');

        if (!d.visible(0.03, 3)) {
          d.hot(id, { kind: 'rect', x, y, w: W, h: CARD_H });
          return;
        }
        const [st, stc] = STATUS[id] ?? ['', '#fff'];
        const sw = textWidth(ctx, st, 0.02, FONT.mono) + 0.06;
        fillRR(ctx, x + W - sw - 0.04, y + lift + 0.045, sw, 0.045, 0.0225, rgba(stc, 0.14));
        ctx.fillStyle = stc;
        ctx.beginPath();
        ctx.arc(x + W - sw - 0.015, y + lift + 0.0675, 0.008, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, st, x + W - sw - 0.0, y + lift + 0.075, 0.02, stc, { font: FONT.mono });

        text(ctx, sp.title, x + 0.05, y + lift + 0.15, 0.05, '#ffffff', { weight: 700, maxW: W - 0.1 });
        text(ctx, sp.hint, x + 0.05, y + lift + 0.2, 0.024, 'rgba(220,226,255,0.6)', { font: FONT.mono, maxW: W - 0.1 });

        if (span > 1) {
          // aperçu façon Wordle + lien
          const cs = 0.055;
          const gx = x + W - 5 * (cs + 0.01) - 0.05;
          const gy = y + lift + 0.13;
          DLE_ROWS.forEach((r, ri) =>
            [...r].forEach((c, ci) => {
              const col = c === 'g' ? '#3dd68c' : c === 'y' ? '#ffcb6b' : 'rgba(255,255,255,0.12)';
              fillRR(ctx, gx + ci * (cs + 0.01), gy + ri * (cs + 0.01), cs, cs, 0.01, col);
            }),
          );
          text(ctx, 'dle.wireredblue.xyz ↗', x + 0.05, y + lift + 0.255, 0.024, C.blueSoft, { font: FONT.mono, weight: 600 });
        }

        // tags
        let tx = x + 0.05;
        let ty = y + lift + (span > 1 ? 0.33 : 0.3);
        for (const tag of (sp.tags ?? []).slice(0, span > 1 ? 8 : 5)) {
          const w = textWidth(ctx, tag, 0.02, FONT.mono) + 0.035;
          if (tx + w > x + W - 0.04) {
            tx = x + 0.05;
            ty += 0.058;
            if (ty > y + CARD_H - 0.05) break;
          }
          fillRR(ctx, tx, ty, w, 0.044, 0.012, 'rgba(255,255,255,0.06)');
          text(ctx, tag, tx + w / 2, ty + 0.03, 0.02, 'rgba(230,234,255,0.85)', { align: 'center', font: FONT.mono });
          tx += w + 0.015;
        }
        d.hot(id, { kind: 'rect', x, y, w: W, h: CARD_H });
      });
    });
  },
};
