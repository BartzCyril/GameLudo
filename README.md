# Petits Chevaux — GameLudo

> Jeu des petits chevaux (Ludo) jouable dans le navigateur contre l'ordinateur, traduit en 11 langues et optimisé pour le référencement naturel.

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

**👉 Jouer en ligne : [gameludo.fr](https://gameludo.fr/)**

## Sujet

Projet personnel démarré en 2023 et toujours maintenu. L'objectif de départ : apprendre le SEO en conditions réelles (Google Search Console, indexation, Core Web Vitals) avec un vrai site public. Le projet a ensuite évolué en un jeu complet, multilingue, avec une partie éditoriale (règles, stratégies, histoire du jeu) pour attirer du trafic organique.

## Fonctionnalités

- **Plateau interactif** : lancer de dé animé en 3D, déplacement animé des pions, choix de la couleur du joueur
- **Moteur de règles** : sortie d'un pion sur un 6, rejouer après un 6, prise d'un pion adverse, entrée à la maison, détection de la victoire
- **Adversaires gérés par l'ordinateur** : un bot choisit quel pion déplacer à chaque tour
- **Sauvegarde automatique** de la partie dans le `localStorage` et historique des coups
- **11 langues** (fr, en, es, de, it, pt, ru, zh, ja, ko, ar), avec gestion du sens de lecture de droite à gauche pour l'arabe
- **Guides** rédigés en Markdown (règles, stratégies offensive et défensive, histoire du jeu) pour chaque langue
- **Bannière de consentement** et emplacements publicitaires

## Stack technique

| Domaine | Outils |
| --- | --- |
| Front-end | Next.js (App Router, export statique), React, TypeScript |
| Contenu | Markdown + front matter (`gray-matter`, `markdown-to-jsx`) |
| Tests | Jest (règles du jeu, sauvegarde, historique, i18n, pages) |
| Qualité | ESLint, script maison de contrôle SEO |
| Déploiement | GitHub Actions → GitHub Pages, nom de domaine personnalisé |

## Compétences acquises

- **SEO technique** : métadonnées par page, balises `canonical` et `hreflang`, `sitemap.xml` et `robots.txt` générés, données structurées JSON-LD, images Open Graph
- **Suivi du référencement** avec Google Search Console (indexation, couverture, requêtes)
- **Internationalisation** sans bibliothèque externe : routes par langue, dictionnaires typés, contenus traduits
- **Logique de jeu** découpée en fonctions pures testables (`src/game/rules/`)
- **Tests unitaires** avec Jest sur les règles, la sauvegarde et la génération des pages
- **Automatisation** : script `check-seo` qui parcourt le site généré et signale titres manquants, descriptions dupliquées, `hreflang` incohérents, etc.
- **Déploiement continu** : build et publication automatiques à chaque push sur `main`

## Lancer le projet en local

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev          # serveur de développement sur http://localhost:3000
```

Autres commandes :

```bash
npm test             # tests unitaires
npm run lint         # analyse statique
npm run build        # export statique dans out/
npm run check:seo    # contrôle SEO du site généré (après le build)
npm start            # sert le dossier out/
```

## Structure

```
src/
├── app/          # routes Next.js (français à la racine, autres langues sous /[lang])
├── components/   # plateau, dé, en-tête, pied de page…
├── game/         # règles, bot, sauvegarde, historique
├── i18n/         # configuration des langues et dictionnaires
└── lib/          # chargement des articles Markdown
content/          # guides par langue
messages/         # traductions de l'interface
scripts/          # check-seo
```

## Site

[Petits Chevaux - Gameludo](https://gameludo.fr/)
