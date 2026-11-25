/**
 * 02 · La Terre de nuit, centrée sur l'Europe et l'Afrique. Les continents
 * sont des polygones grossiers (lat/lon) projetés en orthographique, les
 * lumières viennent d'une liste de villes. Le portail est Lyon.
 */
import type { Level } from '../engine/types';
import { C, Dots, fillView, gauss, glow, rgba, rng, text, FONT } from '../engine/util';

const R = 0.6;
const CX = 0.02;
const CY = 0.06;
const LAT0 = (38 * Math.PI) / 180;
const LON0 = (14 * Math.PI) / 180;

/** lat/lon (degrés) → [x, y, visible] dans le repère du niveau. */
function proj(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180 - LON0;
  const x = Math.cos(la) * Math.sin(lo);
  const y = -(Math.cos(LAT0) * Math.sin(la) - Math.sin(LAT0) * Math.cos(la) * Math.cos(lo));
  const cosc = Math.sin(LAT0) * Math.sin(la) + Math.cos(LAT0) * Math.cos(la) * Math.cos(lo);
  return [CX + x * R, CY + y * R, cosc];
}

// prettier-ignore
const LANDS: number[][] = [
  // Afrique
  [35.8,-5.9, 35.2,-2, 36.8,3, 37.2,10, 33,11, 32.5,15, 30.5,19, 32.8,22, 31.5,25, 31,32, 29.5,32.6, 22,36.9, 15.5,39.5, 12.5,43.3, 11.5,51, 4,48, -1.5,42, -6,39.3, -10.5,40.5, -15,40.7, -20,35, -25.9,32.8, -29.8,31.3, -34,26, -34.5,20, -32.5,18.2, -28.6,16.5, -22,14.3, -17,11.7, -12,13.8, -8,13, -5,12, -1,9, 4,9.5, 4.3,6, 6.4,3.4, 5.5,-2, 4.5,-7.5, 6.5,-11, 8.5,-13.2, 11,-15.5, 14.7,-17.5, 20.8,-17, 26,-14.5, 28.5,-11, 31.5,-9.8, 33.5,-7.5],
  // Europe continentale (+ Russie occidentale)
  [36,-5.6, 37,-8.9, 39.5,-9.3, 43.1,-9.2, 43.6,-1.6, 46.2,-1.2, 47.8,-4.3, 48.6,-4.8, 48.7,-1.6, 49.7,0.2, 50.9,1.6, 51.5,3.5, 53.3,5, 53.6,8.5, 55.5,8.1, 57.6,10.4, 56,10.5, 54.5,10, 54.4,13.5, 54.6,18.5, 56.5,21, 59.4,24, 60.5,29.5, 64,40, 67,44, 68,55, 68,62, 45,62, 42,50, 41.5,48.5, 41,41.5, 44.6,37.5, 46.5,30.7, 45,29.7, 43,28, 42,28, 41.2,29, 41,26, 40.5,26.2, 40.8,23, 39.5,22.9, 38,24, 37,22, 38.3,21, 39.6,20, 41.8,19.5, 43,17.5, 45.2,13.6, 45.7,13.6, 44.4,12.3, 43.6,13.5, 41.9,16, 40.6,18, 39.9,18.4, 40.3,17, 38.9,16.6, 38,15.6, 40.6,14.3, 41.3,13, 42.4,11.2, 44,10, 44.4,8.8, 43.7,7.4, 43.2,5.8, 43.5,3.9, 42.5,3.1, 41.6,2.4, 40.5,0.6, 38.8,0, 37.6,-0.8, 36.7,-2.2, 36.7,-4.4],
  // Scandinavie + Finlande
  [55.4,13, 56.2,16, 58,16.7, 59.3,18.5, 60.7,17.3, 62.5,17.5, 64,20.8, 65.8,22.3, 65.5,25.3, 64,23.5, 62.5,21.2, 60.3,22.3, 60.4,26.5, 60.5,29.5, 65,30, 69.5,30, 70.9,26, 71,23, 70,19, 68.5,15, 66,12.5, 63.5,9.5, 62,5, 60,5, 58.5,6, 58,8, 59,10.5, 57.7,11.8, 56,12.7],
  // Grande-Bretagne
  [50.1,-5.6, 50.8,-1, 51.4,1.4, 52.9,1.6, 53.6,0.1, 55,-1.4, 56,-2.6, 57.7,-1.9, 58.6,-3, 58.5,-5, 57,-5.8, 55.8,-5, 54.8,-3.4, 53.4,-3, 52.5,-4.1, 51.6,-5, 51.4,-3.2],
  // Irlande
  [51.5,-9.8, 52.3,-6.4, 54,-6, 55.2,-6.8, 54.5,-8.5, 53.4,-10, 52.1,-10.3],
  // Anatolie
  [36.2,28, 36.6,30.5, 36.8,36, 37,40, 38,44.5, 39.5,44, 41,43.4, 41.5,41.5, 41.1,37, 42,35, 41.9,33.5, 41.2,29.2, 40.4,27, 39.5,26.2, 38.4,26.5, 37,27.3],
  // Péninsule arabique + Levant
  [31,32, 31.5,34.5, 33,35.2, 36,35.8, 37,40, 33.5,44.5, 31,47.5, 30,48.5, 29.3,48, 26.5,50, 24.2,51.6, 24.2,54, 26.5,56.4, 24.5,57, 22.5,59.8, 18,56, 16.5,52.5, 14.5,49, 12.8,45, 12.7,43.5, 16.5,42.8, 20.5,39.5, 24,37.5, 28,34.6, 29.5,34.9],
  // Islande, Sardaigne, Corse, Sicile, Crète
  [63.4,-22.5, 64.2,-14, 65.6,-13.6, 66.4,-16.5, 66,-22.8, 64.8,-24],
  [41.2,9.2, 39,9.6, 39,8.4, 40.9,8.2], [43,9.4, 41.4,9.2, 42.3,8.6], [38.2,12.5, 38.3,15.6, 36.7,15.1, 37.6,12.4], [35.6,23.6, 35.3,26.3, 35,24.5],
];

// prettier-ignore
const CITIES: [number, number, number][] = [
  [48.86,2.35,9],[51.5,-0.12,8],[40.42,-3.7,6],[41.39,2.17,5],[38.72,-9.14,4],[41.9,12.5,5],[45.46,9.19,6],[52.52,13.4,6],[53.55,10,4],
  [52.37,4.9,5],[50.85,4.35,5],[48.14,11.58,4],[48.21,16.37,4],[50.08,14.44,4],[52.23,21.01,5],[47.5,19.04,4],[44.43,26.1,4],[37.98,23.73,4],
  [41.01,28.98,7],[55.75,37.62,8],[59.33,18.07,3],[59.91,10.75,3],[55.68,12.57,3],[53.35,-6.26,3],[43.3,5.37,4],[43.6,1.44,3],[44.84,-0.58,3],
  [47.22,-1.55,3],[50.63,3.06,4],[48.58,7.75,3],[47.37,8.54,3],[46.2,6.14,3],[30.04,31.24,8],[36.75,3.06,4],[36.8,10.18,3],[33.57,-7.59,4],
  [6.52,3.38,7],[24.71,46.68,5],[35.69,51.39,6],[50.45,30.52,5],[53.9,27.56,3],[59.94,30.31,6],[40.85,14.27,4],[39.47,-0.38,3],[37.39,-5.98,3],
  [41.15,-8.61,3],[53.48,-2.24,4],[52.49,-1.89,4],[55.86,-4.25,3],[50.11,8.68,4],[50.94,6.96,4],[48.78,9.18,3],[51.23,6.78,4],[51.45,7.01,5],
  [45.07,7.69,3],[44.49,11.34,3],[43.77,11.25,3],[45.44,12.33,2],[38.12,13.36,3],[42.7,23.32,3],[44.79,20.45,3],[45.81,15.98,3],[46.05,14.5,2],
  [31.95,35.93,3],[33.89,35.5,3],[32.08,34.78,4],[25.2,55.27,5],[29.37,47.98,4],[33.31,44.36,5],[36.19,44.01,3],[39.93,32.86,5],[38.42,27.14,4],
  [5.6,-0.19,4],[9.06,7.49,4],[12,8.52,3],[14.69,-17.44,3],[-1.29,36.82,4],[9.02,38.75,4],[15.5,32.56,3],[-26.2,28.04,6],[-33.92,18.42,4],
  [-29.86,31.02,3],[-4.32,15.31,5],[-8.84,13.23,3],[36.73,-4.42,3],[47.05,21.93,2],[46.77,23.6,2],[49.84,24.03,3],[48.46,35.05,3],[47.1,37.55,3],
  [43.7,7.27,3],[45.19,5.72,2],[45.75,4.83,0],
];

interface Light {
  x: number;
  y: number;
  a: number;
  s: number;
  w: boolean;
}
const LIGHTS: Light[] = [];
{
  const r = rng(2026);
  const add = (lat: number, lon: number, a: number, s: number) => {
    const [x, y, c] = proj(lat, lon);
    if (c > 0.05) LIGHTS.push({ x, y, a: a * Math.min(1, c * 2.5), s, w: r() < 0.12 });
  };
  for (const [lat, lon, w] of CITIES) {
    if (w === 0) continue; // Lyon : dessiné par le niveau suivant
    const n = Math.round(w * 16);
    for (let i = 0; i < n; i++) {
      const sig = 0.18 * Math.sqrt(w) * Math.abs(gauss(r)) + 0.02;
      const ang = r() * Math.PI * 2;
      add(lat + Math.sin(ang) * sig * 0.7, lon + Math.cos(ang) * sig, 0.35 + r() * 0.65, 1 + r() * (w > 5 ? 1.3 : 0.6));
    }
  }
  // Vallée du Nil
  for (let i = 0; i < 90; i++) {
    const u = r();
    add(31 - u * 7 + gauss(r) * 0.15, 31.2 + u * 1.6 + gauss(r) * 0.12, 0.3 + r() * 0.5, 1);
  }
  // Semis rural (dans les terres d'Europe)
  const eu = LANDS[1];
  const inside = (lat: number, lon: number, poly: number[]) => {
    let ins = false;
    for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
      const yi = poly[i], xi = poly[i + 1], yj = poly[j], xj = poly[j + 1];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };
  for (let i = 0; i < 2600; i++) {
    const lat = 36 + r() * 24;
    const lon = -9 + r() * 42;
    if (inside(lat, lon, eu) || inside(lat, lon, LANDS[3])) add(lat, lon, 0.12 + r() * 0.3, 0.8);
  }
}

const LIGHTS_WARM = new Dots(LIGHTS.filter((l) => !l.w));
const LIGHTS_WHITE = new Dots(LIGHTS.filter((l) => l.w));

const [LYON_X, LYON_Y] = proj(45.76, 4.83);
const S = 0.032;

const STARS = (() => {
  const r = rng(21);
  return Array.from({ length: 260 }, () => ({ x: (r() * 2 - 1) * 3, y: (r() * 2 - 1) * 3, a: 0.15 + r() * 0.6 }));
})();

export const terre: Level = {
  key: 'terre',
  portal: { x: LYON_X, y: LYON_Y, s: S },
  opaqueNested: false,
  clip(ctx) {
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
  },
  draw(d) {
    const { ctx, time, px } = d;

    if (d.bg) {
      fillView(ctx, d.view, '#02030a');
      d.layer(0.4, () => {
        ctx.fillStyle = '#fff';
        for (const s of STARS) {
          ctx.globalAlpha = s.a;
          const z = 1.1 / px;
          ctx.fillRect(s.x, s.y, z, z);
        }
        ctx.globalAlpha = 1;
      });
    }

    d.layer(1, () => {
      // Atmosphère
      glow(ctx, CX, CY, R * 1.35, C.blue, 0.22);
      // Océan
      const g = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.35, R * 0.1, CX, CY, R);
      g.addColorStop(0, '#0c1834');
      g.addColorStop(1, '#040814');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.clip();

      // Terres
      ctx.fillStyle = '#131c30';
      ctx.strokeStyle = 'rgba(120,150,220,0.18)';
      ctx.lineWidth = 1 / px;
      for (const poly of LANDS) {
        ctx.beginPath();
        for (let i = 0; i < poly.length; i += 2) {
          const [x, y] = proj(poly[i], poly[i + 1]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Lumières des villes
      LIGHTS_WARM.draw(ctx, '#ffc46b', px, { sizePx: 1.1, view: d.view });
      LIGHTS_WHITE.draw(ctx, '#fff4dc', px, { sizePx: 1.1, view: d.view });

      // Aurore boréale : des rideaux verts au-dessus de la Scandinavie
      if (d.visible(0.01, 2)) {
        for (let lon = -8; lon <= 42; lon += 0.7) {
          const lat = 66.5 + Math.sin(lon * 0.18 + time * 0.4) * 1.6;
          const [x0, y0, c0] = proj(lat, lon);
          if (c0 <= 0) continue;
          const hgt = 0.035 + 0.025 * Math.sin(lon * 0.5 + time * 1.3);
          const ag = ctx.createLinearGradient(x0, y0, x0, y0 - hgt);
          const a = 0.22 * (0.6 + 0.4 * Math.sin(lon + time * 2));
          ag.addColorStop(0, `rgba(90,255,180,${a})`);
          ag.addColorStop(1, 'rgba(120,120,255,0)');
          ctx.fillStyle = ag;
          ctx.fillRect(x0 - 0.004, y0 - hgt, 0.008, hgt);
        }
      }

      // Terminateur : l'aube arrive par la droite
      const tg = ctx.createLinearGradient(CX + R * 0.55, 0, CX + R, 0);
      tg.addColorStop(0, 'rgba(120,170,255,0)');
      tg.addColorStop(1, 'rgba(140,190,255,0.35)');
      ctx.fillStyle = tg;
      ctx.fillRect(CX + R * 0.5, CY - R, R, R * 2);

      // Ombre de bord (relief de la sphère)
      const sh = ctx.createRadialGradient(CX, CY, R * 0.7, CX, CY, R);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(1, 'rgba(0,0,10,0.55)');
      ctx.fillStyle = sh;
      ctx.fillRect(CX - R, CY - R, R * 2, R * 2);
      ctx.restore();

      // Liseré d'atmosphère
      ctx.lineWidth = 2 / px;
      ctx.strokeStyle = rgba(C.blueSoft, 0.18);
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.stroke();
      const rim = ctx.createLinearGradient(CX - R, CY, CX + R, CY);
      rim.addColorStop(0, rgba(C.blueSoft, 0));
      rim.addColorStop(1, rgba(C.blueSoft, 0.8));
      ctx.strokeStyle = rim;
      ctx.beginPath();
      ctx.arc(CX, CY, R, -1.6, 1.6);
      ctx.stroke();

      // Lyon
      glow(ctx, LYON_X, LYON_Y, 0.035, '#ffcf80', 0.6);
      d.portal();

      if (d.depth === 0 && d.visible(0.02, 8)) {
        const a = Math.max(0, 1 - d.p * 3.5);
        ctx.globalAlpha = a;
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.2 / px;
        ctx.beginPath();
        ctx.arc(LYON_X, LYON_Y, 0.03 + 0.003 * Math.sin(time * 3), 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(LYON_X - 0.022, LYON_Y - 0.022);
        ctx.lineTo(LYON_X - 0.12, LYON_Y - 0.12);
        ctx.lineTo(LYON_X - 0.34, LYON_Y - 0.12);
        ctx.stroke();
        text(ctx, 'Lyon', LYON_X - 0.34, LYON_Y - 0.135, 0.05, '#ffffff', { weight: 600 });
        text(ctx, '45.76°N  4.83°E', LYON_X - 0.34, LYON_Y - 0.085, 0.024, '#b9c7ff', { font: FONT.mono });
        ctx.globalAlpha = 1;
      }
      // L'étiquette « Lyon » ouvre le cap 2027
      d.hot('cap', { kind: 'rect', x: LYON_X - 0.36, y: LYON_Y - 0.2, w: 0.3, h: 0.13 });
    });

    // Premier plan : un satellite passe
    if (d.bg)
      d.layer(1.35, () => {
        const u = ((time * 0.03 + 0.3) % 1.3) - 0.15;
        const x = 1.9 - u * 3.8;
        const y = -0.95 + u * 0.35;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.3);
        ctx.fillStyle = '#9aa3b8';
        ctx.fillRect(-0.012, -0.008, 0.024, 0.016);
        ctx.fillStyle = '#2b4c9b';
        ctx.fillRect(-0.06, -0.006, 0.042, 0.012);
        ctx.fillRect(0.018, -0.006, 0.042, 0.012);
        ctx.restore();
        if (Math.sin(time * 6) > 0.6) glow(ctx, x, y, 0.012, C.red, 1);
      });
  },
};
