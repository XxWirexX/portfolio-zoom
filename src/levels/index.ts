/**
 * L'ordre des niveaux = l'ordre du zoom. Le dernier boucle sur le premier.
 * Pour ajouter un niveau : crée un fichier sur le modèle des autres, ajoute-le
 * ici ET ajoute sa légende au même rang dans `levels` (content.ts).
 */
import type { Level } from '../engine/types';
import { espace } from './00-espace';
import { soleil } from './01-soleil';
import { terre } from './02-terre';
import { lyon } from './03-lyon';
import { rue } from './04-rue';
import { chambre } from './05-chambre';
import { bureau } from './06-bureau';
import { projets } from './07-projets';
import { serveur } from './08-serveur';

export const LEVELS: Level[] = [espace, soleil, terre, lyon, rue, chambre, bureau, projets, serveur];
