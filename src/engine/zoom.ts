/**
 * Le cœur du zoom infini.
 *
 * Idée : chaque niveau contient un « portail » où le niveau suivant est
 * dessiné en tout petit (échelle s). Zoomer d'un niveau = passer de la vue du
 * niveau n (demi-hauteur 1) à la vue de son portail (demi-hauteur s).
 *
 * La caméra est un seul nombre réel `t` :
 *   n = floor(t) → niveau de base, p = t - n → progression dans ce niveau.
 *
 * Zoom exponentiel autour d'un point fixe F :
 *   la similitude qui envoie le niveau n sur son portail est z ↦ c + s·z.
 *   Son point fixe vérifie F = c + s·F, donc F = c / (1 - s).
 *   Avec h = s^p, un point écran z_vue correspond au point z = F + h·(z_vue - F)
 *   du niveau. À p = 0 on voit le niveau entier, à p = 1 exactement le portail,
 *   et la vitesse apparente du zoom est constante (c'est ce qui rend fluide).
 *
 * Quand le portail remplit presque l'écran (p > 0,72), on dessine le niveau
 * suivant en entier sur un canvas posé au-dessus et on monte son opacité :
 * à p = 1 l'image est identique au niveau suivant vu à p = 0, et on peut
 * changer de niveau de base sans saut.
 */
import type { Draw, HotShape, Level, Rect, Vec } from './types';
import { smooth } from './util';

const MAX_DEPTH = 4;
/** En dessous de cette taille (pixels pour le carré du niveau), on ne dessine pas. */
const MIN_PORTAL_PX = 4;

interface Hot {
  id: string;
  shape: HotShape;
  m: DOMMatrix;
}

export class ZoomRenderer {
  hover: string | null = null;
  private hots: Hot[] = [];

  constructor(public levels: Level[]) {}

  get count(): number {
    return this.levels.length;
  }

  mod(i: number): number {
    const n = this.levels.length;
    return ((i % n) + n) % n;
  }

  /**
   * Dessine une image complète pour la caméra `t`.
   * `over` est un second canvas posé au-dessus (même taille) : on y dessine le
   * niveau suivant pendant le fondu, et c'est le navigateur qui le mélange via
   * l'opacité CSS (bien moins cher qu'un drawImage plein écran).
   * Renvoie l'opacité à donner à ce canvas (0 = le masquer).
   */
  render(
    ctx: CanvasRenderingContext2D,
    over: CanvasRenderingContext2D,
    W: number,
    H: number,
    t: number,
    time: number,
  ): number {
    this.hots = [];
    const n = Math.floor(t);
    const p = t - n;
    const idx = this.mod(n);
    const L = this.levels[idx];
    const { x, y, s } = outerPortal(L);
    const h = Math.pow(s, p);
    const F: Vec = { x: x / (1 - s), y: y / (1 - s) };
    // 1 unité = demi-hauteur de l'écran, sauf en portrait où on garde au moins
    // ±1,3 unité de large (sinon les niveaux larges sont trop rognés).
    const unit = Math.min(H / 2, W / 2 / 1.3);
    const vw = W / 2 / unit;
    const vh = H / 2 / unit;

    const base = (c: CanvasRenderingContext2D) => {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.translate(W / 2, H / 2);
      c.scale(unit, unit);
      c.translate(F.x, F.y);
      c.scale(1 / h, 1 / h);
      c.translate(-F.x, -F.y);
    };

    const view: Rect = {
      x0: F.x + h * (-vw - F.x),
      x1: F.x + h * (vw - F.x),
      y0: F.y + h * (-vh - F.y),
      y1: F.y + h * (vh - F.y),
    };

    base(ctx);
    ctx.globalAlpha = 1;
    this.drawLevel(ctx, idx, 0, p, h, F, view, unit / h, true, time);

    // Fondu de sortie : le niveau suivant, entier, sur le canvas du dessus.
    const a = smooth(0.72, 1, p);
    if (a > 0.002) {
      base(over);
      over.globalAlpha = 1;
      over.translate(x, y);
      over.scale(s, s);
      this.drawLevel(over, this.mod(idx + 1), 1, 0, 1, { x: 0, y: 0 }, sub(view, x, y, s), (unit / h) * s, true, time, p >= 0.6);
      this.drawHotMarkers(over, time);
      return a;
    }
    this.drawHotMarkers(ctx, time);
    return 0;
  }

  private drawLevel(
    ctx: CanvasRenderingContext2D,
    idx: number,
    depth: number,
    p: number,
    h: number,
    F: Vec,
    view: Rect,
    px: number,
    bg: boolean,
    time: number,
    hotOverride?: boolean,
  ): void {
    const L = this.levels[idx];
    // Les zones cliquables actives sont celles du niveau « le plus posé ».
    const hotActive = hotOverride ?? (depth === 0 && p < 0.6);
    const self = this;
    // Échelle propre au niveau : on passe dans son repère de dessin.
    const K = L.scale ?? 1;
    if (K !== 1) {
      view = { x0: view.x0 / K, x1: view.x1 / K, y0: view.y0 / K, y1: view.y1 / K };
      px *= K;
      F = { x: F.x / K, y: F.y / K };
    }

    const d: Draw = {
      ctx,
      time,
      depth,
      p,
      bg,
      view,
      px,
      layer(dep, fn) {
        if (depth > 0 || dep === 1 || h === 1) {
          fn(view);
          return;
        }
        const k = Math.pow(h, 1 - dep);
        ctx.save();
        ctx.translate(F.x, F.y);
        ctx.scale(k, k);
        ctx.translate(-F.x, -F.y);
        fn({
          x0: F.x + (view.x0 - F.x) / k,
          x1: F.x + (view.x1 - F.x) / k,
          y0: F.y + (view.y0 - F.y) / k,
          y1: F.y + (view.y1 - F.y) / k,
        });
        ctx.restore();
      },
      portal() {
        const { x, y, s } = L.portal;
        const cpx = px * s;
        if (depth >= MAX_DEPTH || cpx * 2 < MIN_PORTAL_PX) return false;
        // Hors champ ? (marge large : le niveau suivant déborde de son carré)
        if (x + 2.5 * s < view.x0 || x - 2.5 * s > view.x1 || y + 2.5 * s < view.y0 || y - 2.5 * s > view.y1) {
          return false;
        }
        const nextIdx = self.mod(idx + 1);
        const next = self.levels[nextIdx];
        ctx.save();
        if (L.clip) {
          ctx.beginPath();
          L.clip(ctx);
          ctx.clip();
        }
        ctx.translate(x, y);
        ctx.scale(s, s);
        self.drawLevel(
          ctx,
          nextIdx,
          depth + 1,
          0,
          1,
          { x: 0, y: 0 },
          sub(view, x, y, s),
          cpx,
          next.opaqueNested !== false,
          time,
          depth === 0 && p >= 0.6,
        );
        ctx.restore();
        return true;
      },
      hot(id, shape) {
        if (hotActive) self.hots.push({ id, shape, m: ctx.getTransform() });
      },
      isHover(id) {
        return hotActive && self.hover === id;
      },
      visible(size, minPx = 1) {
        return size * px >= minPx;
      },
    };

    ctx.save();
    if (K !== 1) ctx.scale(K, K);
    L.draw(d);
    ctx.restore();
  }

  /** Quelle zone cliquable se trouve sous ce point (pixels du canvas) ? */
  hitTest(px: number, py: number): string | null {
    for (let i = this.hots.length - 1; i >= 0; i--) {
      const hs = this.hots[i];
      const q = hs.m.inverse().transformPoint(new DOMPoint(px, py));
      const sh = hs.shape;
      if (sh.kind === 'rect') {
        if (q.x >= sh.x && q.x <= sh.x + sh.w && q.y >= sh.y && q.y <= sh.y + sh.h) return hs.id;
      } else if ((q.x - sh.x) ** 2 + (q.y - sh.y) ** 2 <= sh.r ** 2) {
        return hs.id;
      }
    }
    return null;
  }

  /** Petits repères pulsants qui signalent ce qui est cliquable. */
  private drawHotMarkers(ctx: CanvasRenderingContext2D, time: number): void {
    const seen = new Set<string>();
    for (const hs of this.hots) {
      if (seen.has(hs.id)) continue;
      seen.add(hs.id);
      const m = hs.m;
      const sc = Math.hypot(m.a, m.b);
      const sh = hs.shape;
      const sizePx = (sh.kind === 'rect' ? Math.max(sh.w, sh.h) : sh.r * 2) * sc;
      if (sizePx < 14) continue;
      const hovered = this.hover === hs.id;

      ctx.save();
      if (hovered) {
        ctx.setTransform(m);
        ctx.beginPath();
        const pad = 6 / sc;
        if (sh.kind === 'rect') {
          const r = Math.min(sh.w, sh.h) * 0.12 + pad;
          roundPath(ctx, sh.x - pad, sh.y - pad, sh.w + pad * 2, sh.h + pad * 2, r);
        } else {
          ctx.arc(sh.x, sh.y, sh.r + pad, 0, Math.PI * 2);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.lineWidth = 2 * devicePixelRatioClamp();
        ctx.setLineDash([8 * devicePixelRatioClamp(), 6 * devicePixelRatioClamp()]);
        ctx.lineDashOffset = -time * 30;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.stroke();
      } else {
        // point pulsant au coin haut-droit de la zone
        const corner =
          sh.kind === 'rect' ? new DOMPoint(sh.x + sh.w, sh.y) : new DOMPoint(sh.x + sh.r * 0.72, sh.y - sh.r * 0.72);
        const c = m.transformPoint(corner);
        const k = devicePixelRatioClamp();
        const ph = (time * 1.4 + hashId(hs.id)) % 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
        ctx.arc(c.x, c.y, (4 + ph * 10) * k, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - ph)})`;
        ctx.lineWidth = 1.5 * k;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3.2 * k, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

/** Portail exprimé dans le repère extérieur du niveau (échelle comprise). */
function outerPortal(L: Level): { x: number; y: number; s: number } {
  const K = L.scale ?? 1;
  return { x: L.portal.x * K, y: L.portal.y * K, s: L.portal.s * K };
}

function sub(v: Rect, x: number, y: number, s: number): Rect {
  return { x0: (v.x0 - x) / s, x1: (v.x1 - x) / s, y0: (v.y0 - y) / s, y1: (v.y1 - y) / s };
}

function roundPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function hashId(id: string): number {
  let hsh = 0;
  for (let i = 0; i < id.length; i++) hsh = (hsh * 31 + id.charCodeAt(i)) % 997;
  return hsh / 997;
}

export function devicePixelRatioClamp(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}
