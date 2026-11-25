/**
 * 04 · Une rue de Lyon la nuit. Au fond Fourvière et les tours de la
 * Part-Dieu ; devant, la boulangerie, l'immeuble avec l'enseigne wireredblue
 * et la caserne des pompiers. Le portail est une fenêtre allumée.
 */
import type { Level } from '../engine/types';
import { C, fillRR, glow, rgba, rng, text, textWidth, FONT } from '../engine/util';

const GROUND = 0.62; // haut du trottoir
const S = 0.095;
const WX = 0;
const WY = -0.3;
const WW = 1.33 * S; // demi-largeur de la fenêtre-portail
const WH = 1.0 * S;

const SKY_STARS = (() => {
  const r = rng(404);
  return Array.from({ length: 140 }, () => ({ x: (r() * 2 - 1) * 3.2, y: -2.4 + r() * 2.2, a: 0.2 + r() * 0.6, ph: r() * 6 }));
})();

interface Bldg {
  x: number;
  w: number;
  top: number;
  color: string;
  wins: { x: number; y: number; on: number }[];
  roof: number;
}
function makeRow(seed: number, x0: number, x1: number, minH: number, maxH: number, colors: string[]): Bldg[] {
  const r = rng(seed);
  const out: Bldg[] = [];
  let x = x0;
  while (x < x1) {
    const w = 0.22 + r() * 0.3;
    const top = -(minH + r() * (maxH - minH));
    const wins: Bldg['wins'] = [];
    for (let yy = top + 0.06; yy < GROUND - 0.08; yy += 0.085) {
      for (let xx = x + 0.04; xx < x + w - 0.05; xx += 0.07) {
        const v = r();
        wins.push({ x: xx, y: yy, on: v < 0.32 ? 1 : v < 0.38 ? 2 : 0 });
      }
    }
    out.push({ x, w, top, color: colors[Math.floor(r() * colors.length)], wins, roof: r() });
    x += w + 0.005;
  }
  return out;
}
const MID = makeRow(7, -3.4, 3.4, 0.35, 0.85, ['#1b1a36', '#201c3a', '#17172e']);
const SIDE_L = makeRow(8, -3.4, -1.18, 0.6, 1.0, ['#26223f', '#2a2443']);
const SIDE_R = makeRow(9, 1.34, 3.4, 0.55, 1.0, ['#26223f', '#2a2443']);

function drawRow(ctx: CanvasRenderingContext2D, row: Bldg[], time: number, dim: number) {
  for (const b of row) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.top, b.w, 3);
    // toits : cheminées / antennes
    ctx.fillRect(b.x + b.w * 0.2, b.top - 0.04, 0.03, 0.04);
    if (b.roof > 0.6) {
      ctx.fillRect(b.x + b.w * 0.7, b.top - 0.12, 0.004, 0.12);
      if (Math.sin(time * 2 + b.x * 9) > 0.8) glow(ctx, b.x + b.w * 0.7, b.top - 0.12, 0.02, C.red, 0.9);
    }
    for (const w of b.wins) {
      if (!w.on) continue;
      ctx.fillStyle = w.on === 1 ? rgba('#ffc978', 0.75 * dim) : rgba('#9fc2ff', 0.6 * dim);
      ctx.fillRect(w.x, w.y, 0.032, 0.045);
    }
  }
}

/** Basilique de Fourvière, en silhouette éclairée. */
function basilica(ctx: CanvasRenderingContext2D, x: number, y: number, k: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#e9c98a';
  ctx.fillRect(-0.16, -0.12, 0.32, 0.12);
  ctx.beginPath();
  ctx.moveTo(-0.16, -0.12);
  ctx.lineTo(0, -0.2);
  ctx.lineTo(0.16, -0.12);
  ctx.fill();
  for (const tx of [-0.17, -0.09, 0.09, 0.17]) {
    ctx.fillRect(tx - 0.022, -0.2, 0.044, 0.2);
    ctx.fillRect(tx - 0.028, -0.21, 0.056, 0.015);
  }
  ctx.fillRect(-0.004, -0.29, 0.008, 0.09);
  ctx.fillStyle = 'rgba(120,80,40,0.5)';
  for (let i = -3; i <= 3; i++) ctx.fillRect(i * 0.04 - 0.008, -0.09, 0.016, 0.05);
  ctx.restore();
}

function neon(ctx: CanvasRenderingContext2D, time: number, px: number) {
  const parts: [string, string][] = [
    ['wire', '#eaf2ff'],
    ['red', C.red],
    ['blue', C.blue],
  ];
  const y = -0.9;
  let x = -0.36;
  const size = 0.1;
  // supports
  ctx.fillStyle = '#111426';
  ctx.fillRect(-0.3, y + 0.02, 0.012, 0.1);
  ctx.fillRect(0.29, y + 0.02, 0.012, 0.1);
  const flick = Math.sin(time * 23) > 0.2 || Math.sin(time * 0.7) < 0.92;
  for (const [s, col] of parts) {
    const on = s !== 'red' || flick;
    const w = textWidth(ctx, s, size, FONT.sans, 700);
    if (on) glow(ctx, x + w / 2, y - 0.03, 0.22, col, 0.35);
    text(ctx, s, x, y, size, on ? col : rgba(col, 0.25), { weight: 700 });
    if (on) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      text(ctx, s, x, y, size, rgba(col, 0.4), { weight: 700 });
      ctx.restore();
    }
    x += w + 0.008;
  }
  void px;
}

export const rue: Level = {
  key: 'rue',
  // On dessine la rue un peu plus petite pour la voir en entier (toit → chaussée).
  scale: 0.72,
  portal: { x: WX, y: WY, s: S },
  clip(ctx) {
    ctx.rect(WX - WW, WY - WH, WW * 2, WH * 2);
  },
  draw(d) {
    const { ctx, time, px, view } = d;

    // Ciel
    const sky = ctx.createLinearGradient(0, -2.2, 0, GROUND);
    sky.addColorStop(0, '#04061a');
    sky.addColorStop(0.55, '#121034');
    sky.addColorStop(1, '#3b1d45');
    ctx.fillStyle = sky;
    ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);

    d.layer(0.35, () => {
      ctx.fillStyle = '#fff';
      for (const s of SKY_STARS) {
        ctx.globalAlpha = s.a * (0.7 + 0.3 * Math.sin(time * 1.5 + s.ph));
        const z = 1.3 / px;
        ctx.fillRect(s.x, s.y, z, z);
      }
      ctx.globalAlpha = 1;
      // Lune
      glow(ctx, -1.15, -0.78, 0.4, '#bcd0ff', 0.18);
      ctx.fillStyle = '#eef1ff';
      ctx.beginPath();
      ctx.arc(-1.15, -0.78, 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0d0c2a';
      ctx.beginPath();
      ctx.arc(-1.11, -0.8, 0.08, 0, Math.PI * 2);
      ctx.fill();
    });

    // Lointain : Fourvière + tours de la Part-Dieu
    d.layer(0.6, () => {
      ctx.fillStyle = '#161430';
      ctx.beginPath();
      ctx.moveTo(-3.2, GROUND);
      ctx.quadraticCurveTo(-2.1, -0.25, -1.35, -0.12);
      ctx.quadraticCurveTo(-0.7, -0.02, -0.2, GROUND);
      ctx.fill();
      glow(ctx, -1.38, -0.2, 0.35, '#ffcf80', 0.2);
      basilica(ctx, -1.38, -0.12, 0.9);
      // le « Crayon »
      ctx.fillStyle = '#1c1a3c';
      ctx.fillRect(1.05, -0.5, 0.13, 1.2);
      ctx.beginPath();
      ctx.moveTo(1.05, -0.5);
      ctx.lineTo(1.115, -0.66);
      ctx.lineTo(1.18, -0.5);
      ctx.fill();
      glow(ctx, 1.115, -0.6, 0.05, C.red, 0.7);
      // Incity
      ctx.beginPath();
      ctx.moveTo(1.28, GROUND);
      ctx.lineTo(1.3, -0.72);
      ctx.lineTo(1.38, -0.78);
      ctx.lineTo(1.44, GROUND);
      ctx.fill();
      ctx.fillStyle = rgba('#9fc2ff', 0.35);
      for (let y = -0.65; y < 0.5; y += 0.05) ctx.fillRect(1.31, y, 0.11, 0.008);
      ctx.fillStyle = rgba('#ffc978', 0.4);
      for (let y = -0.45; y < 0.5; y += 0.06) ctx.fillRect(1.07, y, 0.09, 0.01);
    });

    // Plan intermédiaire
    d.layer(0.82, () => drawRow(ctx, MID, time, 0.75));

    // ---- Premier rang (plan du portail) ----
    d.layer(1, () => {
      drawRow(ctx, SIDE_L, time, 1);
      drawRow(ctx, SIDE_R, time, 1);

      // Boulangerie (gauche)
      ctx.fillStyle = '#2c2747';
      ctx.fillRect(-1.16, -0.62, 0.74, 1.4);
      ctx.fillStyle = '#231f3b';
      ctx.fillRect(-1.18, -0.66, 0.78, 0.05);
      const rB = rng(31);
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 3; col++) {
          const x = -1.1 + col * 0.23;
          const y = -0.55 + row * 0.27;
          const on = rB() < 0.45;
          if (on) {
            const wg = ctx.createLinearGradient(0, y, 0, y + 0.17);
            wg.addColorStop(0, '#ffd79a');
            wg.addColorStop(1, '#e0904a');
            ctx.fillStyle = wg;
          } else ctx.fillStyle = '#141228';
          ctx.fillRect(x, y, 0.15, 0.17);
          ctx.fillStyle = '#2c2747';
          ctx.fillRect(x + 0.07, y, 0.008, 0.17);
          ctx.fillStyle = '#16142a';
          ctx.fillRect(x - 0.01, y + 0.17, 0.17, 0.012);
        }
      // vitrine
      const shopHot = d.isHover('boulangerie');
      glow(ctx, -0.79, 0.48, 0.5, '#ffb45a', shopHot ? 0.5 : 0.32);
      ctx.fillStyle = '#ffd59a';
      ctx.fillRect(-1.12, 0.36, 0.44, 0.26);
      ctx.fillStyle = '#e8a860';
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(-1.06 + i * 0.065, 0.5);
        ctx.rotate(-0.5);
        fillRR(ctx, -0.008, -0.07, 0.016, 0.14, 0.008, '#c9813e');
        ctx.restore();
      }
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#d99550';
        ctx.beginPath();
        ctx.ellipse(-1.04 + i * 0.1, 0.59, 0.03, 0.015, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#5b3a2a';
      ctx.fillRect(-0.66, 0.36, 0.2, 0.26);
      ctx.fillStyle = '#ffd59a';
      ctx.fillRect(-0.64, 0.38, 0.16, 0.12);
      // store rayé
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = i % 2 ? '#f2eadf' : '#b8323f';
        ctx.beginPath();
        ctx.moveTo(-1.14 + i * 0.08, 0.3);
        ctx.lineTo(-1.06 + i * 0.08, 0.3);
        ctx.lineTo(-1.04 + i * 0.08, 0.36);
        ctx.lineTo(-1.16 + i * 0.08 + 0.02, 0.36);
        ctx.fill();
      }
      fillRR(ctx, -1.12, 0.2, 0.68, 0.08, 0.01, '#1a1630');
      text(ctx, 'BOULANGERIE', -0.78, 0.262, 0.05, '#ffd27a', { align: 'center', weight: 700, spacing: 0.006 });
      d.hot('boulangerie', { kind: 'rect', x: -1.14, y: 0.18, w: 0.72, h: 0.46 });

      // Immeuble central
      const fac = ctx.createLinearGradient(-0.42, 0, 0.42, 0);
      fac.addColorStop(0, '#2f2a4d');
      fac.addColorStop(0.5, '#38315a');
      fac.addColorStop(1, '#2a2546');
      ctx.fillStyle = fac;
      ctx.fillRect(-0.42, -0.78, 0.84, 1.6);
      ctx.fillStyle = '#221e3c';
      ctx.fillRect(-0.45, -0.8, 0.9, 0.05);
      for (let i = 0; i < 4; i++) ctx.fillRect(-0.44, -0.45 + i * 0.26, 0.88, 0.012);
      const rW = rng(77);
      for (const row of [-0.56, -0.3, -0.04]) {
        for (const col of [-0.29, 0, 0.29]) {
          if (row === WY && col === WX) continue;
          const on = rW() < 0.5;
          const hw = WW * 0.82;
          const hh = WH * 0.82;
          if (on) {
            const warm = rW() < 0.7;
            const wg = ctx.createLinearGradient(0, row - hh, 0, row + hh);
            wg.addColorStop(0, warm ? '#ffd79a' : '#a9c6ff');
            wg.addColorStop(1, warm ? '#e8994a' : '#5d82d6');
            ctx.fillStyle = wg;
          } else ctx.fillStyle = '#15132a';
          ctx.fillRect(col - hw, row - hh, hw * 2, hh * 2);
          ctx.fillStyle = '#2c2748';
          ctx.fillRect(col - 0.004, row - hh, 0.008, hh * 2);
          // garde-corps
          ctx.strokeStyle = '#141225';
          ctx.lineWidth = 0.006;
          ctx.strokeRect(col - hw - 0.01, row + hh - 0.035, hw * 2 + 0.02, 0.04);
        }
      }
      // porte d'entrée
      ctx.fillStyle = '#18152c';
      ctx.beginPath();
      ctx.moveTo(-0.09, GROUND);
      ctx.lineTo(-0.09, 0.38);
      ctx.arc(0, 0.38, 0.09, Math.PI, 0);
      ctx.lineTo(0.09, GROUND);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,220,160,0.18)';
      ctx.fillRect(-0.07, 0.4, 0.06, 0.2);
      ctx.fillRect(0.01, 0.4, 0.06, 0.2);
      glow(ctx, 0, 0.27, 0.12, '#ffdca0', 0.5);
      ctx.fillStyle = '#ffdca0';
      ctx.fillRect(-0.02, 0.255, 0.04, 0.012);

      // Fenêtre-portail : lumière chaude, puis la chambre dedans
      glow(ctx, WX, WY, 0.3, '#ffb45a', 0.35);
      ctx.fillStyle = '#ffcf8a';
      ctx.fillRect(WX - WW, WY - WH, WW * 2, WH * 2);
      d.portal();
      // encadrement par-dessus
      ctx.strokeStyle = '#1b1830';
      ctx.lineWidth = 0.016;
      ctx.strokeRect(WX - WW, WY - WH, WW * 2, WH * 2);
      ctx.fillStyle = '#1b1830';
      ctx.fillRect(WX - WW - 0.02, WY + WH, WW * 2 + 0.04, 0.018);
      ctx.strokeStyle = '#141225';
      ctx.lineWidth = 0.006;
      for (let i = 0; i <= 10; i++) {
        const x = WX - WW + (i * WW * 2) / 10;
        ctx.beginPath();
        ctx.moveTo(x, WY + WH - 0.05);
        ctx.lineTo(x, WY + WH);
        ctx.stroke();
      }
      ctx.strokeRect(WX - WW - 0.01, WY + WH - 0.05, WW * 2 + 0.02, 0.05);

      // Enseigne néon sur le toit
      neon(ctx, time, px);
      d.hot('enseigne', { kind: 'rect', x: -0.38, y: -1.02, w: 0.76, h: 0.16 });

      // Caserne (droite)
      ctx.fillStyle = '#4a2730';
      ctx.fillRect(0.44, -0.4, 0.88, 1.2);
      ctx.fillStyle = '#3a1e27';
      for (let y = -0.38; y < GROUND; y += 0.04) ctx.fillRect(0.44, y, 0.88, 0.004);
      ctx.fillStyle = '#2c1720';
      ctx.fillRect(0.42, -0.44, 0.92, 0.05);
      for (const col of [0.56, 0.78, 1.0, 1.2]) {
        ctx.fillStyle = Math.sin(col * 13) > 0 ? '#ffc46e' : '#1a1020';
        ctx.fillRect(col - 0.05, -0.3, 0.1, 0.14);
      }
      fillRR(ctx, 0.5, -0.06, 0.76, 0.08, 0.01, '#d8242f');
      text(ctx, 'SAPEURS-POMPIERS', 0.88, -0.005, 0.042, '#ffffff', { align: 'center', weight: 700, spacing: 0.004 });
      // deux portes de garage, une ouverte avec le camion
      ctx.fillStyle = '#2a161d';
      ctx.fillRect(0.5, 0.1, 0.36, 0.52);
      ctx.fillRect(0.9, 0.1, 0.36, 0.52);
      ctx.fillStyle = '#c9c1b8';
      for (let y = 0.12; y < 0.6; y += 0.05) ctx.fillRect(0.92, y, 0.32, 0.035);
      ctx.fillStyle = '#100a10';
      ctx.fillRect(0.52, 0.12, 0.32, 0.5);
      // camion
      fillRR(ctx, 0.54, 0.34, 0.28, 0.24, 0.02, '#d42a33');
      ctx.fillStyle = '#e9edf5';
      ctx.fillRect(0.54, 0.42, 0.28, 0.02);
      ctx.fillStyle = '#9fd0ff';
      ctx.fillRect(0.56, 0.36, 0.1, 0.06);
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(0.6, 0.585, 0.03, 0, Math.PI * 2);
      ctx.arc(0.77, 0.585, 0.03, 0, Math.PI * 2);
      ctx.fill();
      const blinkA = Math.sin(time * 9) > 0;
      glow(ctx, 0.6, 0.33, 0.08, C.blue, blinkA ? 1 : 0.2);
      glow(ctx, 0.76, 0.33, 0.08, C.blue, blinkA ? 0.2 : 1);
      glow(ctx, 0.68, 0.62, 0.4, C.blue, blinkA ? 0.18 : 0.1);
      d.hot('pompier', { kind: 'rect', x: 0.48, y: -0.08, w: 0.82, h: 0.72 });

      // Trottoir + route
      ctx.fillStyle = '#2a2838';
      ctx.fillRect(view.x0 - 5, GROUND, view.x1 - view.x0 + 10, 0.06);
      ctx.fillStyle = '#3a3850';
      ctx.fillRect(view.x0 - 5, GROUND, view.x1 - view.x0 + 10, 0.006);
      const road = ctx.createLinearGradient(0, GROUND + 0.06, 0, 1.6);
      road.addColorStop(0, '#15141f');
      road.addColorStop(1, '#08080d');
      ctx.fillStyle = road;
      ctx.fillRect(view.x0 - 5, GROUND + 0.06, view.x1 - view.x0 + 10, 3);
      ctx.fillStyle = 'rgba(230,230,240,0.35)';
      for (let x = -3.4; x < 3.4; x += 0.3) ctx.fillRect(x, 0.92, 0.16, 0.012);
      // reflets sur la route mouillée
      const refl = (x: number, col: string, a: number, w = 0.06) => {
        const g = ctx.createLinearGradient(0, GROUND + 0.07, 0, 1.25);
        g.addColorStop(0, rgba(col, a));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - w / 2, GROUND + 0.07, w, 0.6);
      };
      refl(-0.2, C.red, 0.18, 0.12);
      refl(0.12, C.blue, 0.18, 0.14);
      refl(-0.79, '#ffb45a', 0.22, 0.3);
      refl(0.68, C.blue, blinkA ? 0.25 : 0.1, 0.2);

      // Colonne Morris : les affiches des événements asso
      {
        const cx = -1.3;
        const top = 0.1;
        const hw = 0.085;
        const hov = d.isHover('asso');
        if (hov) glow(ctx, cx, 0.35, 0.35, '#ffffff', 0.18);
        ctx.fillStyle = '#1d3a2e';
        ctx.fillRect(cx - hw, top, hw * 2, GROUND - top);
        ctx.fillStyle = '#152a22';
        ctx.fillRect(cx - hw - 0.012, GROUND - 0.03, hw * 2 + 0.024, 0.03);
        ctx.beginPath();
        ctx.ellipse(cx, top, hw + 0.015, 0.05, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - hw - 0.015, top - 0.005, hw * 2 + 0.03, 0.02);
        ctx.fillStyle = '#1d3a2e';
        ctx.beginPath();
        ctx.arc(cx, top - 0.05, 0.018, 0, Math.PI * 2);
        ctx.fill();
        // affiches
        fillRR(ctx, cx - hw + 0.01, top + 0.04, hw * 2 - 0.02, 0.2, 0.004, '#f2ecdf');
        fillRR(ctx, cx - hw + 0.02, top + 0.05, hw * 2 - 0.04, 0.1, 0.004, C.red);
        text(ctx, 'OLYMPIADES', cx, top + 0.11, 0.024, '#ffffff', { align: 'center', weight: 700, maxW: hw * 2 - 0.05 });
        text(ctx, 'STUDENT CLUB', cx, top + 0.2, 0.016, '#2a2443', { align: 'center', weight: 700, font: FONT.mono });
        text(ctx, 'LYON 1', cx, top + 0.225, 0.016, '#2a2443', { align: 'center', font: FONT.mono });
        fillRR(ctx, cx - hw + 0.01, top + 0.26, hw * 2 - 0.02, 0.17, 0.004, C.blue);
        text(ctx, 'WEF', cx, top + 0.34, 0.05, '#ffffff', { align: 'center', weight: 700 });
        text(ctx, 'le week-end', cx, top + 0.39, 0.016, '#e8efff', { align: 'center', font: FONT.mono });
        d.hot('asso', { kind: 'rect', x: cx - hw - 0.02, y: top - 0.08, w: hw * 2 + 0.04, h: GROUND - top + 0.08 });
      }

      // Lampadaires
      for (const lx of [-1.66, 1.55]) {
        ctx.fillStyle = '#121120';
        ctx.fillRect(lx - 0.008, -0.1, 0.016, GROUND + 0.1);
        ctx.fillRect(lx - 0.05, -0.12, 0.1, 0.02);
        glow(ctx, lx, -0.08, 0.35, '#ffb45a', 0.4);
        const cone = ctx.createLinearGradient(0, -0.1, 0, GROUND);
        cone.addColorStop(0, 'rgba(255,180,90,0.22)');
        cone.addColorStop(1, 'rgba(255,180,90,0)');
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.moveTo(lx - 0.03, -0.1);
        ctx.lineTo(lx + 0.03, -0.1);
        ctx.lineTo(lx + 0.25, GROUND + 0.06);
        ctx.lineTo(lx - 0.25, GROUND + 0.06);
        ctx.fill();
      }

      // Voitures
      const car = (u: number, y: number, dir: number, col: string) => {
        const x = -3.2 + (((u % 1) + 1) % 1) * 6.4;
        const cx = dir > 0 ? x : -x;
        ctx.save();
        ctx.translate(cx, y);
        ctx.scale(dir, 1);
        fillRR(ctx, -0.13, -0.07, 0.26, 0.06, 0.02, col);
        fillRR(ctx, -0.07, -0.11, 0.13, 0.05, 0.02, col);
        ctx.fillStyle = '#9fb6ff';
        ctx.fillRect(-0.05, -0.1, 0.045, 0.03);
        ctx.fillRect(0.005, -0.1, 0.045, 0.03);
        ctx.fillStyle = '#0b0b10';
        ctx.beginPath();
        ctx.arc(-0.08, -0.012, 0.022, 0, Math.PI * 2);
        ctx.arc(0.08, -0.012, 0.022, 0, Math.PI * 2);
        ctx.fill();
        const beam = ctx.createLinearGradient(0.13, 0, 0.6, 0);
        beam.addColorStop(0, 'rgba(255,245,210,0.45)');
        beam.addColorStop(1, 'rgba(255,245,210,0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(0.13, -0.05);
        ctx.lineTo(0.6, -0.1);
        ctx.lineTo(0.6, 0.02);
        ctx.fill();
        glow(ctx, -0.13, -0.045, 0.03, C.red, 0.9);
        ctx.restore();
      };
      car(time * 0.07, 0.86, 1, '#3b4a8a');
      car(time * 0.05 + 0.5, 1.02, -1, '#7a2333');
    });

    // Premier plan : grand lampadaire et branches qui passent devant la caméra
    if (d.bg)
      d.layer(1.45, () => {
        const lx = -1.95;
        ctx.fillStyle = '#05050b';
        ctx.fillRect(lx - 0.025, -0.55, 0.05, 3);
        ctx.fillRect(lx - 0.025, -0.58, 0.26, 0.03);
        glow(ctx, lx + 0.22, -0.53, 0.4, '#ffb45a', 0.35);
        ctx.fillStyle = '#ffe2b0';
        ctx.fillRect(lx + 0.17, -0.555, 0.1, 0.015);
      });
  },
};
