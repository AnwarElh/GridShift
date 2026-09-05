---
name: blog-starter
description: >
  Framework pour créer un blog rapide, monétisé et SEO/GEO-ready (Astro + Cloudflare D1/R2/KV)
  à partir d'une config (niche, catégories, couleurs, auteurs, sujets). Déroule le process
  étape par étape avec portes de validation. Triggers : "create blog", "nouveau blog",
  "blog framework", "monter un blog", "générer un site de niche", "blog-starter".
---

# blog-starter — Générateur de blog paramétrable

Transforme un process éprouvé (implémentation de référence : BlogStarter) en **framework réutilisable**.
L'utilisateur fournit sa **niche, ses catégories, ses couleurs, ses auteurs, ses sujets** ; le skill
génère et déploie son blog en suivant les phases ci-dessous, **en validant avant d'avancer**.

## Principe directeur (ne jamais l'oublier)
1. **Le design system est la source de vérité** — toute page en découle ; une modif passe d'abord par lui.
2. **L'ordre est non négociable** : design system → gabarits → contenu → Astro → déploiement.
3. **Le contenu est irremplaçable** — la technique rend rapide ; l'expertise de niche rend défendable.

## Assets fournis (dans ce dossier)
| Chemin | Rôle | Statut |
|---|---|---|
| `schema/blog.config.schema.json` (+ `.example.json`) | Schéma de validation de l'intake | ✅ |
| `templates/design-system/base.css` | Design system thémable (tokens `--accent*`) | ✅ |
| `templates/themes/*.css` | 5 presets de palette | ✅ |
| `scripts/gen-theme.mjs` | Génère un thème depuis 1 accent | ✅ |
| `templates/design-system/theme-preview.html` | Preview de thème (`__THEME__`) | ✅ |
| `templates/design-system/gabarits/*.html` | Maquettes de validation (home/listing/article/review/styleguide) | ✅ |
| `templates/astro/` | Squelette Astro complet paramétrable (+ `TEMPLATE.md`) | ✅ |
| `templates/agents/*.md` | 4 rédacteurs paramétrés par niche (+ `TEMPLATE.md`) | ✅ |
| `references/` | Documentation complète (12 parties), lue à la demande par phase | ✅ |

## Substitution des placeholders (règle centrale)
Les templates (`templates/astro/`, `templates/agents/`) contiennent des placeholders remplacés
depuis `blog.config.json` **avant** tout build. Table de correspondance :

| Placeholder | Valeur |
|---|---|
| `{{brand}}` | `brand` |
| `{{slug}}` | kebab-case de `brand` (ex. `BlogStarter` → `blogstarter`) |
| `{{domain}}` | `domain` |
| `{{language}}` | `language` |
| `{{author}}` | `authors[0].name` |
| `{{authorSlug}}` | kebab-case de `authors[0].name` |
| `{{authorBio}}` | `authors[0].bio` |
| `{{date}}` | date du jour, ISO `AAAA-MM-JJ` |
| `{{entity}}` | entité centrale de la niche (module ; gaming = « jeu ») |
| `{{categories}}` | **régénérer** les structures balisées (nav Header, liens Footer, sections home, `CATS` d'import, INSERT du seed) — un item par catégorie |
| `<VOTRE_DATABASE_ID>` / `<VOTRE_KV_NAMESPACE_ID>` | créés en phase 8 (déploiement) |
| `GTM-XXXXXXX` | conteneur GTM (optionnel) |

## Runbook (exécuter dans l'ordre ; lire la réf. avant chaque phase)

### Phase 0 · Intake
1. Poser les questions : niche, brand, domain, categories (2–5), language, theme (preset **ou** accent+mode), authors (name/bio), seeds, monetization (ads/affiliate/cpi), content.articlesPerCategory.
2. Valider la config contre `schema/blog.config.schema.json` (rejeter : >5 catégories, hex invalide, domaine mal formé…).
3. Écrire `blog.config.json` à la racine du projet. Dériver `slug`, `authorSlug`, `date`.

### Phase 1 · Cadrage — réf. `00`, `01`
Confirmer avec l'utilisateur : niche défendable, marque brandable en `.com`, catégories (≤5).

### Phase 2 · Design system — réf. `02` — 🚦
1. **Preset** : copier `templates/themes/<preset>.css`. **Accent custom** : `node scripts/gen-theme.mjs "<accent>" <dark|light> <nom> > templates/themes/<nom>.css`.
2. Prévisualiser : `templates/design-system/gabarits/styleguide.html` (ou `theme-preview.html`, remplacer `__THEME__`).
3. **🚦 VALIDER le styleguide avec l'utilisateur avant d'avancer.**

### Phase 3 · Gabarits — réf. `03` — 🚦
Montrer `gabarits/home.html`, `listing.html`, `article.html` (+ `article-review.html`) au rendu attendu (marque, catégories, accent). **🚦 VALIDER.**

### Phase 4 · Modèle de contenu — réf. `04`
Créer `contents/` avec un sous-dossier par catégorie. Rappeler le frontmatter et la convention d'images (`/wp-content/uploads/AAAA/MM/JJ/`, WebP optimisé, métadonnées nettoyées).

### Phase 5 · Agents + contenu — réf. `05`
1. Copier `templates/agents/*.md` → `.claude/agents/`, **substituer les placeholders** (`{{slug}}`, `{{brand}}`, `{{niche}}`, `{{language}}`, `{{author}}`, `{{entity}}`, `{{date}}`).
2. Lancer le **photo-finder** sur les `seeds` → `contents/_images.json` (**bloquant**).
3. Lancer les rédacteurs **en parallèle** → `content.articlesPerCategory` articles par catégorie.

### Phase 6 · Astro — réf. `06`
1. Copier `templates/astro/` → projet ; **substituer TOUS les placeholders** (voir table) ; **régénérer les structures `{{categories}}`**.
2. `npm install`.
3. `node scripts/import-content.mjs` (depuis la racine) → `seed.sql`.
4. `npx wrangler d1 migrations apply <slug>-db --local` puis exécuter `seed.sql` en local.
5. `npm run dev` — vérifier le rendu.
   ⚠️ Astro v7 : accès aux bindings via `import { env } from 'cloudflare:workers'` (pas `Astro.locals.runtime.env`).

### Phase 7 · SEO/GEO + monétisation — réf. `07`, `08`
Vérifier `BaseLayout` (SEO + JSON-LD + Consent Mode v2), endpoints (`sitemap`/`robots`/`rss`/`ads.txt`/`llms.txt`), bannière de consentement, et appliquer les toggles `monetization`. Compléter les pages légales (`legal-notice`/`privacy`/`cookies`).

### Phase 8 · Déploiement — réf. `09`, `10`
1. **Utilisateur** : `wrangler login`, `gh auth login`.
2. Créer les ressources distantes : `wrangler d1 create <slug>-db`, `wrangler r2 bucket create <slug>-media`, `wrangler kv namespace create SESSION`.
3. **Remplacer** `<VOTRE_DATABASE_ID>` et `<VOTRE_KV_NAMESPACE_ID>` dans `wrangler.jsonc`.
4. `d1 migrations apply <slug>-db --remote` → seed `--remote` → `npm run build` → `wrangler deploy`.
5. Brancher le domaine (SSL auto), soumettre le sitemap (Search Console), compléter `ads.txt`.

### (option) Audit
Passe QA multi-agents (technique + UX + business).

## État & reprise
Maintenir `blog-starter.state.json` (phase courante, portes franchies) pour reprendre un run sans tout refaire.

## Garde-fous
- **Déploiement** et **logins** (Cloudflare, GitHub) sont des actions **utilisateur**.
- **Droits des images** : à vérifier par niche avant publication réelle ; avertir.
- **Placeholders légaux** et **CMP certifié TCF** (pub EEE/UK) restent à compléter par l'utilisateur.
- Ne jamais committer de vrais secrets : `database_id`/`kv id` viennent du compte de l'utilisateur.

> STATUT : v1 — intake validé, design system thémable, gabarits, squelette Astro et agents **prêts et paramétrables**. `references/` sert de base de connaissance détaillée par phase.
