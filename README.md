# Portfolio zoom

En ligne sur https://wireredblue.xyz (le panel envoie le trafic vers le conteneur `portfolio-zoom`, port `3000`).

Pour l'instant, `docker-compose.yml` lance un conteneur de démo. Pour mettre ton application :

1. Ajoute un `Dockerfile` à la racine
2. Dans `docker-compose.yml`, remplace `image:` et `command:` par `build: .`
3. Garde `container_name: portfolio-zoom` et le réseau `proxy`
4. Ton application doit écouter sur `0.0.0.0:3000` (sinon change le port dans le panel)
5. Push sur `main` : la CD reconstruit et relance

Les secrets vont dans le `.env` du serveur (`~/projects/portfolio-zoom/.env`), jamais dans le repo.

Des exemples de Dockerfile (Nuxt, Node, Vite/Astro, Python, HTML) sont dans `vps-infra/templates/_import/`.
