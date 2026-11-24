# Portfolio zoom

Un portfolio en **zoom infini** : on part d'une galaxie et on plonge, niveau après niveau, jusqu'au serveur qui héberge le site… dont un voyant contient à nouveau la galaxie. Ça boucle.

```
espace → système solaire → Terre → Lyon vue du ciel → la rue → la chambre
       → le bureau Hyprland → ~/projets → la salle serveur → (espace)
```

En ligne sur https://wireredblue.xyz (le panel envoie le trafic vers le conteneur `portfolio-zoom`, port `3000`).

Stack : **Vite + TypeScript + Canvas 2D**, sans aucune librairie de rendu. Tout est dessiné en code (pas une seule image).

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # vérifie les types puis construit dans dist/
```

Pour déboguer :

- `?t=3.5` fige la caméra à mi-chemin entre le niveau 3 et le 4 ;
- `?nohud` masque l'interface (pratique pour des captures) ;
- dans la console : `__zoom.go(6)` pour sauter à un niveau, `__zoom.bench(4.5)` pour mesurer le temps de dessin d'une image (en ms) ;
- `#chambre`, `#projets`… : l'URL de chaque niveau, qu'on peut partager.

## Modifier les textes

**Tout est dans [`src/content.ts`](src/content.ts)**, rien à toucher dans le dessin :

- `levels` : la légende de chaque niveau (dans l'ordre du zoom) ;
- `spots` : le contenu du panneau qui s'ouvre quand on clique sur un élément. La clé (`boulangerie`, `dle`…) est celle passée à `d.hot('…')` dans le niveau. Les cartes de `~/projets` lisent aussi leur titre, sous-titre et tags ici.

Il reste un `TODO` : ajouter ton e-mail / LinkedIn dans `spots.contact`.

## Comment ça marche

### 1. Un niveau contient le suivant

Chaque niveau (`src/levels/*.ts`) dessine sa scène dans un repère centré, où le carré `[-1, 1]²` est toujours visible. Il déclare un **portail** : l'endroit où le niveau suivant est dessiné en tout petit.

```ts
portal: { x: 0, y: -0.3, s: 0.095 } // le niveau suivant, ×0,095, centré en (0, -0.3)
```

Au moment voulu de son dessin, le niveau appelle `d.portal()` : le moteur se place dans le repère du portail (`translate(x, y)` puis `scale(s)`) et dessine le niveau suivant, qui appelle lui-même son portail… jusqu'à ce que ce soit trop petit pour être vu (moins de quelques pixels).

### 2. La caméra est un seul nombre

`t = 4.3` veut dire : niveau 4, à 30 % du zoom vers son portail. Toute l'animation, c'est faire varier `t`.

Le zoom est **exponentiel** autour d'un **point fixe** `F` :

- la transformation qui envoie un niveau sur son portail est `z ↦ c + s·z` ;
- son point fixe vérifie `F = c + s·F`, donc `F = c / (1 − s)` ;
- avec `h = s^p` (où `p` est la partie décimale de `t`), le point écran `z` montre le point `F + h·(z − F)` du niveau.

À `p = 0` on voit le niveau entier, à `p = 1` exactement son portail, et entre les deux la vitesse apparente est constante : c'est ce qui donne l'impression de plonger sans à-coup. Le code est dans [`src/engine/zoom.ts`](src/engine/zoom.ts).

### 3. Le passage d'un niveau à l'autre

Quand le portail remplit presque l'écran (`p > 0,72`), le moteur dessine le niveau suivant **en entier**, sans le masque du portail, sur un second canvas posé au-dessus du premier, et monte son opacité CSS jusqu'à 1 (c'est le navigateur qui mélange les deux, presque gratuitement). À `p = 1` l'image est exactement celle du niveau suivant à `p = 0` : on peut changer de niveau de base sans saut visible.

### 4. La parallaxe

`d.layer(profondeur, () => …)` dessine un calque qui grossit plus ou moins vite que le reste :

- `1` : le plan du portail (ne bouge pas par rapport à lui) ;
- `< 1` : l'arrière-plan (étoiles lointaines, skyline) grossit moins vite ;
- `> 1` : le premier plan (lampadaire, chaise, comète) grossit plus vite et passe devant la caméra.

Le facteur vaut `h^(1 − profondeur)`. À `p = 0`, `h = 1`, donc tous les calques sont alignés : la transition depuis le niveau parent reste parfaite. Seule règle : le portail reste sur le calque 1.

### 5. Les éléments cliquables

Pendant le dessin, un niveau déclare ses zones avec `d.hot('id', { kind: 'rect', … })`. Le moteur mémorise la **matrice de transformation courante** (`ctx.getTransform()`) avec chaque zone. Au clic, on applique l'inverse de cette matrice à la position de la souris pour retrouver le point dans le repère du niveau, et on teste la forme. Ça marche donc même au milieu d'un zoom ou sur un calque de parallaxe.

### 6. Détails utiles

- **Niveau de détail** : `d.px` donne le nombre de pixels par unité ; `d.visible(taille, minPx)` permet de ne pas dessiner ce qui serait invisible (texte trop petit, etc.).
- **Niveaux « transparents »** : `opaqueNested: false` (espace, système solaire, Terre, Lyon) fait que le niveau ne peint pas son fond quand il est imbriqué. Les étoiles du niveau suivant se superposent donc à celles du niveau courant, sans « trou noir ».
- **`scale`** : réduit tout un niveau sans retoucher ses coordonnées (la rue est dessinée à ×0,72 pour la voir du toit à la chaussée).
- **Hasard reproductible** : `rng(graine)` donne toujours les mêmes étoiles et les mêmes fenêtres allumées.

## Structure

```
src/
  content.ts           ← tous les textes
  main.ts              ← canvas, boucle, interface (légende, menu, panneaux)
  style.css
  engine/
    types.ts           ← interfaces Level / Draw (le contrat d'un niveau)
    zoom.ts            ← caméra exponentielle, récursion des portails, fondu, clics
    camera.ts          ← molette, glisser, pincer, clavier, calage sur un niveau
    util.ts            ← rng, halos, texte, rectangles arrondis, palette
  levels/
    index.ts           ← l'ordre des niveaux
    00-espace.ts … 08-serveur.ts
```

## Ajouter un niveau

1. Copie un niveau existant dans `src/levels/`, change sa `key`, son dessin et son `portal`.
2. Ajoute-le dans `src/levels/index.ts`, à l'endroit voulu.
3. Ajoute sa légende **au même rang** dans `levels` (`content.ts`).
4. Vérifie la transition avec `?t=` (par ex. `?t=4.9`).

Astuce : pour qu'un portail rectangulaire tombe juste, donne-lui les proportions de ce que le niveau suivant montre. Les écrans (bureau, projets, serveur) font `1,6 × 0,9`, donc la vignette qui les contient fait `(1,6·s) × (0,9·s)` de demi-côté.

## Accessibilité

- Navigation au clavier : `↓` / `espace` pour plonger, `↑` pour remonter, `Début` pour revenir à l'espace.
- Le bouton **Version texte** donne tout le contenu sans animation (et permet d'aller à un niveau).
- `prefers-reduced-motion` : les déplacements sont plus directs.

## Déploiement

Push sur `main` → la CD (GitHub Actions → `deploy.sh portfolio-zoom`) reconstruit l'image et relance le conteneur. Le `Dockerfile` construit le site avec Node puis le sert avec nginx sur le port `3000`.

Les secrets éventuels vont dans le `.env` du serveur (`~/projects/portfolio-zoom/.env`), jamais dans le repo. Ce site n'en a pas besoin.
