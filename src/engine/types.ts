/**
 * Types partagés par le moteur et les niveaux.
 *
 * Convention de coordonnées (pour TOUS les niveaux) :
 *  - origine au centre, x vers la droite, y vers le BAS (comme le canvas) ;
 *  - le carré [-1, 1] × [-1, 1] est toujours visible quand on est « posé » sur
 *    le niveau. Sur un écran paysage on voit plus loin en x, sur un téléphone
 *    en portrait on voit plus loin en y : dessine donc les décors plus grands
 *    que ce carré (voir `d.view`).
 */

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Vec {
  x: number;
  y: number;
}

/** Zone cliquable, exprimée dans les coordonnées du niveau qui la déclare. */
export type HotShape =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'circle'; x: number; y: number; r: number };

/** Ce que le moteur donne à un niveau à chaque image. */
export interface Draw {
  ctx: CanvasRenderingContext2D;
  /** Temps écoulé en secondes (pour les animations). */
  time: number;
  /** 0 = niveau sur lequel on est, 1 = niveau dans le portail, etc. */
  depth: number;
  /** Progression du zoom dans ce niveau (0 → 1). Toujours 0 si depth > 0. */
  p: number;
  /** Doit-on peindre le fond ? (faux pour un niveau « transparent » imbriqué) */
  bg: boolean;
  /** Rectangle visible, en coordonnées du niveau (utile pour remplir le fond). */
  view: Rect;
  /** Nombre de pixels écran pour 1 unité du niveau (sert au niveau de détail). */
  px: number;
  /**
   * Dessine `fn` sur un calque de profondeur `depth` (parallaxe).
   *  - 1   : le plan du niveau (ne bouge pas par rapport au portail) ;
   *  - < 1 : arrière-plan, grossit moins vite ;
   *  - > 1 : premier plan, grossit plus vite et « passe » devant la caméra.
   * Au repos (p = 0) tous les calques sont alignés : la transition depuis le
   * niveau parent reste donc parfaite. `fn` reçoit le rectangle visible
   * dans le repère de ce calque. Le portail doit rester sur le calque 1.
   */
  layer(depth: number, fn: (view: Rect) => void): void;
  /** Dessine le niveau suivant dans le portail. Renvoie false s'il est trop petit. */
  portal(): boolean;
  /** Déclare une zone cliquable (id = clé dans `content.ts`). */
  hot(id: string, shape: HotShape): void;
  /** La souris survole-t-elle la zone `id` ? */
  isHover(id: string): boolean;
  /** Vrai si une taille `size` (en unités) fait au moins `minPx` pixels à l'écran. */
  visible(size: number, minPx?: number): boolean;
}

export interface Level {
  /** Identifiant (sert dans l'URL : #espace, #chambre…). */
  key: string;
  /**
   * Où se trouve le niveau suivant : son carré [-1,1]² est dessiné centré en
   * (x, y) avec une échelle s (s = 0.1 → le niveau suivant est 10× plus petit).
   */
  portal: { x: number; y: number; s: number };
  /** Forme du portail (chemin en coordonnées du niveau), sert de masque. */
  clip?: (ctx: CanvasRenderingContext2D) => void;
  /**
   * Faux si le niveau doit se dessiner SANS fond quand il est imbriqué
   * (espace dans l'espace : les étoiles se superposent sans « trou noir »).
   */
  opaqueNested?: boolean;
  /**
   * Échelle globale du dessin (défaut 1). Pratique pour « dézoomer » un niveau
   * entier sans retoucher toutes ses coordonnées : `portal` et `clip` restent
   * exprimés dans le repère du dessin, le moteur s'occupe du reste.
   */
  scale?: number;
  draw(d: Draw): void;
}
