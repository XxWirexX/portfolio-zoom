/**
 * 01 · Système solaire, vu de biais. La Terre est le portail : elle reste
 * immobile (le portail ne doit pas bouger), les autres planètes tournent.
 */
import type { Level } from '../engine/types';
import { C, fillView, glow, rgba, rng, smooth, text, FONT } from '../engine/util';

const TILT = 0.38;
const EARTH_RX = 0.5;
const EARTH_TH = 0.55;
const EARTH_R = 0.04;
const EX = EARTH_RX * Math.cos(EARTH_TH);
const EY = EARTH_RX * Math.sin(EARTH_TH) * TILT;

interface Planet {
  id?: string;
  rx: number;
  r: number;
  color: string;
  dark: string;
  speed: number;
  th0: number;
  ring?: boolean;
  bands?: boolean;
}
const PLANETS: Planet[] = [
  { rx: 0.2, r: 0.011, color: '#c9b8ab', dark: '#3a302a', speed: 0.5, th0: 2.1 },
  { rx: 0.32, r: 0.019, color: '#f0cf96', dark: '#4a3a22', speed: 0.32, th0: 4.0 },
  { rx: 0.66, r: 0.016, color: '#ff7a4d', dark: '#41170c', speed: 0.18, th0: 3.3 },
  { id: 'bots', rx: 0.94, r: 0.058, color: '#e6c3a0', dark: '#3d2a1d', speed: 0.08, th0: 2.4, bands: true },
  { id: 'autodidacte', rx: 1.2, r: 0.046, color: '#f1dcaa', dark: '#3e3320', speed: 0.05, th0: 0.4, ring: true },
  { rx: 1.44, r: 0.03, color: '#a8eef0', dark: '#173b3f', speed: 0.035, th0: 3.9 },
  { rx: 1.66, r: 0.029, color: '#6f8dff', dark: '#121c4a', speed: 0.028, th0: 5.3 },
];

const BELT = (() => {
  const r = rng(11);
  return Array.from({ length: 380 }, () => ({ rx: 0.76 + (r() - 0.5) * 0.08, th: r() * Math.PI * 2, a: 0.2 + r() * 0.5 }));
})();
const BGSTARS = (() => {
  const r = rng(12);
  return Array.from({ length: 300 }, () => ({ x: (r() * 2 - 1) * 3, y: (r() * 2 - 1) * 3, a: 0.15 + r() * 0.6, s: 0.6 + r() * 1.3 }));
})();

function shadedBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, light: string, dark: string) {
  // la lumière vient du Soleil, en (0,0)
  const len = Math.hypot(x, y) || 1;
  const lx = x - (x / len) * r * 0.55;
  const ly = y - (y / len) * r * 0.55;
  const g = ctx.createRadialGradient(lx, ly, r * 0.05, x, y, r * 1.05);
  g.addColorStop(0, light);
  g.addColorStop(0.55, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export const soleil: Level = {
  key: 'soleil',
  portal: { x: EX, y: EY, s: EARTH_R / 0.55 },
  opaqueNested: false,
  draw(d) {
    const { ctx, time, px } = d;

    if (d.bg) {
      fillView(ctx, d.view, '#03040b');
      d.layer(0.5, () => {
        // bande de la Voie lactée
        ctx.save();
        ctx.rotate(-0.5);
        const g = ctx.createLinearGradient(0, -0.9, 0, 0.9);
        g.addColorStop(0, 'rgba(120,140,255,0)');
        g.addColorStop(0.5, 'rgba(150,160,255,0.08)');
        g.addColorStop(1, 'rgba(255,80,120,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-5, -0.9, 10, 1.8);
        ctx.restore();
        for (const s of BGSTARS) {
          const sz = s.s / px;
          ctx.globalAlpha = s.a;
          ctx.fillStyle = '#fff';
          ctx.fillRect(s.x, s.y, sz, sz);
        }
        ctx.globalAlpha = 1;
      });
    }

    d.layer(1, () => {
      // Vu de loin (dans la galaxie), on ne garde que le Soleil : une étoile.
      const det = smooth(60, 280, px);
      ctx.globalAlpha = det;
      // Orbites
      ctx.lineWidth = 1 / px;
      for (const pl of [...PLANETS, { rx: EARTH_RX } as Planet]) {
        ctx.strokeStyle = pl.rx === EARTH_RX ? rgba(C.blueSoft, 0.45) : 'rgba(180,190,255,0.16)';
        ctx.beginPath();
        ctx.ellipse(0, 0, pl.rx, pl.rx * TILT, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Ceinture d'astéroïdes
      ctx.fillStyle = '#b9b0a6';
      for (const b of BELT) {
        const th = b.th + time * 0.02;
        const sz = 1.2 / px;
        ctx.globalAlpha = b.a * det;
        ctx.fillRect(b.rx * Math.cos(th), b.rx * Math.sin(th) * TILT, sz, sz);
      }
      ctx.globalAlpha = det;

      const pos = PLANETS.map((pl) => {
        const th = pl.th0 + time * pl.speed * 0.25;
        return { pl, x: pl.rx * Math.cos(th), y: pl.rx * Math.sin(th) * TILT };
      });
      const drawPlanet = (o: (typeof pos)[number]) => {
        const { pl, x, y } = o;
        if (pl.ring) {
          ctx.strokeStyle = 'rgba(230,210,170,0.55)';
          ctx.lineWidth = pl.r * 0.28;
          ctx.beginPath();
          ctx.ellipse(x, y, pl.r * 2.1, pl.r * 0.62, -0.25, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
        shadedBall(ctx, x, y, pl.r, pl.color, pl.dark);
        if (pl.bands) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, pl.r, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = 'rgba(140,80,50,0.35)';
          for (let i = -2; i <= 2; i++) ctx.fillRect(x - pl.r, y + i * pl.r * 0.34, pl.r * 2, pl.r * 0.12);
          ctx.restore();
        }
        if (pl.ring) {
          ctx.strokeStyle = 'rgba(240,220,180,0.75)';
          ctx.lineWidth = pl.r * 0.28;
          ctx.beginPath();
          ctx.ellipse(x, y, pl.r * 2.1, pl.r * 0.62, -0.25, 0, Math.PI);
          ctx.stroke();
        }
        if (pl.id) d.hot(pl.id, { kind: 'circle', x, y, r: pl.r * 2.3 });
      };

      for (const o of pos) if (o.y < 0) drawPlanet(o);
      ctx.globalAlpha = 1;

      // Soleil
      const pulse = 1 + 0.03 * Math.sin(time * 2);
      glow(ctx, 0, 0, 0.75 * pulse, '#ff7a3d', 0.16);
      glow(ctx, 0, 0, 0.32, '#ffb347', 0.5);
      const g = ctx.createRadialGradient(-0.02, -0.02, 0, 0, 0, 0.085);
      g.addColorStop(0, '#fffbe8');
      g.addColorStop(0.6, '#ffd36b');
      g.addColorStop(1, '#ff9a3c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 0.085, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = det;
      for (const o of pos) if (o.y >= 0) drawPlanet(o);
      ctx.globalAlpha = 1;

      // Terre = portail
      glow(ctx, EX, EY, EARTH_R * 2.2, C.blue, 0.35);
      ctx.fillStyle = '#16306b';
      ctx.beginPath();
      ctx.arc(EX, EY, EARTH_R, 0, Math.PI * 2);
      ctx.fill();
      d.portal();

      if (d.depth === 0 && d.visible(0.02, 8)) {
        const a = Math.max(0, 1 - d.p * 4);
        ctx.globalAlpha = a;
        text(ctx, 'Terre', EX + EARTH_R * 1.6, EY - EARTH_R * 1.4, 0.03, '#cfe0ff', { font: FONT.mono });
        ctx.globalAlpha = 1;
      }
    });

    // Premier plan : une comète qui traverse
    if (d.bg)
      d.layer(1.5, () => {
        const u = ((time * 0.025) % 1.4) - 0.2;
        const cx = -2.2 + u * 4.4;
        const cy = -1.1 + u * 0.9;
        const tail = ctx.createLinearGradient(cx, cy, cx - 0.5, cy - 0.12);
        tail.addColorStop(0, 'rgba(200,230,255,0.55)');
        tail.addColorStop(1, 'rgba(200,230,255,0)');
        ctx.strokeStyle = tail;
        ctx.lineWidth = 0.012;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 0.5, cy - 0.12);
        ctx.stroke();
        glow(ctx, cx, cy, 0.03, '#e6f4ff', 0.9);
      });
  },
};
