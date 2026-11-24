/**
 * 03 · Lyon vue du ciel, de nuit : le Rhône et la Saône, la Presqu'île, le
 * parc de la Tête d'Or, des rues éclairées. Les repères sont cliquables.
 * Le portail est une bulle « vue de la rue » (comme sur une appli de cartes).
 *
 * Plan stylisé, pas une carte exacte : déplace les repères dans PINS.
 */
import type { Level } from '../engine/types';
import { C, Dots, fillRR, gauss, glow, rng, smooth, text, textWidth, FONT } from '../engine/util';

type Pt = [number, number];
const SAONE: Pt[] = [[-0.2, -2.6], [-0.28, -1.6], [-0.44, -1.0], [-0.5, -0.72], [-0.4, -0.5], [-0.3, -0.3], [-0.34, -0.05], [-0.3, 0.2], [-0.2, 0.48], [-0.1, 0.75], [-0.02, 0.95]];
const RHONE: Pt[] = [[2.6, -1.3], [1.5, -0.92], [0.95, -0.82], [0.58, -0.64], [0.3, -0.44], [0.1, -0.26], [0.02, 0.0], [0.06, 0.32], [0.06, 0.66], [-0.02, 0.95], [0.02, 1.4], [0.12, 2.0], [0.1, 2.8]];
const PARC = { x: 0.36, y: -0.44, rx: 0.17, ry: 0.11 };
const FOURVIERE = { x: -0.62, y: 0.02 };

const PINS = [
  { id: 'iut', label: 'IUT Lyon 1 · La Doua', x: 0.88, y: -0.66, color: C.blue },
  { id: 'axopen', label: 'Axopen', x: 0.5, y: 0.1, color: C.red },
];

/** Bulle « vue de la rue » = portail. */
const BX = 0.18;
const BY = 0.42;
const BR = 0.17;
const S = BR / 1.12;

function distSeg(px: number, py: number, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
}
function distLine(px: number, py: number, line: Pt[]): number {
  let m = Infinity;
  for (let i = 0; i < line.length - 1; i++) m = Math.min(m, distSeg(px, py, line[i], line[i + 1]));
  return m;
}
const onWater = (x: number, y: number) => distLine(x, y, RHONE) < 0.05 || distLine(x, y, SAONE) < 0.038;
const inPark = (x: number, y: number) => ((x - PARC.x) / PARC.rx) ** 2 + ((y - PARC.y) / PARC.ry) ** 2 < 1;

interface Dot {
  x: number;
  y: number;
  a: number;
  c: number;
  s: number;
}
/** 0 sodium, 1 blanc LED, 2 rouge, 3 bleu */
const DOTS: Dot[] = [];
const BLOCKS: { x: number; y: number; w: number; h: number; a: number }[] = [];
{
  const r = rng(69);
  // Quartiers : centre, rayon, orientation de la grille, pas
  const districts = [
    { x: -0.12, y: 0.15, r: 0.35, ang: 0.35, step: 0.035 }, // Presqu'île
    { x: 0.42, y: 0.15, r: 0.55, ang: 0.0, step: 0.045 }, // rive gauche (Part-Dieu, Guillotière)
    { x: 0.6, y: -0.25, r: 0.4, ang: 0.08, step: 0.045 }, // Brotteaux / Villeurbanne
    { x: 1.0, y: -0.35, r: 0.5, ang: -0.2, step: 0.055 }, // Villeurbanne est
    { x: -0.15, y: -0.6, r: 0.35, ang: 0.6, step: 0.05 }, // Croix-Rousse
    { x: -0.8, y: -0.5, r: 0.45, ang: -0.4, step: 0.06 }, // Vaise
    { x: -0.9, y: 0.55, r: 0.5, ang: 0.25, step: 0.065 }, // ouest
    { x: 0.55, y: 0.8, r: 0.55, ang: 0.12, step: 0.055 }, // 7e / 8e
    { x: 1.3, y: 0.45, r: 0.7, ang: -0.1, step: 0.07 }, // Bron / est
    { x: -0.2, y: 1.6, r: 0.8, ang: 0.0, step: 0.08 }, // sud
    { x: 1.3, y: -1.2, r: 0.8, ang: 0.3, step: 0.08 }, // nord-est
    { x: -1.6, y: -0.2, r: 0.8, ang: 0.1, step: 0.09 }, // monts d'Or
  ];
  for (const dd of districts) {
    const ca = Math.cos(dd.ang);
    const sa = Math.sin(dd.ang);
    for (let u = -dd.r; u <= dd.r; u += dd.step) {
      for (let v = -dd.r; v <= dd.r; v += dd.step * 0.32) {
        if (u * u + v * v > dd.r * dd.r) continue;
        // lampadaires le long des rues (lignes u = cste et v = cste)
        const along = r() < 0.5;
        const lu = along ? u : v * 0.999;
        const lv = along ? v : u;
        const x = dd.x + lu * ca - lv * sa + gauss(r) * 0.002;
        const y = dd.y + lu * sa + lv * ca + gauss(r) * 0.002;
        if (onWater(x, y) || inPark(x, y)) continue;
        const dc = Math.hypot(x - 0.1, y - 0.0);
        if (r() > 1.15 - dc * 0.35) continue;
        DOTS.push({ x, y, a: 0.25 + r() * 0.6, c: r() < 0.1 ? 1 : 0, s: 0.9 + r() * 0.6 });
      }
    }
    for (let i = 0; i < 40; i++) {
      const x = dd.x + gauss(r) * dd.r * 0.5;
      const y = dd.y + gauss(r) * dd.r * 0.5;
      BLOCKS.push({ x, y, w: 0.03 + r() * 0.06, h: 0.03 + r() * 0.06, a: 0.012 + r() * 0.025 });
    }
  }
  // Grands axes (plus lumineux, LED blanches)
  const roads: Pt[][] = [
    [[-0.3, -2.5], [-0.38, -1.2], [-0.56, -0.7], [-0.46, -0.3], [-0.42, 0.3], [-0.24, 0.8], [-0.1, 1.3], [-0.1, 2.6]], // A6/A7 le long de la Saône
    [[0.02, 0.0], [0.6, 0.02], [1.2, 0.05], [2.6, 0.1]], // cours Lafayette → est
    [[1.1, -1.6], [1.2, -0.8], [1.15, 0.0], [1.0, 0.8], [0.7, 1.3], [0.2, 1.6]], // périphérique est
    [[-0.12, 0.5], [0.5, 0.55], [1.4, 0.7], [2.6, 0.9]], // vers l'est (A43)
  ];
  for (const road of roads) {
    for (let i = 0; i < road.length - 1; i++) {
      const [a, b] = [road[i], road[i + 1]];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let t = 0; t < len; t += 0.012) {
        const x = a[0] + ((b[0] - a[0]) * t) / len;
        const y = a[1] + ((b[1] - a[1]) * t) / len;
        if (onWater(x, y)) continue;
        DOTS.push({ x, y, a: 0.6 + r() * 0.4, c: r() < 0.5 ? 1 : 0, s: 1.2 });
      }
    }
  }
}
// Lots de points (rapides) : complets et allégés pour la vue de loin.
const byColor = (c: number, every: number) => new Dots(DOTS.filter((o, i) => o.c === c && i % every === 0));
const DOTS_FULL = [byColor(0, 1), byColor(1, 1)];
const DOTS_MID = [byColor(0, 3), byColor(1, 3)];
const DOTS_FAR = [byColor(0, 9), byColor(1, 9)];

/** Ponts : de courts segments perpendiculaires aux rivières. */
const BRIDGES: [Pt, Pt][] = [];
for (const [line, half] of [
  [RHONE, 0.055],
  [SAONE, 0.042],
] as [Pt[], number][]) {
  for (let i = 0; i < line.length - 1; i++) {
    const [a, b] = [line[i], line[i + 1]];
    if (Math.abs(a[1]) > 1.1 || Math.abs(a[0]) > 1.2) continue;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    for (const u of [0.3, 0.75]) {
      const cx = a[0] + (b[0] - a[0]) * u;
      const cy = a[1] + (b[1] - a[1]) * u;
      BRIDGES.push([
        [cx - nx * half, cy - ny * half],
        [cx + nx * half, cy + ny * half],
      ]);
    }
  }
}

const FOG = (() => {
  const r = rng(5);
  return Array.from({ length: 9 }, () => ({ x: (r() * 2 - 1) * 2.4, y: (r() * 2 - 1) * 1.6, r: 0.4 + r() * 0.6, sp: 0.01 + r() * 0.02 }));
})();

function river(ctx: CanvasRenderingContext2D, line: Pt[], w: number, px: number, time: number) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  line.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = '#0b1830';
  ctx.lineWidth = w;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(90,140,255,0.16)';
  ctx.lineWidth = 1.2 / px;
  ctx.setLineDash([0.02, 0.03]);
  ctx.lineDashOffset = -time * 0.02;
  ctx.stroke();
  ctx.setLineDash([]);
}

function pin(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, hover: boolean) {
  const k = hover ? 1.15 : 1;
  glow(ctx, x, y, 0.09 * k, color, 0.6);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-0.012, -0.02, -0.03, -0.035, -0.03, -0.058);
  ctx.arc(0, -0.058, 0.03, Math.PI, 0);
  ctx.bezierCurveTo(0.03, -0.035, 0.012, -0.02, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -0.058, 0.012, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0c14';
  ctx.fill();
  ctx.restore();
}

export const lyon: Level = {
  key: 'lyon',
  portal: { x: BX, y: BY, s: S },
  opaqueNested: false,
  clip(ctx) {
    ctx.arc(BX, BY, BR, 0, Math.PI * 2);
  },
  draw(d) {
    const { ctx, time, px } = d;

    if (d.bg) {
      ctx.fillStyle = '#070a12';
      ctx.fillRect(d.view.x0, d.view.y0, d.view.x1 - d.view.x0, d.view.y1 - d.view.y0);
      // texture urbaine
      ctx.fillStyle = '#a0b4ff';
      for (const b of BLOCKS) {
        ctx.globalAlpha = b.a;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.globalAlpha = 1;
      // Colline de Fourvière (verte et sombre)
      const fg = ctx.createRadialGradient(FOURVIERE.x, FOURVIERE.y, 0, FOURVIERE.x, FOURVIERE.y, 0.3);
      fg.addColorStop(0, 'rgba(30,60,40,0.3)');
      fg.addColorStop(1, 'rgba(30,60,40,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(FOURVIERE.x - 0.3, FOURVIERE.y - 0.3, 0.6, 0.6);
    }

    d.layer(1, () => {
      // Parc de la Tête d'Or
      ctx.fillStyle = d.bg ? '#0b1a14' : 'rgba(0,0,0,0)';
      ctx.beginPath();
      ctx.ellipse(PARC.x, PARC.y, PARC.rx, PARC.ry, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,200,120,0.35)';
      ctx.lineWidth = 1 / px;
      ctx.stroke();

      river(ctx, RHONE, 0.075, px, time);
      river(ctx, SAONE, 0.05, px, time);

      // Ponts
      ctx.strokeStyle = 'rgba(255,214,150,0.7)';
      ctx.lineWidth = 2 / px;
      if (d.visible(0.1, 12)) for (const [a, b] of BRIDGES) {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }

      // Lumières (vue de loin, depuis l'orbite : on en dessine moins)
      const set = px < 60 ? DOTS_FAR : px < 160 ? DOTS_MID : DOTS_FULL;
      const dim = 0.45 + 0.55 * smooth(20, 220, px);
      const sizePx = 1.3 * (1 + d.p * 0.8);
      set[0].draw(ctx, '#ffb45a', px, { sizePx, alpha: dim, view: d.view });
      set[1].draw(ctx, '#eef3ff', px, { sizePx, alpha: dim, view: d.view });

      // Basilique de Fourvière, éclairée
      glow(ctx, FOURVIERE.x + 0.05, FOURVIERE.y - 0.02, 0.06, '#ffd98a', 0.9);

      if (!d.visible(0.1, 30)) return; // le reste est inutile en tout petit

      // Repères
      for (const p of PINS) {
        const hov = d.isHover(p.id);
        pin(ctx, p.x, p.y, p.color, hov);
        const tw = textWidth(ctx, p.label, 0.032, FONT.sans, 600);
        fillRR(ctx, p.x + 0.04, p.y - 0.09, tw + 0.04, 0.05, 0.012, 'rgba(10,12,20,0.82)');
        text(ctx, p.label, p.x + 0.06, p.y - 0.055, 0.032, '#ffffff', { weight: 600 });
        d.hot(p.id, { kind: 'rect', x: p.x - 0.04, y: p.y - 0.11, w: tw + 0.12, h: 0.12 });
      }

      // Bulle « vue de la rue »
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.moveTo(BX - 0.04, BY + BR * 0.92);
      ctx.lineTo(BX, BY + BR + 0.07);
      ctx.lineTo(BX + 0.04, BY + BR * 0.92);
      ctx.fill();
      glow(ctx, BX, BY + BR + 0.07, 0.05, C.red, 0.9);
      glow(ctx, BX, BY, BR * 1.6, '#ffffff', 0.12);
      ctx.fillStyle = '#141a33';
      ctx.beginPath();
      ctx.arc(BX, BY, BR, 0, Math.PI * 2);
      ctx.fill();
    });

    d.layer(1, () => {
      d.portal();
      if (!d.visible(0.1, 30)) return;
      ctx.lineWidth = 0.012;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(BX, BY, BR, 0, Math.PI * 2);
      ctx.stroke();
      if (d.depth === 0) {
        ctx.globalAlpha = Math.max(0, 1 - d.p * 4);
        fillRR(ctx, BX - 0.11, BY - BR - 0.085, 0.22, 0.05, 0.025, 'rgba(255,255,255,0.95)');
        text(ctx, 'vue de la rue', BX, BY - BR - 0.05, 0.026, '#141a33', { align: 'center', weight: 600, font: FONT.mono });
        ctx.globalAlpha = 1;
      }
    });

    if (!d.bg) return;

    // Premier plan : brume et un avion
    d.layer(1.5, (v) => {
      for (const f of FOG) {
        const x = ((f.x + time * f.sp + 3) % 6) - 3;
        glow(ctx, x, f.y, f.r, '#c8d4ff', 0.05);
      }
      const u = ((time * 0.02) % 1.4) - 0.2;
      const ax = v.x0 + (v.x1 - v.x0) * u;
      const ay = -0.7 + u * 0.5;
      ctx.fillStyle = 'rgba(200,210,230,0.5)';
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(0.22);
      ctx.fillRect(-0.04, -0.004, 0.08, 0.008);
      ctx.fillRect(-0.006, -0.035, 0.014, 0.07);
      ctx.restore();
      const blink = Math.sin(time * 5) > 0.7;
      if (blink) glow(ctx, ax, ay - 0.035, 0.02, C.red, 1);
      if (!blink) glow(ctx, ax, ay + 0.035, 0.02, '#3dff8a', 0.8);
    });
  },
};
