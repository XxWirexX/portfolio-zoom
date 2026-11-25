/**
 * 08 · La salle serveur. Un rack où chaque unité est un service du VPS, des
 * câbles rouges et bleus (wire · red · blue), un chariot avec un terminal de
 * contact. Le portail est le bouton lumineux de l'unité « portfolio-zoom » :
 * l'univers entier est dedans, et la boucle recommence.
 */
import type { Level } from '../engine/types';
import { C, fillRR, glow, rgba, rng, text, FONT } from '../engine/util';

const HORIZON = 0.12;
const RACK = { x: -0.46, y: -0.8, w: 0.92, h: 1.6 };

interface Unit {
  name: string;
  h: number;
  note?: string;
  special?: boolean;
}
const UNITS: Unit[] = [
  { name: 'traefik', h: 0.1, note: 'reverse proxy' },
  { name: 'portier', h: 0.1, note: 'auth · TOTP · passkeys' },
  { name: 'admin', h: 0.1, note: 'panel + agent' },
  { name: 'hub', h: 0.1, note: 'liste des sites' },
  { name: 'dle-community', h: 0.1, note: 'Next.js' },
  { name: 'zeste', h: 0.1, note: 'Express' },
  { name: 'postgres', h: 0.1, note: 'données' },
  { name: 'portfolio-zoom', h: 0.22, special: true },
  { name: 'backups', h: 0.1, note: '→ OVH' },
]
const UNIT_Y: number[] = [];
{
  let y = RACK.y + 0.06;
  for (const u of UNITS) {
    UNIT_Y.push(y);
    y += u.h + 0.012;
  }
}
RACK.h = UNIT_Y[UNIT_Y.length - 1] + UNITS[UNITS.length - 1].h + 0.05 - RACK.y;
const SPECIAL = UNITS.findIndex((u) => u.special);
const BTN_X = 0.3;
const BTN_Y = UNIT_Y[SPECIAL] + UNITS[SPECIAL].h / 2;
const BTN_R = 0.052;
const S = 0.05;

const LEDS = (() => {
  const r = rng(808);
  return UNITS.map(() => Array.from({ length: 6 }, () => ({ sp: 2 + r() * 9, ph: r() * 6, c: r() < 0.5 ? C.blue : '#3dd68c' })));
})();
const BACK = (() => {
  const r = rng(809);
  const racks: { x: number; leds: { y: number; ph: number; sp: number; c: string }[] }[] = [];
  for (let x = -3.2; x < 3.2; x += 0.34) {
    if (Math.abs(x) < 0.4) continue;
    racks.push({
      x,
      leds: Array.from({ length: 14 }, () => ({ y: -0.5 + r() * 0.75, ph: r() * 6, sp: 1 + r() * 6, c: r() < 0.4 ? C.blue : r() < 0.7 ? '#3dd68c' : C.red })),
    });
  }
  return racks;
})();
const DUST = (() => {
  const r = rng(810);
  return Array.from({ length: 40 }, () => ({ x: (r() * 2 - 1) * 2, y: (r() * 2 - 1) * 1.2, sp: 0.005 + r() * 0.02, ph: r() * 6 }));
})();

export const serveur: Level = {
  key: 'serveur',
  portal: { x: BTN_X, y: BTN_Y, s: S },
  clip(ctx) {
    ctx.arc(BTN_X, BTN_Y, BTN_R, 0, Math.PI * 2);
  },
  draw(d) {
    const { ctx, time, px, view } = d;

    const bg = ctx.createLinearGradient(0, -1.5, 0, 1.5);
    bg.addColorStop(0, '#03040a');
    bg.addColorStop(0.5, '#070a16');
    bg.addColorStop(1, '#04050b');
    ctx.fillStyle = bg;
    ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);

    // Sol en perspective
    d.layer(0.75, () => {
      ctx.strokeStyle = 'rgba(80,130,255,0.14)';
      ctx.lineWidth = Math.max(1 / px, 0.002);
      for (let i = -24; i <= 24; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 0.04, HORIZON);
        ctx.lineTo(i * 0.5, 2);
        ctx.stroke();
      }
      for (let k = 1; k < 14; k++) {
        const y = HORIZON + Math.pow(k / 13, 2) * 1.9;
        ctx.beginPath();
        ctx.moveTo(-4, y);
        ctx.lineTo(4, y);
        ctx.stroke();
      }
      // Rangées de baies au fond
      for (const rk of BACK) {
        fillRR(ctx, rk.x - 0.14, -0.58, 0.28, 0.72, 0.01, '#0b0f1c');
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let y = -0.55; y < 0.1; y += 0.05) ctx.fillRect(rk.x - 0.12, y, 0.24, 0.004);
        for (const l of rk.leds) {
          const on = Math.sin(time * l.sp + l.ph) > 0.3;
          ctx.fillStyle = on ? l.c : rgba(l.c, 0.15);
          ctx.fillRect(rk.x + 0.08, l.y, 0.012, 0.008);
        }
      }
      // Néons du plafond
      for (let i = -3; i <= 3; i++) {
        const g = ctx.createLinearGradient(0, -1.2, 0, -0.7);
        g.addColorStop(0, 'rgba(170,200,255,0)');
        g.addColorStop(1, 'rgba(170,200,255,0.06)');
        ctx.fillStyle = g;
        ctx.fillRect(i * 0.8 - 0.2, -1.2, 0.4, 0.6);
        ctx.fillStyle = 'rgba(210,225,255,0.55)';
        ctx.fillRect(i * 0.8 - 0.2, -0.72, 0.4, 0.01);
      }
    });

    d.layer(1, () => {
      // Câbles rouge et bleu qui montent vers le plafond
      const cable = (x0: number, x1: number, col: string, w: number, sway: number) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, RACK.y + 0.02);
        ctx.bezierCurveTo(x0, RACK.y - 0.3, x1 + sway, RACK.y - 0.2, x1, -1.8);
        ctx.stroke();
      };
      for (let i = 0; i < 5; i++) {
        cable(-0.3 + i * 0.03, -0.9 - i * 0.05, i % 2 ? C.blue : C.red, 0.014, Math.sin(time * 0.5 + i) * 0.01);
        cable(0.3 - i * 0.03, 0.9 + i * 0.05, i % 2 ? C.red : C.blue, 0.014, Math.sin(time * 0.5 + i) * 0.01);
      }

      // Halo derrière le rack
      glow(ctx, 0, 0, 1.1, C.blue, 0.12);

      // Le rack
      fillRR(ctx, RACK.x - 0.03, RACK.y - 0.03, RACK.w + 0.06, RACK.h + 0.06, 0.02, '#0f121c');
      fillRR(ctx, RACK.x, RACK.y, RACK.w, RACK.h, 0.012, '#07090f');
      ctx.fillStyle = '#1b2030';
      ctx.fillRect(RACK.x + 0.02, RACK.y, 0.02, RACK.h);
      ctx.fillRect(RACK.x + RACK.w - 0.04, RACK.y, 0.02, RACK.h);
      ctx.fillStyle = '#5a6380';
      for (let y = RACK.y + 0.02; y < RACK.y + RACK.h; y += 0.035) {
        ctx.fillRect(RACK.x + 0.027, y, 0.006, 0.006);
        ctx.fillRect(RACK.x + RACK.w - 0.033, y, 0.006, 0.006);
      }

      const detail = d.visible(0.02, 3);
      UNITS.forEach((u, i) => {
        const y = UNIT_Y[i];
        const x = RACK.x + 0.045;
        const w = RACK.w - 0.09;
        if (u.special) {
          const g = ctx.createLinearGradient(x, y, x + w, y);
          g.addColorStop(0, '#1c1830');
          g.addColorStop(1, '#14203a');
          fillRR(ctx, x, y, w, u.h, 0.008, g);
          ctx.strokeStyle = rgba(C.blue, 0.6);
          ctx.lineWidth = Math.max(1.2 / px, 0.002);
          ctx.beginPath();
          ctx.roundRect(x, y, w, u.h, 0.008);
          ctx.stroke();
        } else {
          fillRR(ctx, x, y, w, u.h, 0.006, '#161a26');
        }
        // grilles d'aération
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        for (let k = 0; k < 9; k++) ctx.fillRect(x + 0.42 + k * 0.018, y + 0.02, 0.008, u.h - 0.04);
        // voyants
        LEDS[i].forEach((l, k) => {
          const on = Math.sin(time * l.sp + l.ph) > -0.2;
          ctx.fillStyle = on ? l.c : rgba(l.c, 0.15);
          ctx.fillRect(x + 0.02 + k * 0.022, y + u.h - 0.03, 0.012, 0.01);
          if (on && k === 0) glow(ctx, x + 0.026 + k * 0.022, y + u.h - 0.025, 0.02, l.c, 0.5);
        });
        if (detail) {
          text(ctx, u.name, x + 0.02, y + 0.045, u.special ? 0.034 : 0.028, u.special ? '#ffffff' : '#c9cfe8', {
            font: FONT.mono,
            weight: 600,
          });
          if (u.note) text(ctx, u.note, x + 0.24, y + 0.045, 0.018, 'rgba(200,210,240,0.45)', { font: FONT.mono });
          if (u.special) {
            text(ctx, 'tu es ici ↓ (encore)', x + 0.02, y + 0.095, 0.02, rgba(C.blueSoft, 0.9), { font: FONT.mono });
          }
        }
      });

      // Le bouton = portail
      const pulse = 0.6 + 0.4 * Math.sin(time * 2.2);
      glow(ctx, BTN_X, BTN_Y, 0.2, C.blue, 0.55 * pulse);
      ctx.fillStyle = '#2a3045';
      ctx.beginPath();
      ctx.arc(BTN_X, BTN_Y, BTN_R + 0.016, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 0.008;
      ctx.beginPath();
      ctx.arc(BTN_X, BTN_Y, BTN_R + 0.006, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#020309';
      ctx.beginPath();
      ctx.arc(BTN_X, BTN_Y, BTN_R, 0, Math.PI * 2);
      ctx.fill();
      d.portal();
      // reflet de verre
      const gl = ctx.createLinearGradient(BTN_X - BTN_R, BTN_Y - BTN_R, BTN_X + BTN_R, BTN_Y + BTN_R);
      gl.addColorStop(0, 'rgba(255,255,255,0.14)');
      gl.addColorStop(0.45, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(BTN_X, BTN_Y, BTN_R, 0, Math.PI * 2);
      ctx.fill();

      d.hot('rack', { kind: 'rect', x: RACK.x, y: RACK.y, w: RACK.w, h: UNIT_Y[SPECIAL] - RACK.y - 0.01 });

      // Écran mural (gauche) : activité
      const mx = -1.48;
      const my = -0.58;
      fillRR(ctx, mx, my, 0.74, 0.46, 0.015, '#0c0f1a');
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = Math.max(1 / px, 0.002);
      ctx.strokeRect(mx, my, 0.74, 0.46);
      text(ctx, 'activité', mx + 0.04, my + 0.06, 0.024, 'rgba(220,226,255,0.7)', { font: FONT.mono });
      for (const [ci, col] of [C.red, C.blue].entries()) {
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.006;
        ctx.beginPath();
        for (let k = 0; k <= 40; k++) {
          const xx = mx + 0.04 + k * 0.0165;
          const v = Math.sin(k * 0.45 + time * (1.2 + ci) + ci * 2) * 0.05 + Math.sin(k * 1.3 - time * 2) * 0.02;
          const yy = my + 0.3 - ci * 0.08 + v;
          if (k) ctx.lineTo(xx, yy);
          else ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      }
      for (let k = 0; k < 10; k++) {
        ctx.fillStyle = '#3dd68c';
        ctx.beginPath();
        ctx.arc(mx + 0.05 + k * 0.035, my + 0.415, 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
      text(ctx, 'conteneurs', mx + 0.42, my + 0.422, 0.02, 'rgba(220,226,255,0.5)', { font: FONT.mono });

      // Chariot + terminal de contact (droite)
      const cx = 0.78;
      const cy = -0.36;
      const contactHot = d.isHover('contact');
      if (contactHot) glow(ctx, cx + 0.33, cy + 0.25, 0.6, '#ffffff', 0.1);
      fillRR(ctx, cx, cy, 0.66, 0.5, 0.015, '#0e1020');
      fillRR(ctx, cx + 0.02, cy + 0.02, 0.62, 0.46, 0.01, '#05060c');
      const lines: [string, string][] = [
        ['$', 'cat contact.txt'],
        ['mail', 'kylian.gagnon@free.fr'],
        ['github', 'XxWirexX'],
        ['linkedin', 'kylian-gagnon'],
        ['web', 'wireredblue.xyz'],
      ];
      lines.forEach(([k, v], i) => {
        const y = cy + 0.09 + i * 0.065;
        if (i === 0) {
          text(ctx, k, cx + 0.05, y, 0.026, C.red, { font: FONT.mono, weight: 700 });
          text(ctx, v, cx + 0.09, y, 0.026, '#ffffff', { font: FONT.mono });
        } else {
          text(ctx, k, cx + 0.05, y, 0.024, C.blueSoft, { font: FONT.mono, weight: 600 });
          text(ctx, v, cx + 0.2, y, 0.024, '#e6e9ff', { font: FONT.mono, maxW: 0.42 });
        }
      });
      if (Math.sin(time * 5) > 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx + 0.05, cy + 0.41, 0.014, 0.03);
      }
      // pied du chariot
      ctx.fillStyle = '#1b1f2e';
      ctx.fillRect(cx + 0.3, cy + 0.5, 0.05, 0.4);
      fillRR(ctx, cx + 0.06, cy + 0.6, 0.54, 0.04, 0.01, '#1b1f2e');
      fillRR(ctx, cx + 0.06, cy + 0.9, 0.54, 0.04, 0.01, '#1b1f2e');
      ctx.fillStyle = '#0a0c14';
      for (const wx of [cx + 0.1, cx + 0.56]) {
        ctx.beginPath();
        ctx.arc(wx, cy + 0.97, 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      d.hot('contact', { kind: 'rect', x: cx, y: cy, w: 0.66, h: 0.5 });
    });

    // Premier plan : poussière dans la lumière
    if (d.bg)
      d.layer(1.35, () => {
        for (const p of DUST) {
          const y = p.y + Math.sin(time * 0.3 + p.ph) * 0.05;
          const x = p.x + Math.sin(time * p.sp * 20 + p.ph) * 0.03;
          ctx.globalAlpha = 0.25 + 0.2 * Math.sin(time + p.ph);
          ctx.fillStyle = '#cfe0ff';
          const z = 2 / px;
          ctx.fillRect(x, y, z, z);
        }
        ctx.globalAlpha = 1;
      });
  },
};
