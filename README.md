# Gridshift

Média gaming éditorial, construit avec Astro sur le système de design
**GRIDSHIFT V2 « Platine »** (`../gridshift-v2.html`).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/
npm test         # logique de recherche
```

## Où se trouve quoi

| Chemin | Rôle |
|---|---|
| `src/styles/gridshift.css` | le système de design, repris tel quel du fichier de référence |
| `src/site.ts` | nom du site, rubriques, pied de page — le seul fichier à éditer pour rebrander |
| `src/content.config.ts` | schémas des articles, jeux et auteurs |
| `src/content/` | le contenu (Markdown / MDX) |
| `src/lib/articles.ts` | chargement, dénormalisation, articles liés, pagination |
| `src/scripts/site.js` | thème, méga-menu, ⌘K, barre de lecture, filtres |

## Écrire un article

Un seul type d'entrée, discriminé par `type` : `actu`, `test` ou `guide`.
L'URL en découle : `/actus/…`, `/tests/…`, `/guides/…`.

```yaml
---
type: test
title: "Titre du test"
lede: "Une phrase de résumé."
date: 2026-08-21T10:00:00+02:00
author: sacha-vidal        # src/content/authors/
game: echo-divide          # src/content/games/ (facultatif)
score: 9.1                 # tests uniquement
verdict: "Le verdict en deux lignes."
pros: [...]
cons: [...]
testedOn: v4.2a            # la version testée s'affiche partout
stale: false               # true = « à vérifier », le guide a vieilli
tags: [Action-RPG, PC]
method: "Comment nous avons testé."
corrections:
  - { date: 24 août 2026, text: "Ce qui a changé." }
---
```

En `.mdx`, ces composants sont disponibles dans le corps du texte :
`<Tldr>`, `<Callout>`, `<Spoiler>`, `<Alert>`, `<Ad />`.

## Publicité

Les emplacements sont réservés dans la mise en page (pas de décalage au
chargement) et étiquetés « Publicité ». Sans `PUBLIC_ADSENSE_CLIENT` dans
`.env`, ils s'affichent vides. Voir `.env.example`.

Emplacements en place : pavé latéral (accueil, article, fiche jeu),
bannière de bas de page (accueil, archives), pavé au fil du texte via `<Ad />`.

## Images

Aucune image n'est fournie : le système affiche sa plaque vide à la place.
Ajoutez `cover: ../../assets/mon-image.jpg` au frontmatter et l'image passe
par le pipeline d'optimisation d'Astro.

## SEO

`sitemap-index.xml`, `robots.txt`, `rss.xml`, canoniques, Open Graph, et
JSON-LD par type de page (`Article`, `Review`, `VideoGame`, `Person`,
`Organization`, `WebSite`). Les pages 2+ des archives sont en `noindex,follow`.
