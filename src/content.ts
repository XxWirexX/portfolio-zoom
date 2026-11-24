/**
 * TOUS les textes du site sont ici : modifie-les sans toucher au dessin.
 *
 *  - `levels` : la légende affichée quand on est posé sur un niveau
 *    (même ordre que `src/levels/index.ts`).
 *  - `spots`  : le contenu du panneau qui s'ouvre quand on clique sur un
 *    élément. La clé doit correspondre à l'id passé à `d.hot('…')` dans le niveau.
 */

export interface LevelText {
  /** Nom court (menu de navigation). */
  nav: string;
  kicker: string;
  title: string;
  body: string;
  /** Éléments cliquables de ce niveau (clés de `spots`), pour la version texte. */
  spots: string[];
}

export interface Spot {
  title: string;
  /** Petit texte au survol. */
  hint: string;
  tags?: string[];
  body: string[];
  links?: { label: string; href: string }[];
}

export const site = {
  name: 'Kylian Gagnon',
  role: 'Développeur fullstack en alternance',
  domain: 'wireredblue.xyz',
  github: 'https://github.com/XxWirexX',
};

export const levels: LevelText[] = [
  {
    nav: 'Espace',
    kicker: '00 · Origine',
    title: 'Kylian Gagnon',
    body: "Développeur fullstack en alternance. Ce portfolio part du plus grand pour finir au plus petit : de l'espace jusqu'au serveur qui l'héberge. Fais défiler pour plonger.",
    spots: ['astro'],
  },
  {
    nav: 'Soleil',
    kicker: '01 · Curiosité',
    title: 'Comprendre comment ça marche',
    body: "Avant le code, il y a eu l'astronomie. La même envie m'a mené à l'informatique : démonter les choses pour voir ce qu'il y a dedans.",
    spots: ['autodidacte'],
  },
  {
    nav: 'Terre',
    kicker: '02 · Ancrage',
    title: 'Lyon, France',
    body: "C'est ici que tout se passe : les cours, l'alternance, les associations, et tout le reste.",
    spots: [],
  },
  {
    nav: 'Lyon',
    kicker: '03 · Parcours',
    title: 'Formation & alternance',
    body: "3e année de BUT Informatique (parcours Réseaux & Applications) à l'IUT Lyon 1, en alternance chez Axopen. Clique sur les repères.",
    spots: ['iut', 'axopen'],
  },
  {
    nav: 'Rue',
    kicker: '04 · À côté du code',
    title: 'Ce qui me forge',
    body: "Le week-end, je suis boulanger. Quand le bip sonne, je suis pompier volontaire. Ça m'apprend la rigueur, le travail d'équipe et le sang-froid.",
    spots: ['boulangerie', 'pompier', 'enseigne'],
  },
  {
    nav: 'Chambre',
    kicker: '05 · Chez moi',
    title: 'Là où je code',
    body: "J'apprends en autodidacte depuis 2020, à coup de projets perso et de cours en ligne. Les soirées finissent souvent ici.",
    spots: ['etagere', 'affiche', 'manette'],
  },
  {
    nav: 'Setup',
    kicker: '06 · Mon setup',
    title: 'NixOS + Hyprland',
    body: 'Un bureau entièrement déclaratif, configuré dans un repo. Ma stack du moment est dans le terminal.',
    spots: ['stack', 'editeur', 'island'],
  },
  {
    nav: 'Projets',
    kicker: '07 · Projets',
    title: '~/projets',
    body: "Ce que je construis, au travail comme sur mon temps libre. Clique sur une carte pour les détails. Celle du milieu mène à l'infra.",
    spots: ['dle', 'intrasso', 'kyarabot', 'impasto', 'auth', 'genshin', 'hikuze', 'lucca'],
  },
  {
    nav: 'Serveur',
    kicker: '08 · Infra',
    title: 'wireredblue.xyz',
    body: "Le serveur qui héberge ce site (et mes autres projets). Tu es arrivé au fond… ou presque : regarde le voyant de portfolio-zoom.",
    spots: ['rack', 'contact'],
  },
];

export const spots: Record<string, Spot> = {
  /* ---------- 00 · Espace ---------- */
  astro: {
    title: "L'astronomie",
    hint: 'Pourquoi partir de là ?',
    tags: ['curiosité', 'origine'],
    body: [
      "Avant de coder, je passais du temps à m'intéresser à l'espace : les échelles, les distances, la façon dont tout s'emboîte.",
      "C'est l'idée de ce site : chaque niveau contient le suivant, du plus concret au plus abstrait. Et à la fin, ça boucle.",
    ],
  },

  /* ---------- 01 · Système solaire ---------- */
  autodidacte: {
    title: 'Autodidacte depuis 2020',
    hint: 'Comment j’ai appris',
    tags: ['Udemy', 'OpenClassrooms', 'projets perso'],
    body: [
      "J'ai commencé à coder seul en 2020, avec des cours en ligne (Udemy, OpenClassrooms) et surtout beaucoup de projets perso.",
      "Mon principe : apprendre en construisant de vraies choses, puis les héberger moi-même.",
    ],
  },

  /* ---------- 03 · Lyon ---------- */
  iut: {
    title: 'IUT Lyon 1',
    hint: 'BUT Informatique',
    tags: ['BUT 3', 'Réseaux & Applications', 'alternance'],
    body: [
      "3e année de BUT Informatique, parcours Réseaux & Applications, en alternance.",
      "Très investi dans la vie étudiante : BDE Info et rôle RP Events au Student Club.",
      "Objectif pour la suite : une école d'ingénieur en alternance.",
    ],
  },
  axopen: {
    title: 'Axopen',
    hint: 'Alternance',
    tags: ['ESN lyonnaise', '.NET', 'WPF', 'Spring Boot'],
    body: [
      "Après un stage de 13 semaines, je suis alternant développeur chez Axopen depuis septembre 2026.",
      "Je travaille sur une application .NET WPF et sur une interface d'import des absences de Lucca vers iBat (Spring Boot, CSV, SFTP).",
    ],
  },

  /* ---------- 04 · Rue ---------- */
  boulangerie: {
    title: 'Boulanger le week-end',
    hint: 'CDI chez E. Leclerc',
    tags: ['rigueur', 'horaires décalés'],
    body: [
      "En parallèle des études et de l'alternance, je suis boulanger le week-end en CDI chez E. Leclerc.",
      "J'y ai d'ailleurs trouvé une idée de projet : un site pour retrouver vite les codes PLU du rayon.",
    ],
  },
  pompier: {
    title: 'Sapeur-pompier volontaire',
    hint: 'Engagement',
    tags: ['sang-froid', 'équipe'],
    body: [
      "Je suis pompier volontaire. On y apprend à garder la tête froide, à suivre une procédure et à compter sur son équipe.",
    ],
  },
  enseigne: {
    title: 'wireredblue',
    hint: 'Le pseudo',
    tags: ['domaine', 'identité'],
    body: [
      "wireredblue, c'est mon pseudo et mon nom de domaine. Le fil rouge et bleu se retrouve à chaque étage du site.",
    ],
    links: [{ label: 'wireredblue.xyz', href: 'https://wireredblue.xyz' }],
  },

  /* ---------- 05 · Chambre ---------- */
  etagere: {
    title: 'Objectif ingénieur',
    hint: 'La suite',
    tags: ["école d'ingé", 'lead dev', 'infra'],
    body: [
      "L'an prochain : une école d'ingénieur en alternance, idéalement en restant chez Axopen.",
      "À plus long terme : évoluer vers lead dev ou le génie logiciel, avec un vrai goût pour l'infra.",
    ],
  },
  affiche: {
    title: 'Vie associative',
    hint: 'BDE & Student Club',
    tags: ['BDE Info', 'Student Club', 'événements'],
    body: [
      "Membre actif du BDE Info de l'IUT Lyon 1, et en charge des relations événements (RP Events) au Student Club.",
      "Organiser des événements, c'est aussi de la gestion de projet : budget, planning, imprévus.",
    ],
  },
  manette: {
    title: 'Jeux & Godot',
    hint: 'Quand je ne code pas… je code des jeux',
    tags: ['Godot', 'Inazuma Eleven', 'Pokémon'],
    body: [
      "Joueur depuis longtemps (Inazuma Eleven, Pokémon…), j'apprends Godot avec de petits projets qu'on peut vraiment finir.",
    ],
  },

  /* ---------- 06 · Bureau ---------- */
  stack: {
    title: 'Ma stack',
    hint: 'fastfetch',
    tags: ['.NET', 'C#', 'Angular', 'Next.js', 'TypeScript', 'Prisma', 'Spring Boot', 'Docker', 'Traefik', 'NixOS', 'Godot'],
    body: [
      'Au travail : .NET / WPF et Spring Boot. Sur mes projets : TypeScript (Next.js, Angular), Prisma/PostgreSQL.',
      'Côté infra : Docker, Traefik, GitHub Actions, un VPS que je gère de A à Z. Et NixOS sur mon PC.',
    ],
  },
  editeur: {
    title: 'En ce moment',
    hint: 'Ce que j’ai dans l’éditeur',
    tags: ['C#', 'WPF', 'MVVM'],
    body: [
      "Le code ouvert à l'écran, c'est le quotidien de l'alternance : une application .NET WPF en MVVM.",
    ],
  },
  island: {
    title: 'Impasto',
    hint: 'Mon rice Hyprland',
    tags: ['Hyprland', 'Quickshell', 'NixOS'],
    body: [
      "La barre en forme d'île vient de mon fork d'Impasto, un shell Quickshell pour Hyprland, branché sur ma config NixOS.",
    ],
    links: [{ label: 'XxWirexX/impasto', href: 'https://github.com/XxWirexX/impasto' }],
  },

  /* ---------- 07 · Projets ---------- */
  dle: {
    title: 'DLE Community',
    hint: 'En ligne',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'NextAuth', 'Tailwind'],
    body: [
      "Une plateforme communautaire façon Wordle : chacun peut créer ou jouer à un « DLE » sur le thème de son choix.",
      'Hébergée sur mon VPS. Prochaines étapes : DLE du jour, séries (streaks) et import de personnages via l’API AniList.',
    ],
  },
  intrasso: {
    title: 'IntrAsso',
    hint: 'SAE BUT 3',
    tags: ['projet de groupe', 'GitLab → GitHub', 'CI/CD', 'Redis', 'Brevo'],
    body: [
      "Un logiciel modulaire de gestion d'association, réalisé en groupe pour la SAE de 3e année.",
      'Forge GitLab de Lyon 1 en miroir vers GitHub pour la CI/CD.',
    ],
  },
  kyarabot: {
    title: 'kyara-bot',
    hint: 'Une IA qui joue toute seule',
    tags: ['IA', 'agents', 'tools', 'VPS'],
    body: [
      "Une expérience : un compte du jeu de collection Kyara entièrement joué par une IA, avec ses propres outils, et une interface privée pour suivre ses décisions.",
      'Fait avec l’accord du développeur du jeu.',
    ],
    links: [{ label: 'XxWirexX/kyara-bot', href: 'https://github.com/XxWirexX/kyara-bot' }],
  },
  impasto: {
    title: 'Impasto (fork)',
    hint: 'Rice Hyprland',
    tags: ['Quickshell', 'QML', 'NixOS'],
    body: ["Mon fork public d'Impasto, la base de mon bureau Hyprland. Gardé en public comme vitrine."],
    links: [{ label: 'XxWirexX/impasto', href: 'https://github.com/XxWirexX/impasto' }],
  },
  auth: {
    title: "Portier d'auth maison",
    hint: 'auth.wireredblue.xyz',
    tags: ['Hono', 'TOTP', 'passkeys', 'Traefik'],
    body: [
      'Un service d’authentification fait maison qui protège tous mes sites derrière Traefik : TOTP en production, passkeys en cours.',
    ],
  },
  genshin: {
    title: 'genshin-build',
    hint: 'Guide perso',
    tags: ['site perso', 'jeu'],
    body: ['Un petit site de guide pour suivre mes équipes Genshin Impact.'],
    links: [{ label: 'genshin-build.wireredblue.xyz', href: 'https://genshin-build.wireredblue.xyz' }],
  },
  hikuze: {
    title: 'HikuZe',
    hint: 'En conception',
    tags: ['jeu web', 'push your luck'],
    body: ['Un jeu de collection en navigateur basé sur le « push your luck » : tirer, risquer, encaisser.'],
  },
  lucca: {
    title: 'Interface Lucca → iBat',
    hint: 'Projet pro (Axopen)',
    tags: ['Spring Boot', 'API REST', 'CSV', 'SFTP', 'SOPS'],
    body: [
      "Synchronisation des absences des salariés depuis Lucca vers iBat (logiciel du BTP) : lecture de l'API, génération d'un CSV, dépôt en SFTP.",
      'Je suis le seul développeur, avec mon chef de projet.',
    ],
  },

  /* ---------- 08 · Serveur ---------- */
  rack: {
    title: 'Mon infra',
    hint: 'VPS OVH',
    tags: ['Debian 13', 'Docker', 'Traefik', 'GitHub Actions', 'OVH'],
    body: [
      'Un VPS OVH sous Debian 13 que je gère entièrement : chaque projet tourne dans son conteneur derrière Traefik.',
      "Toute la config est dans un repo d'infra ; un push sur main redéploie automatiquement (c'est comme ça que ce site est arrivé ici).",
      'Je construis aussi un panel d’admin pour créer un projet, gérer les sous-domaines ou passer un site en maintenance en quelques clics.',
    ],
  },
  contact: {
    title: 'Contact',
    hint: 'On discute ?',
    tags: ['alternance', 'projets'],
    body: ["Pour une alternance en école d'ingénieur, un projet ou juste parler code, écris-moi."],
    links: [
      { label: 'GitHub · XxWirexX', href: 'https://github.com/XxWirexX' },
      // TODO : ajoute ton e-mail / LinkedIn ici
    ],
  },
};
