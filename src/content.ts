/**
 * TOUS les textes du site sont ici : modifie-les sans toucher au dessin.
 *
 *  - `levels` : la légende affichée quand on est posé sur un niveau
 *    (même ordre que `src/levels/index.ts`).
 *  - `spots`  : le contenu du panneau qui s'ouvre quand on clique sur un
 *    élément. La clé doit correspondre à l'id passé à `d.hot('…')` dans le niveau.
 *    Dans `body`, **texte** s'affiche en gras.
 *  - `cv`     : l'ordre des rubriques du CV (bouton « CV »), construit à partir des spots.
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
  /** Petit texte au survol (et sous-titre des cartes de projets). */
  hint: string;
  tags?: string[];
  /** Listes de tags avec un intitulé (ex. niveaux de compétences). */
  groups?: { label: string; tags: string[] }[];
  body: string[];
  links?: { label: string; href: string }[];
}

export const site = {
  name: 'Kylian Gagnon',
  role: 'Développeur fullstack',
  domain: 'wireredblue.xyz',
  email: 'kylian.gagnon@free.fr',
  github: 'https://github.com/XxWirexX',
  linkedin: 'https://www.linkedin.com/in/kylian-gagnon-713647311/',
};

export const levels: LevelText[] = [
  {
    nav: 'Espace',
    kicker: '00 · Origine',
    title: 'Kylian Gagnon',
    body: "Développeur fullstack à Lyon. Ce qui me fait avancer, c'est la curiosité : comprendre comment les choses fonctionnent, puis les construire moi-même. Ce site part de l'espace et finit sur le serveur qui l'héberge. Fais défiler vers le haut pour plonger.",
    spots: ['astro'],
  },
  {
    nav: 'Soleil',
    kicker: '01 · Déclic',
    title: "Un site, c'est du code",
    body: "Pendant le confinement, j'ai ouvert l'inspecteur d'éléments par curiosité, et j'ai compris qu'un site n'était que du code. Je pouvais donc en faire un. De là, j'ai essayé le HTML, le CSS, le PHP… puis les bots Discord.",
    spots: ['bots', 'autodidacte'],
  },
  {
    nav: 'Terre',
    kicker: '02 · Cap',
    title: 'Lyon, et la suite',
    body: "Aujourd'hui en 3e année de BUT Informatique, en alternance chez Axopen. Le cap pour 2027 : une école d'ingénieur en alternance, toujours à Lyon.",
    spots: ['cap'],
  },
  {
    nav: 'Lyon',
    kicker: '03 · Parcours',
    title: 'De Tarare à Axopen',
    body: "Un bac STI2D, puis un BUT Informatique à l'IUT Lyon 1, aujourd'hui en alternance chez Axopen. Clique sur les repères pour le détail.",
    spots: ['lycee', 'iut', 'axopen'],
  },
  {
    nav: 'Rue',
    kicker: '04 · À côté du code',
    title: 'Ce qui me forge',
    body: "Le week-end, je suis boulanger. Quand le bip sonne, je suis pompier. Et le reste du temps, j'organise des événements étudiants. Tout ça m'apprend la rigueur, le travail d'équipe et le sang-froid.",
    spots: ['boulangerie', 'pompier', 'asso', 'enseigne'],
  },
  {
    nav: 'Chambre',
    kicker: '05 · Chez moi',
    title: 'Par curiosité',
    body: 'Ce que je code ou suis en dehors des cours et du travail, juste parce que ça m’intéresse.',
    spots: ['veille', 'cyber', 'jeux', 'espace'],
  },
  {
    nav: 'Setup',
    kicker: '06 · Mon setup',
    title: 'Ma boîte à outils',
    body: "Ce que j'utilise au quotidien, au travail comme sur mes projets. Le tout sur un bureau NixOS + Hyprland que j'ai configuré moi-même.",
    spots: ['stack', 'site', 'island'],
  },
  {
    nav: 'Projets',
    kicker: '07 · Projets',
    title: '~/projets',
    body: 'Ce que je construis, au travail comme sur mon temps libre. Clique sur une carte pour les détails. Celle du milieu mène à l’infra.',
    spots: ['dle', 'intrasso', 'lucca', 'auth', 'zeste', 'panel', 'github'],
  },
  {
    nav: 'Serveur',
    kicker: '08 · Infra',
    title: 'wireredblue.xyz',
    body: 'Le serveur qui héberge ce site et tous mes projets, que je gère de A à Z. Tu es arrivé au fond… ou presque : regarde le voyant de portfolio-zoom.',
    spots: ['rack', 'contact'],
  },
];

export const spots: Record<string, Spot> = {
  /* ---------- 00 · Espace ---------- */
  astro: {
    title: 'Tout a commencé ici',
    hint: 'Avant le code',
    tags: ['astronomie', 'curiosité'],
    body: [
      "Petit, l'astronomie me fascinait. Je voulais comprendre comment tout ça fonctionnait, et je rêvais de devenir astronaute.",
      "Cette envie de comprendre ne m'a jamais quitté : c'est elle que tu vas suivre, étage après étage.",
    ],
  },

  /* ---------- 01 · Soleil ---------- */
  bots: {
    title: 'Mes premiers bots Discord',
    hint: 'Mes premiers projets',
    tags: ['JavaScript', 'discord.js', 'Node.js', 'MongoDB'],
    body: [
      "C'est avec les bots Discord que j'ai vraiment appris à programmer : comprendre un langage, lire une documentation (je connaissais presque celle de discord.js v13 par cœur), et déboguer.",
      "Le plus abouti, je l'ai fait pour notre communauté de jeu de rôle sur Discord. Il permettait d'incarner ses personnages avec leur propre nom et leur avatar. Il gérait aussi les fiches de personnage, qu'on devait remplir pour rejoindre un RP et qu'on suivait jusque-là à la main.",
      "C'étaient mes premiers projets utilisés par d'autres, et les premiers dont j'ai été fier.",
    ],
  },
  autodidacte: {
    title: 'Autodidacte depuis 2020',
    hint: 'Comment j’apprends',
    tags: ['YouTube', 'OpenClassrooms', 'Udemy', 'IA', 'projets perso'],
    body: [
      "J'ai surtout appris seul, avec des vidéos YouTube et des cours gratuits (OpenClassrooms, Udemy), puis en me lançant dans des projets.",
      "Aujourd'hui, j'apprends beaucoup avec l'IA, mais le principe reste le même : comprendre, puis construire.",
    ],
  },

  /* ---------- 02 · Terre ---------- */
  cap: {
    title: 'Cap 2027',
    hint: 'La suite',
    tags: ["école d'ingé", 'alternance', 'Lyon', 'génie logiciel'],
    body: [
      "Après le BUT, je veux continuer en école d'ingénieur, en alternance et à Lyon. CPE Lyon est en tête de ma liste.",
      "À plus long terme, j'aimerais évoluer vers un rôle de lead dev, côté génie logiciel, avec un vrai goût pour l'infra.",
    ],
  },

  /* ---------- 03 · Lyon ---------- */
  lycee: {
    title: 'Lycée René Cassin, Tarare',
    hint: 'Bac STI2D SIN · 2024',
    tags: ['STI2D', 'SIN', 'électronique'],
    body: [
      'Bac technologique STI2D, option SIN (systèmes d’information et numérique) : mon premier contact scolaire avec l’informatique et l’électronique.',
    ],
  },
  iut: {
    title: 'IUT Lyon 1',
    hint: 'BUT Informatique · 2024-2027',
    tags: ['BUT Informatique', 'Réseaux & Applications', 'alternance'],
    body: [
      'BUT Informatique, parcours Réseaux & Applications, en alternance en 3e année.',
      "J'adore les matières où on code, mais deux cours m'ont surpris : la communication et le PPP (projet personnel et professionnel). Ils m'ont appris à me mettre en avant et à parler de mes qualités. Ce site en est un peu le résultat.",
    ],
  },
  axopen: {
    title: 'Axopen',
    hint: 'Stage, puis alternance · depuis avril 2026',
    tags: ['ESN', 'TMA', 'Spring Boot', '.NET', 'Angular', 'Vue', 'Next.js'],
    body: [
      "ESN lyonnaise où j'ai fait mon stage (du 6 avril au 3 juillet 2026), et où je suis en alternance depuis septembre 2026. J'y travaille sur des projets clients variés : nouvelles fonctionnalités, maintenance (TMA) et débogage.",
      '**Joutexquises**, création d’histoires interactives : j’ai implémenté les clubs de joute, pour jouter à plusieurs, puis assuré la TMA. Next.js · Spring Boot · Flutter',
      '**Maestro**, création de répondeurs téléphoniques : un dictionnaire qui relie des mots à leur prononciation, le versionnage des commandes et leur suivi par statuts. Angular · Symfony',
      '**Interface Lucca → iBat**, pour un client du BTP : synchronisation des absences, réalisée de A à Z. Spring Boot',
      '**Horysons**, site d’agence immobilière, en TMA : référencement (sitemap) et correction de pages en erreur 500. Les agences étaient retrouvées par leur SIRET. Quand le client en a ajouté plusieurs avec le même SIRET, des pages ont cassé : j’ai trouvé la cause et corrigé. Vue · Symfony · Spring Boot',
      '**Catalogue produits** pour un fabricant de composants : authentification et affichage du catalogue. .NET · WPF',
    ],
  },

  /* ---------- 04 · Rue ---------- */
  boulangerie: {
    title: 'Boulanger le week-end',
    hint: 'CDI chez E. Leclerc · depuis 2024',
    tags: ['rigueur', 'gestion du temps', "travail d'équipe"],
    body: [
      'Depuis 2024, je suis boulanger le week-end en CDI chez E. Leclerc, en parallèle de mes études.',
      "Horaires décalés, procédures qualité, rythme soutenu : j'y ai appris la rigueur et à gérer mon temps entre les cours, l'alternance et le travail.",
    ],
  },
  pompier: {
    title: 'Sapeur-pompier volontaire',
    hint: 'Caporal · secourisme et incendie',
    tags: ['sang-froid', 'procédures', "esprit d'équipe"],
    body: [
      "Jeune sapeur-pompier de 2018 à 2022, puis sapeur-pompier volontaire depuis 2022. Je suis aujourd'hui caporal, avec les spécialités secourisme et incendie.",
      "On y apprend à garder la tête froide, à appliquer une procédure sous pression et à compter sur son équipe.",
    ],
  },
  asso: {
    title: 'Vie associative',
    hint: 'Student Club · BDE Info',
    tags: ['événementiel', 'gestion de projet', 'budget', 'coordination'],
    body: [
      "Au Student Club de Lyon 1, j'organise des événements : les Olympiades, avec environ 500 participants, et le WEF, un week-end pour une centaine de personnes avec un budget d'environ 10 000 €. Je gère les inscriptions, le budget et les locations : de la gestion de projet en conditions réelles.",
      "Au BDE Info, je donne des coups de main sur les événements de l'IUT.",
    ],
  },
  enseigne: {
    title: 'wireredblue',
    hint: 'Le pseudo',
    tags: ['domaine', 'identité'],
    body: ["wireredblue, c'est mon pseudo et mon nom de domaine. Le fil rouge et bleu se retrouve à chaque étage du site."],
    links: [{ label: 'wireredblue.xyz', href: 'https://wireredblue.xyz' }],
  },

  /* ---------- 05 · Chambre ---------- */
  veille: {
    title: 'DevSecOps',
    hint: 'Ma veille du moment',
    tags: ['DevSecOps', 'supply chain', 'CI/CD'],
    body: [
      "Ma veille technologique porte sur le DevSecOps et la sécurité de la chaîne d'approvisionnement logicielle : comment s'assurer que les dépendances et les outils de build qu'on utilise ne sont pas compromis.",
    ],
  },
  cyber: {
    title: 'Cybersécurité',
    hint: 'CTF et sécurité',
    tags: ['CTF', 'sécurité web', 'crypto'],
    body: [
      "La sécurité m'attire de plus en plus. J'ai participé aux épreuves CTF des 24h de l'Info : failles web (injection SQL, JWT, SSTI) et cryptographie (RSA).",
    ],
  },
  jeux: {
    title: 'Jeux & Godot',
    hint: "Je joue, et j'en crée",
    tags: ['Godot', 'GDScript', 'game dev'],
    body: [
      "Joueur depuis longtemps, j'apprends maintenant à créer des jeux avec Godot. Je préfère les petits projets qu'on finit vraiment, comme un Pong que je veux passer en multijoueur.",
    ],
  },
  espace: {
    title: "L'espace, toujours",
    hint: "Clin d'œil à l'étage 00",
    tags: ['astronomie', 'actualité spatiale'],
    body: ["Je n'observe plus le ciel autant qu'avant, mais je suis toujours l'actualité spatiale."],
  },

  /* ---------- 06 · Bureau ---------- */
  stack: {
    title: 'Ma stack',
    hint: 'fastfetch',
    groups: [
      {
        label: "À l'aise",
        tags: ['TypeScript', 'JavaScript', 'Java', 'SQL', 'Angular', 'Next.js / React', 'Vue', 'Spring Boot', 'Symfony', 'Node.js', 'Docker', 'Linux', 'Administration de VPS', 'Git'],
      },
      { label: 'Utilisé en projet', tags: ['C#', 'PHP', 'Python', '.NET / WPF', 'Prisma', 'Traefik', 'GitHub Actions', 'TMA'] },
      { label: 'Notions', tags: ['Méthodes agiles', 'Analyse des besoins'] },
    ],
    body: [],
  },
  site: {
    title: 'Ce site',
    hint: "Le code à l'écran, c'est celui-ci",
    tags: ['TypeScript', 'Canvas 2D', 'Vite'],
    body: [
      'Ce portfolio est fait sans moteur 3D, sans librairie et sans aucune image : tout est dessiné en code avec Canvas 2D. Chaque étage contient le suivant, et le zoom infini repose sur un peu de maths.',
    ],
    links: [{ label: 'XxWirexX/portfolio-zoom', href: 'https://github.com/XxWirexX/portfolio-zoom' }],
  },
  island: {
    title: 'NixOS + Hyprland',
    hint: 'Mon bureau',
    tags: ['NixOS', 'Hyprland', 'Quickshell'],
    body: [
      'Mon PC tourne sous NixOS : toute la configuration est déclarative et versionnée dans un repo. Le bureau Hyprland et sa barre en forme d’île viennent de mon fork d’Impasto, un shell Quickshell.',
    ],
    links: [
      { label: 'XxWirexX/nixos-config', href: 'https://github.com/XxWirexX/nixos-config' },
      { label: 'XxWirexX/impasto', href: 'https://github.com/XxWirexX/impasto' },
    ],
  },

  /* ---------- 07 · Projets ---------- */
  dle: {
    title: 'DLE Community',
    hint: 'Crée et joue des « DLE » sur n’importe quel thème',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'NextAuth', 'Tailwind', 'SEO', 'auto-hébergé'],
    body: [
      'Une plateforme communautaire façon Wordle : chacun peut créer son propre « DLE » sur un thème (un anime, un jeu, une série…) et y faire jouer les autres.',
      "Tout est parti de Guessu, un quiz que j'avais fait seul. J'ai ensuite aidé un ami sur son concept, puis j'ai repris l'idée pour en faire une vraie plateforme, ouverte à tous.",
      "Ce dont je suis le plus fier : l'avoir menée jusqu'au bout. Conception, développement, mise en ligne sur mon propre serveur, puis un premier travail de référencement (SEO). Pour l'instant, une dizaine de joueurs l'utilisent, surtout des amis.",
      'Prochaines étapes : un DLE du jour, des séries de victoires, et l’import automatique de personnages via l’API AniList.',
    ],
    links: [
      { label: 'dle.wireredblue.xyz', href: 'https://dle.wireredblue.xyz' },
      { label: 'XxWirexX/dle', href: 'https://github.com/XxWirexX/dle' },
    ],
  },
  intrasso: {
    title: 'IntrAsso',
    hint: 'Gestion d’association modulaire · projet de groupe',
    tags: ['Vue', 'PrimeVue', 'Express', 'Prisma', 'Redis', 'CI/CD', 'travail en équipe'],
    body: [
      'Un logiciel de gestion d’association modulaire : chaque association active seulement les modules dont elle a besoin.',
      "On est quatre et tout le monde touche à tout. Avec un camarade, je m'occupe en plus de l'infrastructure : la forge GitLab de Lyon 1 en miroir vers GitHub pour l'intégration et le déploiement continus (CI/CD), Redis et l'envoi d'e-mails.",
      "En cours jusqu'à la fin de l'année universitaire.",
    ],
  },
  lucca: {
    title: 'Interface Lucca → iBat',
    hint: 'Projet pro, réalisé de A à Z',
    tags: ['Spring Boot', 'API REST', 'CSV', 'SFTP', 'SOPS'],
    body: [
      "Pour un client du BTP chez Axopen : synchronisation des absences des salariés depuis Lucca vers iBat, un logiciel du BTP. Lecture de l'API Lucca, génération d'un CSV, dépôt en SFTP.",
      "Je l'ai réalisée de A à Z, seul développeur avec mon chef de projet.",
    ],
  },
  auth: {
    title: "Portier d'auth maison",
    hint: 'Une seule connexion pour tous mes sites',
    tags: ['TypeScript', 'Hono', 'WebAuthn', 'TOTP', 'Traefik'],
    body: [
      "Un service d'authentification que j'ai codé moi-même. Il se branche devant mes sites comme un middleware « forward auth » de Traefik : pour chaque requête, Traefik lui demande si l'accès est autorisé.",
      'Connexion par double authentification (TOTP) et par passkeys (WebAuthn).',
    ],
    links: [{ label: 'vps-infra / portier', href: 'https://github.com/XxWirexX/vps-infra/tree/main/portier' }],
  },
  panel: {
    title: "Panel d'admin",
    hint: 'Lancer un nouveau site en un clic',
    tags: ['Nuxt', 'Vue', 'TypeScript', 'Python', 'Traefik', 'sécurité'],
    body: [
      "Mon outil de tous les jours pour gérer le serveur. Un clic sur « Nouveau projet » crée le repo GitHub, les clés et la CD, puis lance le premier déploiement : ensuite, chaque push sur main redéploie le site tout seul. Le panel gère aussi les sous-domaines, la mise en maintenance d'un site et l'état des conteneurs.",
      "Côté sécurité, le panel n'a aucun accès à Docker. Il passe par un petit agent qui n'exécute qu'une liste fixe d'actions, et les clés de déploiement ne peuvent redéployer que leur propre projet.",
    ],
    links: [{ label: 'vps-infra / admin', href: 'https://github.com/XxWirexX/vps-infra/tree/main/admin' }],
  },
  zeste: {
    title: 'Zeste',
    hint: 'Organiser une soirée à plusieurs',
    tags: ['Node.js', 'Express', 'PostgreSQL', 'JavaScript', 'tests', 'CI/CD'],
    body: [
      "L'orga partage un lien ou un QR code, et chacun participe depuis son téléphone. Au menu : les invités et leurs réponses, une liste de courses partagée, le partage des dépenses (avec les remboursements calculés en un minimum de virements), un bar à cocktails, des jeux et une galerie photo.",
      'Les tests tournent sur une vraie base PostgreSQL à chaque push, et le déploiement ne se fait que s’ils passent.',
    ],
    links: [
      { label: 'zeste.wireredblue.xyz', href: 'https://zeste.wireredblue.xyz' },
      { label: 'XxWirexX/party-app', href: 'https://github.com/XxWirexX/party-app' },
    ],
  },
  github: {
    title: 'Tous mes repos',
    hint: 'Le reste est sur GitHub',
    tags: ['GitHub'],
    body: ['Projets perso, essais, configs : tout le reste est sur mon GitHub.'],
    links: [{ label: 'github.com/XxWirexX', href: 'https://github.com/XxWirexX' }],
  },

  /* ---------- 08 · Serveur ---------- */
  rack: {
    title: 'Mon infra',
    hint: 'VPS OVH · Debian 13',
    tags: ['Debian', 'Docker', 'Traefik', 'GitHub Actions', 'OVH', 'sauvegardes'],
    body: [
      "Un VPS OVH sous Debian 13, que j'administre entièrement. Chaque projet tourne dans son conteneur Docker. Seul Traefik est exposé sur Internet, et il distribue le trafic vers chaque site.",
      "Toute la configuration vit dans un repo : je modifie depuis mon PC, et le serveur se contente de faire git pull. Chaque push sur main redéploie le projet concerné, c'est comme ça que ce site est arrivé ici.",
      'Le hub liste tous mes sites publics, avec leur état en direct. Les sauvegardes de la base de DLE partent sur un stockage externe chez OVH.',
    ],
    links: [
      { label: 'hub.wireredblue.xyz', href: 'https://hub.wireredblue.xyz' },
      { label: 'XxWirexX/vps-infra', href: 'https://github.com/XxWirexX/vps-infra' },
    ],
  },
  contact: {
    title: 'Contact',
    hint: 'On discute ?',
    body: ['Une question, un projet, ou envie de parler code ? Écris-moi.'],
    links: [
      { label: site.email, href: `mailto:${site.email}` },
      { label: 'GitHub', href: site.github },
      { label: 'LinkedIn', href: site.linkedin },
    ],
  },
};

/** Rubriques du CV (bouton « CV ») : chaque rubrique reprend des spots. */
export const cv: { title: string; spots: string[] }[] = [
  { title: 'Expérience', spots: ['axopen', 'boulangerie'] },
  { title: 'Formation', spots: ['cap', 'iut', 'lycee'] },
  { title: 'Compétences', spots: ['stack'] },
  { title: 'Projets', spots: ['dle', 'lucca', 'panel', 'auth', 'zeste', 'intrasso'] },
  { title: 'Engagement', spots: ['pompier', 'asso'] },
  { title: 'Curiosité', spots: ['bots', 'autodidacte', 'veille', 'cyber', 'jeux'] },
];
