/**
 * 00 · Espace — une galaxie spirale. Le portail est une étoile discrète dans
 * un bras (notre Soleil est lui aussi en périphérie de la Voie lactée).
 */
import type { Level } from '../engine/types';
import { C, Dots, fillView, gauss, glow, rng, text, FONT } from '../engine/util';

// ---- Galaxie : particules précalculées une fois pour toutes ----
const ROT = -0.42; // inclinaison du disque
const SQUASH = 0.56; // aplatissement (vue de biais)
const GX = -0.08;
const GY = 0.02;

function project(rho: number, th: number): [number, number] {
  const x = rho * Math.cos(th);
  const y = rho * Math.sin(th) * SQUASH;
  return [GX + x * Math.cos(ROT) - y * Math.sin(ROT), GY + x * Math.sin(ROT) + y * Math.cos(ROT)];
}
const armAngle = (arm: number, rho: number) => arm * Math.PI + Math.log(rho / 0.05) * 1.75;

const COLORS = ['#ffe2b8', '#fff4e6', '#cfe0ff', '#8fb6ff', '#ff7aa0', '#b9c7ff'];
interface P {
  x: number;
  y: number;
  a: number;
  sz: number;
  ph: number;
}
const bins: P[][] = COLORS.map(() => []);
{
  const r = rng(42);
  // bulbe
  for (let i = 0; i < 1100; i++) {
    const rho = Math.abs(gauss(r)) * 0.11;
    const [x, y] = project(rho, r() * Math.PI * 2);
    bins[r() < 0.7 ? 0 : 1].push({ x, y, a: 0.35 + r() * 0.5, sz: 1 + r() * 0.8, ph: r() * 6 });
  }
  // bras
  for (let i = 0; i < 4200; i++) {
    const arm = i % 2;
    const u = r();
    const rho = 0.06 + 0.92 * Math.pow(u, 0.85);
    const th = armAngle(arm, rho) + gauss(r) * (0.16 + 0.1 * u);
    const rr = rho + gauss(r) * 0.025;
    const [x, y] = project(rr, th);
    let c = u < 0.25 ? 1 : r() < 0.55 ? 2 : 3;
    if (r() < 0.06) c = 4; // régions HII rosées
    if (r() < 0.08) c = 5;
    bins[c].push({ x, y, a: 0.25 + r() * 0.6 * (1 - u * 0.5), sz: 0.8 + r() * 1.2, ph: r() * 6 });
  }
  // halo diffus
  for (let i = 0; i < 400; i++) {
    const rho = 0.1 + r() * 1.0;
    const [x, y] = project(rho, r() * Math.PI * 2);
    bins[2].push({ x, y, a: 0.1 + r() * 0.2, sz: 0.8, ph: r() * 6 });
  }
}

const GALAXY = bins.map((b) => new Dots(b.map((p) => ({ x: p.x, y: p.y, a: p.a, s: p.sz }))));

/** Le Soleil : posé exactement sur le bras 0. */
const SUN_RHO = 0.66;
const [SUN_X, SUN_Y] = project(SUN_RHO, armAngle(0, SUN_RHO) + 0.08);

// ---- Champs d'étoiles (3 profondeurs pour la parallaxe) ----
function field(seed: number, n: number, spread: number) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({
    x: (r() * 2 - 1) * spread,
    y: (r() * 2 - 1) * spread,
    a: 0.2 + r() * 0.8,
    sz: 0.6 + r() * r() * 2.2,
    ph: r() * 6.28,
    hue: r(),
  }));
}
const FAR = field(7, 420, 3.2);
const MID = field(8, 160, 3.2);
const tint = (list: typeof FAR, lo: number, hi: number) =>
  new Dots(list.filter((s) => s.hue >= lo && s.hue < hi).map((s) => ({ x: s.x, y: s.y, a: s.a, s: s.sz })));
const FAR_D = [tint(FAR, 0, 0.15), tint(FAR, 0.15, 0.85), tint(FAR, 0.85, 1.01)];
const MID_D = [tint(MID, 0, 0.15), tint(MID, 0.15, 0.85), tint(MID, 0.85, 1.01)];
const TINTS = ['#ffd2dc', '#ffffff', '#cfe0ff'];
const NEAR = field(9, 46, 2.6);

export const espace: Level = {
  key: 'espace',
  portal: { x: SUN_X, y: SUN_Y, s: 0.07 },
  opaqueNested: false,
  draw(d) {
    const { ctx, time, px } = d;

    if (d.bg) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 3);
      g.addColorStop(0, '#0c1024');
      g.addColorStop(0.5, '#060815');
      g.addColorStop(1, '#020309');
      fillView(ctx, d.view, g);
    }

    const stars = (list: typeof FAR, k: number, flare: boolean) => {
      for (const s of list) {
        const tw = 0.65 + 0.35 * Math.sin(time * (1.2 + s.hue) + s.ph);
        const size = (s.sz * k) / px;
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.hue < 0.15 ? '#ffd2dc' : s.hue > 0.85 ? '#cfe0ff' : '#ffffff';
        ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
        if (flare && s.sz > 1.6) {
          const L = (s.sz * 9) / px;
          ctx.globalAlpha = s.a * tw * 0.35;
          ctx.fillRect(s.x - L, s.y - size / 6, L * 2, size / 3);
          ctx.fillRect(s.x - size / 6, s.y - L, size / 3, L * 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    if (d.bg) d.layer(0.45, (v) => FAR_D.forEach((g, i) => g.draw(ctx, TINTS[i], px, { time, view: v })));

    // Nébuleuses rouge/bleu
    d.layer(0.7, () => {
      if (!d.bg) return;
      glow(ctx, -1.4, -0.6, 1.3, C.blue, 0.16);
      glow(ctx, 1.5, 0.7, 1.2, C.red, 0.12);
      glow(ctx, 0.9, -0.9, 0.9, '#7a4bff', 0.1);
      glow(ctx, -1.0, 0.9, 0.8, C.red, 0.07);
      MID_D.forEach((g, i) => g.draw(ctx, TINTS[i], px, { sizePx: 1.4, time: time + 3 }));
    });

    // Galaxie (plan du portail)
    d.layer(1, () => {
      glow(ctx, GX, GY, 0.95, '#6b8cff', 0.14);
      glow(ctx, GX, GY, 0.42, '#ffcf9e', 0.35);
      glow(ctx, GX, GY, 0.12, '#fff3e0', 0.9);
      const grow = 1 + d.p * 1.5;
      GALAXY.forEach((g, b) => g.draw(ctx, COLORS[b], px, { sizePx: grow, time, view: d.view }));

      // Le Soleil (le système solaire s'y dessine par-dessus)
      glow(ctx, SUN_X, SUN_Y, 0.045, '#ffe7a8', 0.9);
      d.portal();

      d.hot('astro', { kind: 'circle', x: GX, y: GY, r: 0.24 });

      // « tu es ici »
      const a = d.depth === 0 ? Math.max(0, 1 - d.p * 4) : 0;
      if (a > 0 && d.visible(0.02, 6)) {
        ctx.globalAlpha = a;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.2 / px;
        const r0 = 0.03 + 0.004 * Math.sin(time * 3);
        ctx.beginPath();
        ctx.arc(SUN_X, SUN_Y, r0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(SUN_X + r0 * 0.75, SUN_Y + r0 * 0.75);
        ctx.lineTo(SUN_X + 0.1, SUN_Y + 0.11);
        ctx.lineTo(SUN_X + 0.26, SUN_Y + 0.11);
        ctx.stroke();
        text(ctx, 'tu es ici', SUN_X + 0.11, SUN_Y + 0.1, 0.034, '#ffffff', { font: FONT.mono, weight: 500 });
        ctx.globalAlpha = 1;
      }
    });

    // Premier plan : grosses étoiles qui filent devant la caméra
    if (d.bg) d.layer(1.6, () => stars(NEAR, 1.8, true));

    // Voile coloré très léger
    if (d.bg && d.depth === 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, SUN_X, SUN_Y, 0.25, C.blue, 0.05 * (1 - d.p));
      ctx.restore();
    }
  },
};
