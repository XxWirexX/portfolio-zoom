/** Petits outils de dessin et de maths réutilisés par tous les niveaux. */

/** Générateur pseudo-aléatoire déterministe (mulberry32) : même graine → même décor. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Loi normale approximative (Box-Muller) à partir d'un rng. */
export function gauss(r: () => number): number {
  const u = Math.max(1e-9, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Palette commune : le fil rouge/bleu de wireredblue. */
export const C = {
  red: '#ff3b5c',
  redSoft: '#ff6b81',
  blue: '#3b8bff',
  blueSoft: '#6aa8ff',
  cyan: '#4fe3ff',
  warm: '#ffb15c',
  ink: '#0a0c14',
  white: '#f2f4ff',
};

/** Couleur hex + opacité → rgba(). */
export function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Halo lumineux circulaire (dégradé radial). */
export function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 1,
): void {
  if (r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.35, rgba(color, alpha * 0.35));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Chemin de rectangle arrondi (sans remplir). */
export function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const k = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

export function fillRR(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | CanvasGradient,
): void {
  ctx.beginPath();
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export const FONT = {
  sans: '"Space Grotesk", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

/** Facteur de grossissement des polices (voir `text`). */
const TK = 1000;
/** Police demandée → police telle que le canvas la relit (pour éviter de la reparser). */
const fontCache = new Map<string, string>();

/**
 * Texte en coordonnées du niveau. Les navigateurs gèrent mal les polices de
 * 0,03 px : on agrandit la police ×1000 et on réduit le repère d'autant.
 * Pas de save/restore ici : c'est appelé des centaines de fois par image, et
 * redéfinir `ctx.font` à chaque fois coûte cher.
 */
export function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  size: number,
  color: string,
  opts: {
    font?: string;
    weight?: number;
    align?: CanvasTextAlign;
    base?: CanvasTextBaseline;
    alpha?: number;
    spacing?: number;
    maxW?: number;
  } = {},
): void {
  const m = ctx.getTransform();
  ctx.translate(x, y);
  ctx.scale(1 / TK, 1 / TK);
  setFont(ctx, `${opts.weight ?? 500} ${Math.round(size * TK * 10) / 10}px ${opts.font ?? FONT.sans}`);
  ctx.fillStyle = color;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = opts.base ?? 'alphabetic';
  const prevAlpha = ctx.globalAlpha;
  if (opts.alpha !== undefined) ctx.globalAlpha = prevAlpha * opts.alpha;
  const ls = ctx as CanvasRenderingContext2D & { letterSpacing: string };
  if (opts.spacing) ls.letterSpacing = `${opts.spacing * TK}px`;
  ctx.fillText(str, 0, 0, opts.maxW ? opts.maxW * TK : undefined);
  if (opts.spacing) ls.letterSpacing = '0px';
  ctx.globalAlpha = prevAlpha;
  ctx.setTransform(m);
}

function setFont(ctx: CanvasRenderingContext2D, f: string) {
  const known = fontCache.get(f);
  if (known !== undefined && ctx.font === known) return;
  ctx.font = f;
  fontCache.set(f, ctx.font);
}

/** Largeur d'un texte, en unités du niveau. */
export function textWidth(
  ctx: CanvasRenderingContext2D,
  str: string,
  size: number,
  font = FONT.sans,
  weight = 500,
): number {
  setFont(ctx, `${weight} ${Math.round(size * TK * 10) / 10}px ${font}`);
  return ctx.measureText(str).width / TK;
}

/** Remplit tout le rectangle visible (fond « infini »). */
export function fillView(
  ctx: CanvasRenderingContext2D,
  v: { x0: number; y0: number; x1: number; y1: number },
  fill: string | CanvasGradient,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0);
}

/**
 * Nuage de points dessiné par lots : au lieu de milliers de fillRect avec
 * chacun son opacité, on regroupe les points par niveau d'opacité et on
 * remplit un seul chemin par groupe (bien plus rapide).
 */
export class Dots {
  private bins: { a: number; pts: Float32Array }[] = [];

  constructor(points: { x: number; y: number; a: number; s?: number }[], levels = 5) {
    const groups: number[][] = Array.from({ length: levels }, () => []);
    for (const p of points) {
      const k = Math.min(levels - 1, Math.floor(clamp(p.a) * levels));
      groups[k].push(p.x, p.y, p.s ?? 1);
    }
    this.bins = groups.map((g, k) => ({ a: (k + 0.5) / levels, pts: new Float32Array(g) }));
  }

  /**
   * @param px      pixels par unité (pour garder une taille constante à l'écran)
   * @param sizePx  taille de base d'un point, en pixels
   * @param time    si fourni, chaque groupe scintille légèrement
   */
  draw(
    ctx: CanvasRenderingContext2D,
    color: string,
    px: number,
    opts: { sizePx?: number; alpha?: number; time?: number; view?: { x0: number; y0: number; x1: number; y1: number } } = {},
  ): void {
    const base = (opts.sizePx ?? 1.2) / px;
    const v = opts.view;
    ctx.fillStyle = color;
    this.bins.forEach((b, k) => {
      let a = b.a * (opts.alpha ?? 1);
      if (opts.time !== undefined) a *= 0.78 + 0.22 * Math.sin(opts.time * (1.1 + k * 0.37) + k * 1.9);
      if (a <= 0.004) return;
      ctx.globalAlpha = a;
      ctx.beginPath();
      const p = b.pts;
      for (let i = 0; i < p.length; i += 3) {
        const x = p[i];
        const y = p[i + 1];
        if (v && (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1)) continue;
        const z = base * p[i + 2];
        ctx.rect(x - z / 2, y - z / 2, z, z);
      }
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}

/** Le rectangle (x, y, w, h) touche-t-il la zone visible ? */
export function inView(v: { x0: number; y0: number; x1: number; y1: number }, x: number, y: number, w: number, h: number): boolean {
  return x + w >= v.x0 && x <= v.x1 && y + h >= v.y0 && y <= v.y1;
}
