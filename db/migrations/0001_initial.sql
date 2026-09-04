-- Gridshift — schéma de contenu D1.
--
-- Le modèle bilingue du site est conservé tel quel, parce qu'il est juste :
--
--   un ARTICLE est un document. Il existe une fois par langue. Deux articles de
--   même `slug` dans deux langues sont la traduction l'un de l'autre — c'est ce
--   qui relie /reviews/x/ à /fr/tests/x/. D'où la clé primaire (slug, lang).
--
--   un JEU ou un AUTEUR est une entité. Une seule ligne, dont quelques colonnes
--   sont traduites (suffixe _en / _fr). Dupliquer la ligne dupliquerait le prix,
--   la note et le nombre d'abonnés — des chiffres qui n'ont pas de langue et qui
--   divergeraient au premier oubli.
--
-- Ce qui est interrogé est une colonne ; ce qui n'est que rendu est du JSON.
-- On ne filtre jamais sur les « pour » d'un test, mais on filtre sur la langue,
-- la rubrique, la date et le jeu — d'où les index en bas.

PRAGMA foreign_keys = ON;

-- ── Rubriques ───────────────────────────────────────────────────────────────
-- Les quatre rubriques du site et leur segment d'URL par langue. Elles vivaient
-- en dur dans i18n/config.ts ; ici, une rubrique s'ajoute sans redéploiement.
CREATE TABLE sections (
  key         TEXT PRIMARY KEY,           -- news | review | guide | setup
  slug_en     TEXT NOT NULL,
  slug_fr     TEXT NOT NULL,
  label_en    TEXT NOT NULL,
  label_fr    TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0
);

-- ── Auteurs ─────────────────────────────────────────────────────────────────
CREATE TABLE authors (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  initials    TEXT NOT NULL,
  since       TEXT,
  role_en     TEXT NOT NULL,
  role_fr     TEXT NOT NULL,
  bio_en      TEXT NOT NULL,
  bio_fr      TEXT NOT NULL,
  creds_en    TEXT NOT NULL DEFAULT '[]', -- JSON: string[]
  creds_fr    TEXT NOT NULL DEFAULT '[]',
  body_en     TEXT NOT NULL DEFAULT '',
  body_fr     TEXT NOT NULL DEFAULT ''
);

-- ── Jeux ────────────────────────────────────────────────────────────────────
CREATE TABLE games (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  studio            TEXT NOT NULL,
  released          TEXT NOT NULL,        -- libellé affiché : « 2026 », « TBA »
  release_date      TEXT,                 -- ISO 8601, sert au calendrier des sorties
  score             REAL,
  user_score        REAL,
  user_votes        INTEGER,
  followers         INTEGER,
  completion        INTEGER,
  version           TEXT,
  cover_media       TEXT REFERENCES media(key),
  hero_media        TEXT REFERENCES media(key),
  platforms         TEXT NOT NULL DEFAULT '[]',  -- JSON: {name,best,unavailable}[]
  offers            TEXT NOT NULL DEFAULT '[]',  -- JSON: {shop,price,url,tone}[]
  prices_checked_on TEXT,
  genre_en          TEXT NOT NULL,
  genre_fr          TEXT NOT NULL,
  facts_en          TEXT NOT NULL DEFAULT '[]',  -- JSON: {label,value}[]
  facts_fr          TEXT NOT NULL DEFAULT '[]',
  summary_en        TEXT NOT NULL,
  summary_fr        TEXT NOT NULL,
  body_en           TEXT NOT NULL DEFAULT '',
  body_fr           TEXT NOT NULL DEFAULT ''
);

-- ── Médias ──────────────────────────────────────────────────────────────────
-- L'index de ce que contient R2. La table porte les crédits, qui vivaient dans
-- lib/credits.ts : un visuel sans ayant droit nommé ne doit pas pouvoir entrer.
-- `width`/`height` sont indispensables : sans eux la page réserve mal la place
-- et le contenu saute au chargement (CLS).
CREATE TABLE media (
  key           TEXT PRIMARY KEY,         -- clé de l'objet R2 : « h-onimusha-way-of-the-sword-1.jpg »
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  bytes         INTEGER NOT NULL,
  content_type  TEXT NOT NULL DEFAULT 'image/jpeg',
  artist        TEXT NOT NULL,            -- l'ayant droit
  licence       TEXT NOT NULL,
  licence_url   TEXT NOT NULL DEFAULT '',
  source        TEXT NOT NULL,            -- l'URL d'où le visuel vient
  note          TEXT NOT NULL DEFAULT '', -- « recadré », « capture de bande-annonce »…
  checksum      TEXT NOT NULL DEFAULT ''  -- md5 du fichier, pour ne pas re-téléverser à l'identique
);

-- ── Articles ────────────────────────────────────────────────────────────────
CREATE TABLE articles (
  slug            TEXT NOT NULL,
  lang            TEXT NOT NULL CHECK (lang IN ('en','fr')),
  section         TEXT NOT NULL REFERENCES sections(key),
  title           TEXT NOT NULL,
  -- méta SEO : le titre de la page et le titre du référencement ne portent pas
  -- la même charge. Le second est lu dans une liste de dix résultats et coupé
  -- vers 60 signes. Nul ⇒ `title` sert aux deux.
  seo_title       TEXT,
  lede            TEXT NOT NULL,
  published_at    TEXT NOT NULL,          -- ISO 8601
  updated_at      TEXT,
  author_id       TEXT NOT NULL REFERENCES authors(id),
  game_id         TEXT REFERENCES games(id),
  kicker          TEXT,
  cover_media     TEXT REFERENCES media(key),
  cover_caption   TEXT,                   -- sert aussi de texte alternatif
  reading_minutes INTEGER,
  tested_on       TEXT,
  stale           INTEGER NOT NULL DEFAULT 0,
  live            INTEGER NOT NULL DEFAULT 0,
  featured        INTEGER NOT NULL DEFAULT 0,
  draft           INTEGER NOT NULL DEFAULT 0,
  -- test uniquement
  score           REAL CHECK (score IS NULL OR (score >= 0 AND score <= 10)),
  verdict         TEXT,
  pros            TEXT NOT NULL DEFAULT '[]',
  cons            TEXT NOT NULL DEFAULT '[]',
  playtime        TEXT,
  review_notes    TEXT NOT NULL DEFAULT '[]',
  score_revision  TEXT,
  -- guide et config
  level           TEXT,
  steps           TEXT NOT NULL DEFAULT '[]',
  -- transparence
  method          TEXT,
  sources         TEXT,
  corrections     TEXT NOT NULL DEFAULT '[]',  -- JSON: {date,text}[]
  body            TEXT NOT NULL,               -- markdown, tel quel
  PRIMARY KEY (slug, lang)
);

-- ── Étiquettes ──────────────────────────────────────────────────────────────
-- Table de jonction plutôt qu'un tableau JSON : les pages d'étiquette comptent
-- et filtrent, et un LIKE sur du JSON ne sait pas distinguer « RPG » de
-- « Action RPG ».
CREATE TABLE article_tags (
  slug   TEXT NOT NULL,
  lang   TEXT NOT NULL,
  tag    TEXT NOT NULL,
  tag_slug TEXT NOT NULL,                 -- forme normalisée pour l'URL
  PRIMARY KEY (slug, lang, tag),
  FOREIGN KEY (slug, lang) REFERENCES articles(slug, lang) ON DELETE CASCADE
);

-- ── Index ───────────────────────────────────────────────────────────────────
-- La liste d'une rubrique dans une langue, la plus récente d'abord : c'est la
-- requête que fait presque chaque page du site.
CREATE INDEX idx_articles_lang_date     ON articles(lang, published_at DESC);
CREATE INDEX idx_articles_lang_section  ON articles(lang, section, published_at DESC);
CREATE INDEX idx_articles_lang_game     ON articles(lang, game_id, published_at DESC);
CREATE INDEX idx_articles_featured      ON articles(lang, featured, published_at DESC);
CREATE INDEX idx_article_tags_tagslug   ON article_tags(lang, tag_slug);
CREATE INDEX idx_games_followers        ON games(followers DESC);
CREATE INDEX idx_games_release_date     ON games(release_date);
