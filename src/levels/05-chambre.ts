/**
 * 05 · La chambre, vue depuis la fenêtre. Bureau, étagère, affiche du BDE,
 * télescope (clin d'œil au niveau 0), ruban LED rouge/bleu. Le portail est
 * l'écran principal.
 */
import type { Level } from '../engine/types';
import { C, fillRR, glow, rgba, rng, text } from '../engine/util';

const S = 0.15;
const MX = 0;
const MY = -0.1;
const MW = 1.6 * S; // demi-largeur de l'écran
const MH = 0.9 * S;
const FLOOR = 0.7;
const DESK = 0.22;

const BOOKS = (() => {
  const r = rng(55);
  const cols = ['#c0394b', '#3b6bd6', '#e6b44c', '#2e9b7a', '#8a5bd6', '#d8d2c4', '#e0603f', '#4a5470'];
  const out: { x: number; w: number; h: number; c: string; tilt: number; shelf: number }[] = [];
  for (const shelf of [0, 1]) {
    let x = -0.93;
    while (x < -0.5) {
      const w = 0.018 + r() * 0.02;
      out.push({ x, w, h: 0.1 + r() * 0.06, c: cols[Math.floor(r() * cols.length)], tilt: r() < 0.08 ? 0.25 : 0, shelf });
      x += w + 0.003;
      if (shelf === 1 && x > -0.75) break;
    }
  }
  return out;
})();

const NIGHT = (() => {
  const r = rng(56);
  return Array.from({ length: 30 }, () => ({ x: 1.08 + r() * 0.4, y: -0.72 + r() * 0.5, a: 0.3 + r() * 0.6 }));
})();

export const chambre: Level = {
  key: 'chambre',
  portal: { x: MX, y: MY, s: S },
  clip(ctx) {
    ctx.rect(MX - MW, MY - MH, MW * 2, MH * 2);
  },
  draw(d) {
    const { ctx, time, px, view } = d;

    // Mur
    const wall = ctx.createLinearGradient(0, -1.5, 0, FLOOR);
    wall.addColorStop(0, '#120f22');
    wall.addColorStop(1, '#241c3a');
    ctx.fillStyle = wall;
    ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
    // Sol
    const floor = ctx.createLinearGradient(0, FLOOR, 0, 1.8);
    floor.addColorStop(0, '#2b1f2c');
    floor.addColorStop(1, '#120c14');
    ctx.fillStyle = floor;
    ctx.fillRect(view.x0, FLOOR, view.x1 - view.x0, Math.max(0, view.y1 - FLOOR));
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let x = -3; x < 3; x += 0.18) ctx.fillRect(x, FLOOR, 0.004, 1.2);
    ctx.fillStyle = '#17121f';
    ctx.fillRect(view.x0, FLOOR - 0.03, view.x1 - view.x0, 0.03);

    d.layer(1, () => {
      // Lumières d'ambiance
      glow(ctx, 0.9, 0.1, 0.9, '#ffb45a', 0.18);
      // ruban LED derrière l'écran : le fil rouge → bleu
      glow(ctx, -0.3, -0.12, 0.6, C.red, 0.26);
      glow(ctx, 0.3, -0.12, 0.6, C.blue, 0.3);
      const led = ctx.createLinearGradient(-0.45, 0, 0.45, 0);
      led.addColorStop(0, rgba(C.red, 0));
      led.addColorStop(0.2, rgba(C.red, 0.9));
      led.addColorStop(0.8, rgba(C.blue, 0.9));
      led.addColorStop(1, rgba(C.blue, 0));
      ctx.fillStyle = led;
      ctx.fillRect(-0.45, MY - MH - 0.05, 0.9, 0.006);

      // Fenêtre (droite) avec la nuit
      ctx.fillStyle = '#0a0b22';
      ctx.fillRect(1.06, -0.75, 0.44, 0.62);
      ctx.fillStyle = '#fff';
      for (const s of NIGHT) {
        ctx.globalAlpha = s.a;
        ctx.fillRect(s.x, s.y, 1.2 / px, 1.2 / px);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#1a1630';
      for (let i = 0; i < 6; i++) ctx.fillRect(1.06 + i * 0.075, -0.32 + Math.sin(i * 2.3) * 0.08, 0.07, 0.25);
      ctx.strokeStyle = '#3a3150';
      ctx.lineWidth = 0.02;
      ctx.strokeRect(1.06, -0.75, 0.44, 0.62);
      ctx.beginPath();
      ctx.moveTo(1.28, -0.75);
      ctx.lineTo(1.28, -0.13);
      ctx.stroke();

      // Télescope près de la fenêtre
      ctx.strokeStyle = '#8c90a8';
      ctx.lineWidth = 0.012;
      ctx.beginPath();
      ctx.moveTo(1.2, 0.2);
      ctx.lineTo(1.1, FLOOR);
      ctx.moveTo(1.2, 0.2);
      ctx.lineTo(1.3, FLOOR);
      ctx.moveTo(1.2, 0.2);
      ctx.lineTo(1.2, FLOOR);
      ctx.stroke();
      ctx.save();
      ctx.translate(1.2, 0.18);
      ctx.rotate(-0.7);
      fillRR(ctx, -0.12, -0.03, 0.3, 0.06, 0.01, '#dfe3f0');
      ctx.fillStyle = '#3b6bd6';
      ctx.fillRect(0.1, -0.035, 0.03, 0.07);
      ctx.restore();
      if (d.isHover('espace')) glow(ctx, 1.2, 0.3, 0.35, '#ffffff', 0.15);
      d.hot('espace', { kind: 'rect', x: 1.05, y: -0.02, w: 0.3, h: FLOOR + 0.02 });

      // Affiche planète (gauche)
      fillRR(ctx, -1.42, -0.62, 0.3, 0.4, 0.01, '#0d1030');
      glow(ctx, -1.27, -0.42, 0.14, '#ffcf80', 0.25);
      ctx.fillStyle = '#e8c890';
      ctx.beginPath();
      ctx.arc(-1.27, -0.43, 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f5e4bb';
      ctx.lineWidth = 0.008;
      ctx.beginPath();
      ctx.ellipse(-1.27, -0.43, 0.11, 0.03, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      text(ctx, 'COSMOS', -1.27, -0.27, 0.028, '#f5e4bb', { align: 'center', weight: 700, spacing: 0.01 });

      // Étagère
      const shelfHot = d.isHover('veille');
      ctx.fillStyle = '#3d2c26';
      ctx.fillRect(-0.97, -0.46, 0.5, 0.02);
      ctx.fillRect(-0.97, -0.22, 0.5, 0.02);
      for (const b of BOOKS) {
        const base = b.shelf === 0 ? -0.46 : -0.22;
        ctx.save();
        ctx.translate(b.x, base);
        ctx.rotate(b.tilt);
        ctx.fillStyle = b.c;
        ctx.fillRect(0, -b.h, b.w, b.h);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(0, -b.h + 0.02, b.w, 0.006);
        ctx.restore();
      }
      // casque de pompier
      ctx.fillStyle = '#d6d9e0';
      ctx.beginPath();
      ctx.ellipse(-0.6, -0.245, 0.075, 0.07, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c9a43a';
      ctx.fillRect(-0.68, -0.25, 0.16, 0.012);
      ctx.fillStyle = '#e8b93c';
      ctx.fillRect(-0.605, -0.31, 0.01, 0.06);
      // plante
      ctx.fillStyle = '#7a4a35';
      fillRR(ctx, -0.65, -0.55, 0.08, 0.09, 0.01, '#7a4a35');
      ctx.fillStyle = '#3e9a6a';
      for (let i = 0; i < 7; i++) {
        ctx.save();
        ctx.translate(-0.61, -0.55);
        ctx.rotate(-1.2 + i * 0.4 + Math.sin(time + i) * 0.03);
        ctx.beginPath();
        ctx.ellipse(0, -0.06, 0.018, 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (shelfHot) glow(ctx, -0.72, -0.4, 0.3, '#ffffff', 0.12);
      d.hot('veille', { kind: 'rect', x: -0.97, y: -0.64, w: 0.5, h: 0.44 });

      // Tableau en liège avec des post-it (décor)
      fillRR(ctx, 0.47, -0.62, 0.32, 0.38, 0.012, '#6b4a33');
      fillRR(ctx, 0.485, -0.605, 0.29, 0.35, 0.008, '#a67c52');
      {
        const notes: [number, number, string, number][] = [
          [0.51, -0.58, '#ffe27a', -0.06],
          [0.62, -0.57, '#ff9fb0', 0.05],
          [0.52, -0.44, '#9fd0ff', 0.04],
          [0.64, -0.43, '#b6f0a8', -0.05],
        ];
        for (const [x, y, c, r] of notes) {
          ctx.save();
          ctx.translate(x + 0.05, y + 0.05);
          ctx.rotate(r);
          ctx.fillStyle = c;
          ctx.fillRect(-0.05, -0.05, 0.1, 0.1);
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          for (let i = 0; i < 3; i++) ctx.fillRect(-0.035, -0.02 + i * 0.022, 0.06 - i * 0.012, 0.006);
          ctx.restore();
        }
        ctx.fillStyle = C.red;
        ctx.beginPath();
        ctx.arc(0.62, -0.6, 0.008, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bureau
      ctx.fillStyle = '#1b1526';
      ctx.fillRect(-0.95, DESK + 0.08, 0.04, FLOOR - DESK);
      ctx.fillRect(0.91, DESK + 0.08, 0.04, FLOOR - DESK);
      ctx.fillStyle = '#4a3a3a';
      ctx.beginPath();
      ctx.moveTo(-0.98, DESK);
      ctx.lineTo(0.98, DESK);
      ctx.lineTo(1.02, DESK + 0.06);
      ctx.lineTo(-1.02, DESK + 0.06);
      ctx.fill();
      ctx.fillStyle = '#2e2329';
      ctx.fillRect(-1.02, DESK + 0.06, 2.04, 0.03);

      // Pied de l'écran
      ctx.fillStyle = '#1a1a24';
      ctx.fillRect(-0.02, MY + MH, 0.04, DESK - MY - MH + 0.01);
      fillRR(ctx, -0.1, DESK - 0.008, 0.2, 0.02, 0.008, '#1a1a24');

      // Écran = portail
      fillRR(ctx, MX - MW - 0.014, MY - MH - 0.014, MW * 2 + 0.028, MH * 2 + 0.03, 0.012, '#0b0b12');
      glow(ctx, MX, MY, 0.55, '#6aa8ff', 0.2);
      ctx.fillStyle = '#10142a';
      ctx.fillRect(MX - MW, MY - MH, MW * 2, MH * 2);
      d.portal();
      // reflet sur la dalle
      const refl = ctx.createLinearGradient(MX - MW, MY - MH, MX + MW, MY + MH);
      refl.addColorStop(0, 'rgba(255,255,255,0.05)');
      refl.addColorStop(0.4, 'rgba(255,255,255,0)');
      ctx.fillStyle = refl;
      ctx.fillRect(MX - MW, MY - MH, MW * 2, MH * 2);

      // Laptop (gauche)
      ctx.fillStyle = '#20222e';
      ctx.beginPath();
      ctx.moveTo(-0.72, DESK - 0.005);
      ctx.lineTo(-0.68, DESK - 0.17);
      ctx.lineTo(-0.44, DESK - 0.17);
      ctx.lineTo(-0.42, DESK - 0.005);
      ctx.fill();
      ctx.fillStyle = '#0e1630';
      ctx.beginPath();
      ctx.moveTo(-0.7, DESK - 0.02);
      ctx.lineTo(-0.67, DESK - 0.155);
      ctx.lineTo(-0.45, DESK - 0.155);
      ctx.lineTo(-0.44, DESK - 0.02);
      ctx.fill();
      const rL = rng(3);
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = [C.blueSoft, C.redSoft, '#9be38a', '#d8d2ff'][Math.floor(rL() * 4)];
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-0.66 + (i % 3) * 0.01, DESK - 0.14 + i * 0.016, 0.04 + rL() * 0.12, 0.006);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2a2c3a';
      ctx.fillRect(-0.76, DESK - 0.005, 0.38, 0.012);
      if (d.isHover('cyber')) glow(ctx, -0.57, DESK - 0.09, 0.22, '#ffffff', 0.18);
      d.hot('cyber', { kind: 'rect', x: -0.76, y: DESK - 0.18, w: 0.38, h: 0.19 });

      // Clavier, souris, tasse
      fillRR(ctx, -0.2, DESK + 0.012, 0.4, 0.035, 0.008, '#15151f');
      ctx.fillStyle = rgba(C.blue, 0.6);
      for (let i = 0; i < 14; i++) ctx.fillRect(-0.185 + i * 0.027, DESK + 0.02, 0.018, 0.008);
      ctx.fillStyle = rgba(C.red, 0.5);
      for (let i = 0; i < 14; i++) ctx.fillRect(-0.185 + i * 0.027, DESK + 0.032, 0.018, 0.008);
      fillRR(ctx, 0.26, DESK + 0.015, 0.05, 0.03, 0.014, '#15151f');
      fillRR(ctx, -0.36, DESK - 0.07, 0.07, 0.085, 0.01, '#e9e4dc');
      ctx.strokeStyle = '#e9e4dc';
      ctx.lineWidth = 0.01;
      ctx.beginPath();
      ctx.arc(-0.285, DESK - 0.03, 0.022, -1.3, 1.3);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 0.008;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        const ox = -0.335 + i * 0.022;
        ctx.moveTo(ox, DESK - 0.08);
        ctx.bezierCurveTo(ox + Math.sin(time * 2 + i) * 0.02, DESK - 0.13, ox - 0.02, DESK - 0.16, ox + Math.sin(time * 1.5 + i) * 0.015, DESK - 0.2);
        ctx.stroke();
      }

      // Manette
      const padHot = d.isHover('jeux');
      ctx.save();
      ctx.translate(0.5, DESK + 0.01);
      ctx.rotate(-0.12);
      if (padHot) glow(ctx, 0, 0, 0.16, '#ffffff', 0.25);
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath();
      ctx.ellipse(-0.045, 0.005, 0.04, 0.03, 0.3, 0, Math.PI * 2);
      ctx.ellipse(0.045, 0.005, 0.04, 0.03, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-0.05, -0.02, 0.1, 0.035);
      ctx.fillStyle = C.red;
      ctx.beginPath();
      ctx.arc(0.05, -0.005, 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.blue;
      ctx.beginPath();
      ctx.arc(0.065, 0.007, 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.fillRect(-0.065, -0.002, 0.03, 0.009);
      ctx.fillRect(-0.054, -0.013, 0.009, 0.03);
      ctx.restore();
      d.hot('jeux', { kind: 'rect', x: 0.4, y: DESK - 0.06, w: 0.2, h: 0.12 });

      // Lampe de bureau
      ctx.strokeStyle = '#2a2a38';
      ctx.lineWidth = 0.014;
      ctx.beginPath();
      ctx.moveTo(0.82, DESK);
      ctx.lineTo(0.76, DESK - 0.22);
      ctx.lineTo(0.66, DESK - 0.3);
      ctx.stroke();
      ctx.fillStyle = '#2a2a38';
      ctx.beginPath();
      ctx.moveTo(0.6, DESK - 0.3);
      ctx.lineTo(0.72, DESK - 0.34);
      ctx.lineTo(0.7, DESK - 0.25);
      ctx.fill();
      glow(ctx, 0.66, DESK - 0.25, 0.35, '#ffcf8a', 0.35);
    });

    // Premier plan : le dossier de la chaise
    if (d.bg)
      d.layer(1.5, () => {
        ctx.fillStyle = '#07060c';
        ctx.beginPath();
        ctx.moveTo(-0.42, 1.6);
        ctx.lineTo(-0.4, 0.56);
        ctx.quadraticCurveTo(-0.38, 0.4, -0.15, 0.39);
        ctx.quadraticCurveTo(0.08, 0.4, 0.1, 0.56);
        ctx.lineTo(0.12, 1.6);
        ctx.fill();
        ctx.fillStyle = rgba(C.red, 0.5);
        ctx.fillRect(-0.33, 0.5, 0.012, 0.6);
        ctx.fillStyle = rgba(C.blue, 0.5);
        ctx.fillRect(0.03, 0.5, 0.012, 0.6);
      });
  },
};
