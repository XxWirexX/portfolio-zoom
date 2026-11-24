/**
 * 06 · Le bureau Hyprland : île Quickshell en haut, terminal (fastfetch),
 * éditeur de code, gestionnaire de fichiers. L'aperçu du dossier ~/projets
 * est le portail.
 */
import type { Level } from '../engine/types';
import { C, fillRR, glow, inView, rgba, rng, text, FONT } from '../engine/util';

const S = 0.2;
const PX = 1.11;
const PY = 0.47;
const PW = 1.6 * S;
const PH = 0.9 * S;

const MONO = FONT.mono;

function windowFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  active: boolean,
  px: number,
) {
  // ombre
  fillRR(ctx, x + 0.01, y + 0.015, w, h, 0.022, 'rgba(0,0,0,0.35)');
  fillRR(ctx, x, y, w, h, 0.022, 'rgba(13,15,26,0.94)');
  ctx.beginPath();
  const k = Math.min(0.022, w / 2, h / 2);
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
  if (active) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, C.red);
    g.addColorStop(1, C.blue);
    ctx.strokeStyle = g;
    ctx.lineWidth = Math.max(0.004, 1.5 / px);
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = Math.max(0.003, 1 / px);
  }
  ctx.stroke();
  text(ctx, title, x + 0.03, y + 0.042, 0.022, 'rgba(220,226,255,0.6)', { font: MONO });
}

// ---- fastfetch ----
const FETCH: [string, string][] = [
  ['OS', 'NixOS'],
  ['WM', 'Hyprland'],
  ['Shell', 'Impasto (Quickshell)'],
  ['Langs', 'C# · TypeScript · Java'],
  ['Front', 'Angular · Next.js'],
  ['Back', '.NET · Spring · Prisma'],
  ['Infra', 'Docker · Traefik · CI'],
  ['Jeux', 'Godot'],
];

function snowflake(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number) {
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((i * Math.PI) / 3 + time * 0.05);
    ctx.strokeStyle = i % 2 ? C.blue : C.red;
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.25, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(r * 0.62, 0);
    ctx.lineTo(r * 0.86, -r * 0.24);
    ctx.stroke();
    ctx.restore();
  }
}

// ---- éditeur ----
const CODE = [
  'namespace MonApp.ViewModels;',
  '',
  'public partial class TableauDeBordViewModel : ObservableObject',
  '{',
  '    private readonly IDonneesService _service;',
  '',
  '    [ObservableProperty]',
  '    private ObservableCollection<Element> _elements = new();',
  '',
  '    [RelayCommand]',
  '    private async Task ChargerAsync()',
  '    {',
  '        var resultat = await _service.GetElementsAsync();',
  '        Elements = new(resultat);',
  '    }',
  '}',
];
const KW = new Set(['namespace', 'public', 'partial', 'class', 'private', 'readonly', 'async', 'var', 'await', 'new']);

function codeLine(ctx: CanvasRenderingContext2D, line: string, x: number, y: number, size: number) {
  const charW = size * 0.6;
  const tokens = line.match(/(\s+|\[[A-Za-z]+\]|[A-Za-z_][A-Za-z0-9_]*|.)/g) ?? [];
  let cx = x;
  for (const tk of tokens) {
    let col = '#c8cde8';
    if (KW.has(tk)) col = '#ff7a93';
    else if (tk.startsWith('[')) col = '#ffcb6b';
    else if (/^[A-Z]/.test(tk)) col = '#7fb2ff';
    else if (/^_/.test(tk)) col = '#c3a6ff';
    else if (/[;{}()<>=.,]/.test(tk)) col = '#7d84a8';
    if (tk.trim()) text(ctx, tk, cx, y, size, col, { font: MONO, weight: 400 });
    cx += tk.length * charW;
  }
}

const FOLDERS = ['dle-community', 'intrasso', 'kyara-bot', 'impasto', 'vps-infra', 'portfolio-zoom'];
const BLOBS = (() => {
  const r = rng(61);
  return Array.from({ length: 5 }, (_, i) => ({ x: (r() * 2 - 1) * 1.6, y: (r() * 2 - 1) * 0.9, r: 0.5 + r() * 0.6, c: i % 2 ? C.blue : C.red }));
})();

export const bureau: Level = {
  key: 'bureau',
  portal: { x: PX, y: PY, s: S },
  clip(ctx) {
    ctx.rect(PX - PW, PY - PH, PW * 2, PH * 2);
  },
  draw(d) {
    const { ctx, time, px, view } = d;

    // Fond d'écran
    const g = ctx.createLinearGradient(-1.6, -0.9, 1.6, 0.9);
    g.addColorStop(0, '#0c0a1c');
    g.addColorStop(1, '#070b18');
    ctx.fillStyle = g;
    ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
    d.layer(0.85, () => {
      for (const b of BLOBS) glow(ctx, b.x, b.y, b.r, b.c, 0.22);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.004;
      for (let i = 1; i < 14; i++) {
        ctx.beginPath();
        ctx.arc(-1.3, 1.2, i * 0.16, -1.6, 0.2);
        ctx.stroke();
      }
    });

    d.layer(1, () => {
      // ---- Île (barre du haut) ----
      const islandHot = d.isHover('island');
      fillRR(ctx, -0.32, -0.885, 0.64, 0.075, 0.0375, islandHot ? '#1a1d33' : '#0e1020');
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1 / px;
      ctx.beginPath();
      ctx.arc(-0.2825, -0.8475, 0.0375, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.lineTo(0.2825, -0.885);
      ctx.arc(0.2825, -0.8475, 0.0375, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.stroke();
      let wx = -0.27;
      for (let i = 0; i < 5; i++) {
        const on = i === 1;
        const w = on ? 0.04 : 0.016;
        fillRR(ctx, wx, -0.855, w, 0.016, 0.008, on ? C.red : 'rgba(255,255,255,0.3)');
        wx += w + 0.012;
      }
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      text(ctx, `${hh}:${mm}`, 0, -0.836, 0.032, '#ffffff', { align: 'center', font: MONO, weight: 600 });
      // wifi + batterie
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.004;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(0.16, -0.835, i * 0.008, -2.4, -0.74);
        ctx.stroke();
      }
      ctx.strokeRect(0.2, -0.86, 0.045, 0.022);
      ctx.fillStyle = C.blue;
      ctx.fillRect(0.204, -0.856, 0.03, 0.014);
      d.hot('island', { kind: 'rect', x: -0.32, y: -0.885, w: 0.64, h: 0.075 });

      // ---- Terminal ----
      const tx = -1.56;
      const ty = -0.76;
      const tw = 1.06;
      const th = 1.62;
      windowFrame(ctx, tx, ty, tw, th, 'kitty — ~', true, px);
      if (d.visible(0.03, 3) && inView(view, tx, ty, tw, th)) {
        const lh = 0.046;
        let y = ty + 0.11;
        text(ctx, '❯', tx + 0.04, y, 0.028, C.red, { font: MONO, weight: 700 });
        text(ctx, 'fastfetch', tx + 0.08, y, 0.028, '#ffffff', { font: MONO });
        y += lh * 1.3;
        snowflake(ctx, tx + 0.2, y + 0.16, 0.13, time);
        const lx = tx + 0.42;
        text(ctx, 'kylian', lx, y, 0.028, C.red, { font: MONO, weight: 700 });
        text(ctx, '@', lx + 0.1, y, 0.028, '#ffffff', { font: MONO });
        text(ctx, 'nixos', lx + 0.12, y, 0.028, C.blue, { font: MONO, weight: 700 });
        y += lh * 0.7;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(lx, y - 0.006, 0.2, 0.003);
        y += lh * 0.6;
        for (const [k, v] of FETCH) {
          text(ctx, k, lx, y, 0.025, C.blueSoft, { font: MONO, weight: 600 });
          text(ctx, v, lx + 0.12, y, 0.025, '#d9ddf5', { font: MONO, weight: 400, maxW: tw - 0.58 });
          y += lh;
        }
        y += 0.01;
        const cols = ['#1b1d2b', C.red, '#3dd68c', '#ffcb6b', C.blue, '#c3a6ff', C.cyan, '#e6e8f5'];
        cols.forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(lx + i * 0.05, y - 0.03, 0.045, 0.035);
        });
        // Prompt qui tape en boucle
        y = ty + th - 0.07;
        const cmd = 'ssh wireredblue.xyz';
        const cyc = (time * 0.6) % 2.2;
        const n = Math.min(cmd.length, Math.floor(cyc * 14));
        text(ctx, '❯', tx + 0.04, y, 0.028, C.red, { font: MONO, weight: 700 });
        text(ctx, cmd.slice(0, n), tx + 0.08, y, 0.028, '#ffffff', { font: MONO });
        if (Math.sin(time * 6) > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(tx + 0.08 + n * 0.0168, y - 0.026, 0.014, 0.032);
        }
      }
      d.hot('stack', { kind: 'rect', x: tx, y: ty, w: tw, h: th });

      // ---- Éditeur ----
      const ex = -0.47;
      const ey = -0.76;
      const ew = 2.03;
      const eh = 0.78;
      windowFrame(ctx, ex, ey, ew, eh, 'nvim — TableauDeBordViewModel.cs', false, px);
      if (d.visible(0.02, 2.5) && inView(view, ex, ey, ew, eh)) {
        fillRR(ctx, ex + 0.02, ey + 0.065, 0.42, 0.04, 0.008, 'rgba(255,255,255,0.06)');
        text(ctx, 'TableauDeBordViewModel.cs', ex + 0.035, ey + 0.093, 0.02, '#ffffff', { font: MONO });
        CODE.forEach((line, i) => {
          const y = ey + 0.15 + i * 0.038;
          if (y > ey + eh - 0.02) return;
          text(ctx, String(i + 1).padStart(2, ' '), ex + 0.025, y, 0.022, 'rgba(200,205,232,0.3)', { font: MONO });
          codeLine(ctx, line, ex + 0.1, y, 0.022);
        });
        // curseur
        if (Math.sin(time * 5) > 0) {
          ctx.fillStyle = C.red;
          ctx.fillRect(ex + 0.1 + 26 * 0.0132, ey + 0.15 + 13 * 0.038 - 0.02, 0.012, 0.026);
        }
      }
      d.hot('editeur', { kind: 'rect', x: ex, y: ey, w: ew, h: eh });

      // ---- Gestionnaire de fichiers ----
      const fx = -0.47;
      const fy = 0.05;
      const fw = 2.03;
      const fh = 0.81;
      windowFrame(ctx, fx, fy, fw, fh, 'fichiers — ~/projets', false, px);
      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      ctx.fillRect(fx + 0.01, fy + 0.06, 0.3, fh - 0.07);
      const side = ['Accueil', 'Documents', 'Projets', 'Images', 'VPS'];
      side.forEach((s, i) => {
        const y = fy + 0.13 + i * 0.06;
        if (s === 'Projets') fillRR(ctx, fx + 0.02, y - 0.035, 0.28, 0.05, 0.01, rgba(C.red, 0.25));
        text(ctx, s, fx + 0.05, y, 0.024, s === 'Projets' ? '#ffffff' : 'rgba(220,226,255,0.6)', { font: MONO });
      });
      FOLDERS.forEach((f, i) => {
        const x = fx + 0.42 + (i % 3) * 0.3;
        const y = fy + 0.14 + Math.floor(i / 3) * 0.3;
        const col = f === 'vps-infra' ? C.blue : f === 'portfolio-zoom' ? C.red : '#8a93c4';
        fillRR(ctx, x - 0.08, y - 0.03, 0.08, 0.03, 0.008, rgba(col, 0.9));
        fillRR(ctx, x - 0.08, y - 0.015, 0.16, 0.12, 0.012, col);
        text(ctx, f, x, y + 0.16, 0.019, '#d9ddf5', { align: 'center', font: MONO, maxW: 0.28 });
      });
      // Volet d'aperçu = portail
      text(ctx, 'aperçu', PX - PW, PY - PH - 0.03, 0.022, 'rgba(220,226,255,0.6)', { font: MONO });
      ctx.fillStyle = '#0e1118';
      ctx.fillRect(PX - PW, PY - PH, PW * 2, PH * 2);
      d.portal();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1 / px;
      ctx.strokeRect(PX - PW, PY - PH, PW * 2, PH * 2);
      text(ctx, '~/projets · 9 éléments', PX - PW, PY + PH + 0.045, 0.02, 'rgba(220,226,255,0.5)', { font: MONO });
    });
  },
};
