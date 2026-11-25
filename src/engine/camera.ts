/**
 * La caméra : un seul nombre `t` (1 unité = 1 niveau) qui suit une cible
 * `target` avec un amorti exponentiel. Les entrées (molette, doigt, clavier)
 * ne font que déplacer la cible ; après un moment sans action, la cible se
 * cale sur le niveau entier le plus proche pour que chaque étage soit bien cadré.
 */
export class Camera {
  t: number;
  target: number;
  /** Vitesse de rattrapage (plus grand = plus nerveux). */
  stiffness = 4.2;
  private lastInput = 0;
  private snapDelay = 650;
  private auto: { to: number } | null = null;
  /**
   * Pas de retour avant l'espace : la boucle n'existe que vers l'avant, pour ne
   * pas « spoiler » la fin et ne pas donner l'impression de partir à l'envers.
   */
  min = 0;
  /** Appelé quand on essaie de reculer avant le début. */
  onBlocked?: () => void;

  constructor(start = 0) {
    this.t = start;
    this.target = start;
  }

  /** Décalage relatif de la cible (molette, glisser…). */
  nudge(dt: number): void {
    this.auto = null;
    this.target += dt;
    if (this.target < this.min) {
      if (dt < 0 && this.target - dt <= this.min + 0.02) this.onBlocked?.();
      this.target = this.min;
    }
    // On évite de « sauter » trois niveaux d'un coup de molette.
    const max = 1.6;
    this.target = Math.min(this.t + max, Math.max(this.t - max, this.target));
    this.lastInput = performance.now();
  }

  /** Aller au niveau entier `to` (navigation, clavier). */
  goTo(to: number): void {
    if (to < this.min) {
      this.onBlocked?.();
      to = this.min;
    }
    this.auto = { to };
    this.target = to;
    this.lastInput = performance.now();
  }

  step(dt: number, reduced: boolean): void {
    const now = performance.now();
    if (!this.auto && now - this.lastInput > this.snapDelay) {
      this.target = Math.round(this.target);
    }
    // Navigation longue (plusieurs niveaux) : vitesse plafonnée pour profiter du voyage.
    const k = reduced ? 9 : this.stiffness;
    let delta = (this.target - this.t) * (1 - Math.exp(-dt * k));
    const vmax = (reduced ? 6 : 2.2) * dt;
    if (this.auto) delta = Math.max(-vmax, Math.min(vmax, delta));
    this.t += delta;
    if (Math.abs(this.target - this.t) < 1e-4) {
      this.t = this.target;
      this.auto = null;
    }
  }

  get moving(): boolean {
    return Math.abs(this.target - this.t) > 0.002;
  }
}

export interface InputHandlers {
  onHover(x: number, y: number): void;
  onClick(x: number, y: number): void;
  onLeave(): void;
  onFirstInput(): void;
}

/**
 * Branche molette, tactile (glisser + pincer), clavier et souris sur la caméra.
 * Les coordonnées renvoyées aux handlers sont en pixels CSS.
 */
export function bindInput(el: HTMLElement, cam: Camera, h: InputHandlers, levelCount: () => number): void {
  let first = true;
  const firstInput = () => {
    if (first) {
      first = false;
      h.onFirstInput();
    }
  };

  el.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      firstInput();
      const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1;
      const dy = Math.max(-240, Math.min(240, e.deltaY * unit));
      // Molette vers le haut = zoomer (comme sur une carte), à l'inverse d'une page.
      cam.nudge(-dy * 0.0019);
    },
    { passive: false },
  );

  // Pointeurs : un doigt/souris = glisser verticalement ; deux doigts = pincer.
  const pts = new Map<number, { x: number; y: number }>();
  let downAt: { x: number; y: number; time: number } | null = null;
  let dragged = false;
  let pinchDist = 0;

  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      downAt = { x: e.clientX, y: e.clientY, time: performance.now() };
      dragged = false;
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      dragged = true;
    }
  });

  el.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) {
      if (e.pointerType === 'mouse') h.onHover(e.clientX, e.clientY);
      return;
    }
    const prev = pts.get(e.pointerId)!;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) cam.nudge(Math.log(dist / pinchDist) * 0.9);
      pinchDist = dist;
      firstInput();
      return;
    }
    if (downAt && !dragged && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) dragged = true;
    if (dragged) {
      firstInput();
      // Même sens que la molette : tirer vers le bas = plonger.
      cam.nudge((e.clientY - prev.y) * 0.0042);
    }
  });

  const end = (e: PointerEvent) => {
    const wasClick = downAt && !dragged && pts.size === 1;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinchDist = 0;
    if (wasClick && e.type === 'pointerup') h.onClick(e.clientX, e.clientY);
    if (pts.size === 0) downAt = null;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') h.onLeave();
  });

  window.addEventListener('keydown', (e) => {
    const tgt = e.target as HTMLElement;
    if (tgt && (tgt.closest('dialog[open]') || tgt.isContentEditable)) return;
    const next = ['ArrowUp', 'PageUp', ' ', 'ArrowRight'];
    const prev = ['ArrowDown', 'PageDown', 'ArrowLeft'];
    if (next.includes(e.key)) {
      e.preventDefault();
      firstInput();
      cam.goTo(Math.floor(cam.target + 0.5) + 1);
    } else if (prev.includes(e.key)) {
      e.preventDefault();
      firstInput();
      cam.goTo(Math.ceil(cam.target - 0.5) - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const n = levelCount();
      cam.goTo(Math.floor(cam.target / n) * n);
    }
  });
}
