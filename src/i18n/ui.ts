import type { Locale } from './config';

/* ── Chaînes d'interface ────────────────────────────────────────────────────
   Le chrome du site uniquement : navigation, étiquettes, états, boutons.
   La prose longue (à propos, pages légales) vit dans les vues de page, une
   par langue — 1 500 mots de texte juridique n'ont rien à faire ici.

   Toute clé absente d'une langue est une erreur de type, pas un texte manquant
   au rendu : `Record<Locale, typeof en>` force les deux tables à coïncider. */

const en = {
  /* navigation */
  'nav.home': 'Home',
  'nav.news': 'News',
  'nav.reviews': 'Reviews',
  'nav.guides': 'Guides',
  'nav.setup': 'Setup',
  'nav.games': 'Games',
  'nav.deals': 'Deals',
  'nav.main': 'Main navigation',
  'nav.mobile': 'Mobile navigation',
  'nav.sections': 'Sections',
  'nav.subscribe': 'Subscribe',
  'nav.skip': 'Skip to content',
  'nav.breadcrumb': 'Breadcrumb',
  'nav.language': 'Language',
  'nav.switchTo': 'Lire en français',

  /* recherche */
  'search.open': 'Search for a game or a review',
  'search.label': 'Search',
  'search.placeholder': 'Search for a game, a review, a guide…',
  'search.results': 'Results',
  'search.navigate': 'navigate',
  'search.select': 'open',
  'search.close': 'close',
  'search.esc': 'Esc',
  'search.minChars': 'Type at least two letters',
  'search.emptyTitle': 'No results',
  'search.emptyBody': 'Try the name of the game rather than the studio.',
  'search.brokenTitle': 'Search unavailable',
  'search.brokenBody': 'The index could not be loaded. Check your connection and try again.',
  'search.groupGames': 'Games',
  'search.groupNews': 'News',
  'search.groupReviews': 'Reviews',
  'search.groupGuides': 'Guides',
  'search.groupSetup': 'Setup',

  /* méga-menu */
  'mega.mostFollowed': 'Most followed games',
  'mega.byPlatform': 'By platform',
  'mega.byGenre': 'By genre',
  'mega.upcoming': 'Upcoming releases',
  'mega.browse': 'Browse all games →',
  'mega.gamesTracked': (n: number) => `${n} games tracked · scores re-checked at every major patch`,
  'mega.upcomingSoon': 'Coming soon',

  /* accueil */
  /* Le titre de l'accueil ne répète pas la marque : elle est déjà dans le
     bandeau, dans le <title> et dans le JSON-LD. Il dit le sujet — c'est le
     seul endroit de la page qui en a la charge. */
  /* Le <title> de l'accueil : « Gridshift » seul ne visait qu'une requête —
     le nom de la maison, que personne ne cherche encore. Le gabarit ajoute
     « — Gridshift », la marque reste donc en fin de ligne. */
  'home.title': 'Live-service game reviews and guides',
  'home.h1': 'Independent reviews, guides and news for live-service games',
  'home.wire': 'The wire',
  'home.headlines': 'Top stories',
  'home.goToStory': (n: number) => `Story ${n}`,
  'home.pauseStories': 'Pause the top stories',
  'home.playStories': 'Resume the top stories',
  'home.seeDeals': 'See the deals',
  'home.gamesCovered': 'Games covered',
  'home.allGames': 'All games →',
  'home.deals': 'Deals right now',
  'home.allTrackedGames': 'All tracked games →',
  'home.trending': 'Trending',
  'home.gameDatabase': 'Game database →',
  'home.seeAll': 'See all →',
  'home.seeAllOf': (label: string) => `See all ${label.toLowerCase()}`,
  'home.promoTitle': 'A price drops, you hear about it',
  'home.promoBody':
    'The Tuesday letter: the releases worth your time, the patches that change a game, and the deals we checked ourselves.',
  'home.promoCta': 'Get the letter',

  /* cartes et méta */
  'card.min': 'min',
  'card.live': 'Live',
  'card.articles': (n: number) => `${n} article${n > 1 ? 's' : ''}`,
  'card.released': 'Released',
  'card.toCheck': 'to re-check',
  'card.recommended': 'recommended',

  /* rubriques */
  'noun.news': 'article',
  'noun.review': 'review',
  'noun.guide': 'guide',
  'noun.setup': 'guide',
  'section.news.title': 'News',
  'section.news.lede': 'The newsroom feed, updated continuously.',
  'section.review.title': 'Reviews',
  'section.review.lede': 'One score, one tested version, one revision history.',
  'section.guide.title': 'Guides',
  'section.guide.lede': 'Re-checked at every major patch. The tested version is shown on every guide.',
  'section.setup.title': 'Setup',
  'section.setup.lede': 'Settings, hardware and configuration, measured on our own machines.',

  /* archives et filtres */
  'archive.clearFilters': 'Clear filters',
  'archive.onThisPage': (n: number, noun: string) => `${noun}${n > 1 ? 's' : ''} on this page`,
  'archive.emptySection': (noun: string) => `No ${noun} published in this section yet. The Tuesday letter will tell you when there is.`,
  'archive.noneWithFilters': (noun: string) => `No ${noun} matches these filters`,
  'archive.resultsOf': (shown: number, total: number) => `${shown} of ${total}`,
  'archive.emptyTitle': 'Nothing here yet',
  'archive.emptyBody':
    'That combination returns nothing on this page. Drop a filter, or browse every page.',
  'archive.nothingYet': 'Nothing yet',
  'archive.pagination': 'Pagination',
  'archive.prev': 'Previous page',
  'archive.next': 'Next page',

  /* jeu */
  'games.title': 'Game database',
  'games.lede': (n: number) => `${n} games tracked. Every page gathers our score, the tracked version and all our articles on the game.`,
  'games.desc': 'Every game we track, with its score, its tested version and our full coverage.',
  'games.upcomingSub': 'What we will be covering',
  'games.allTitle': 'All games',
  'games.allSub': 'Ranked by score',
  'game.overview': 'Overview',
  'game.coverageSub': 'Newest first',
  'game.bestPrice': (p: string) => `Best price — ${p}`,
  'game.atShop': (s: string) => `at ${s}`,
  'game.followers': (n: string) => `${n} players are following it`,
  'game.articlesOn': (n: number, g: string) => `${n} article${n > 1 ? 's' : ''} on ${g}`,
  'game.noneOfType': (label: string) => `We have not published any ${label.toLowerCase()} on this game.`,
  'game.alsoFollowSub': 'The other games we cover',
  'game.votes': (n: string) => `${n} votes`,
  'game.desc': (title: string, studio: string) => `${title} — ${studio}. Our score, the tracked version and our full coverage.`,
  'game.follow': 'Follow this game',
  'game.fullPage': 'Full page →',
  'game.seePage': 'View game page',
  'game.allCoverage': 'All our coverage',
  'game.trackedVersion': 'Tracked version',
  'game.ourScore': 'Gridshift score',
  'game.playerScore': 'Player score',
  'game.completedBy': 'Completed by',
  'game.allOffers': 'all offers',
  'game.allArticles': 'All its articles →',
  'game.wholeDatabase': 'Whole database',
  'game.alsoFollow': 'Worth following too',

  /* test */
  'author.articles': 'Their articles',
  'author.publications': (n: number) => `${n} publication${n > 1 ? 's' : ''}`,
  'tag.topics': 'Topics',
  'tag.desc': (tag: string) => `All our articles on ${tag}: reviews, guides and news.`,
  'tag.lede': (n: number, tag: string) => `${n} article${n > 1 ? 's' : ''} filed under “${tag}”.`,
  'author.since': (y: string) => `at Gridshift since ${y}`,
  'author.published': (n: number) => `${n} article${n > 1 ? 's' : ''} published`,
  'review.testedOn': 'For version ',
  'review.readTime': (n: number) => `${n} min read`,
  'review.updatedOn': (d: string) => `Updated ${d}`,
  'review.ourAverage': 'Our average',
  'review.topPercent': (p: number) => `Top ${p}% of our reviews`,
  'review.whereToBuy': 'Where to buy',
  'aff.pricesChecked': (d: string) => `Prices checked on ${d}. `,
  'review.theGame': 'The game',
  'review.siblingCount': (n: number) => `${n} article${n > 1 ? 's' : ''} on this game`,
  'review.verdict': 'Verdict',
  'review.nextOn': (g: string) => `More on ${g}`,
  'review.readNext': 'Read next',
  'review.howWeTested': 'How we tested',
  'review.whatWorks': 'What works',
  'review.whatDoesnt': 'What doesn’t',
  'review.revisedScore': 'Revised score',
  'review.scoresMove': 'Scores move',
  'review.sources': 'Sources',
  'review.corrections': 'Corrections',
  'review.inThisGuide': 'In this guide',
  'review.share': 'Share',
  'review.linkCopied': 'Link copied',

  /* lettre */
  'news.kicker': 'Every Tuesday',
  'news.title': 'What actually matters this week',
  'news.body':
    'A short selection: the releases worth your time, the patches that change a game, the reviews we revise. No link dumps.',
  'news.email': 'Email address',
  'news.placeholder': 'you@example.com',
  'news.cta': 'Get the letter',
  'news.sending': 'Sending…',
  'news.terms': 'One email a week. Unsubscribe in one click.',
  'news.errEmpty': 'Enter your email address.',
  'news.errInvalid': 'That address doesn’t look right — check the @ and the domain.',
  'news.notConfigured': 'Signup not configured',
  'news.notConfiguredBody': 'Set PUBLIC_NEWSLETTER_ACTION in .env',

  /* consentement */
  'consent.title': 'We use advertising cookies.',
  'consent.body':
    'They fund the newsroom and do nothing else. None is set until you accept.',
  'consent.more': 'Learn more',
  'consent.accept': 'Accept',
  'consent.refuse': 'Refuse',
  'consent.reset': 'Change my choice',
  'consent.resetDone': 'Choice cleared',
  'consent.resetBody': 'The banner will come back on the next page load.',

  /* thème */
  'theme.toLight': 'Switch to light theme',
  'theme.toDark': 'Switch to dark theme',

  /* pied de page */
  'foot.content': 'Content',
  'foot.site': 'The site',
  'foot.legal': 'Legal',
  'foot.about': 'Who we are',
  'foot.team': 'The newsroom',
  'foot.charter': 'Editorial charter',
  'foot.howWeScore': 'How we score',
  'foot.contact': 'Write to us',
  'foot.legalNotice': 'Legal notice',
  'foot.privacy': 'Privacy',
  'foot.cookies': 'Cookies',
  'foot.affiliate': 'Affiliate links',
  'foot.credits': 'Photo credits',
  'foot.rss': 'RSS feed',
  'foot.affiliateNote': 'Affiliate links:',
  'foot.affiliateBody':
    'some offers earn us a commission. It changes neither your price nor our scores.',

  /* affiliation */
  'aff.note':
    'Affiliate links: we may earn a commission, with no effect on your price or on our scores.',
  'aff.seeOffer': 'See offer',
  'aff.atShopNewTab': (shop: string) => ` at ${shop} (new tab)`,

  /* publicité */
  'ad.label': 'ADVERTISEMENT',

  /* 404 */
  '404.title': 'Page not found',
  '404.heading': 'This page is gone',
  '404.body':
    'It may have been merged into a newer guide, or the game moved to a different page.',
  '404.home': 'Back to home',
  '404.latest': 'Our latest articles',
} as const;

/* Les valeurs de `en` sont des littéraux (`as const`) : sans élargissement,
   « Accueil » ne serait pas assignable au type de « Home ». On garde la forme
   — chaîne ou fonction, avec sa signature — et on élargit le contenu. */
type Widen<T> = T extends (...args: infer A) => infer R ? (...args: A) => R : string;
export type Dict = { [K in keyof typeof en]: Widen<(typeof en)[K]> };

const fr: Dict = {
  'nav.home': 'Accueil',
  'nav.news': 'Actus',
  'nav.reviews': 'Tests',
  'nav.guides': 'Guides',
  'nav.setup': 'Configs',
  'nav.games': 'Jeux',
  'nav.deals': 'Bons plans',
  'nav.main': 'Navigation principale',
  'nav.mobile': 'Navigation mobile',
  'nav.sections': 'Rubriques',
  'nav.subscribe': 'S’abonner',
  'nav.skip': 'Aller au contenu',
  'nav.breadcrumb': 'Fil d’ariane',
  'nav.language': 'Langue',
  'nav.switchTo': 'Read in English',

  'search.open': 'Chercher un jeu, un test',
  'search.label': 'Recherche',
  'search.placeholder': 'Chercher un jeu, un test, un guide…',
  'search.results': 'Résultats',
  'search.navigate': 'naviguer',
  'search.select': 'ouvrir',
  'search.close': 'fermer',
  'search.esc': 'Échap',
  'search.minChars': 'Tapez au moins deux lettres',
  'search.emptyTitle': 'Aucun résultat',
  'search.emptyBody': 'Essayez le nom du jeu plutôt que celui du studio.',
  'search.brokenTitle': 'Recherche indisponible',
  'search.brokenBody': 'L’index n’a pas pu être chargé. Vérifiez votre connexion et réessayez.',
  'search.groupGames': 'Jeux',
  'search.groupNews': 'Actus',
  'search.groupReviews': 'Tests',
  'search.groupGuides': 'Guides',
  'search.groupSetup': 'Configs',

  'mega.mostFollowed': 'Jeux les plus suivis',
  'mega.byPlatform': 'Par plateforme',
  'mega.byGenre': 'Par genre',
  'mega.upcoming': 'Prochaines sorties',
  'mega.browse': 'Parcourir la base →',
  'mega.gamesTracked': (n: number) => `${n} jeux suivis · notes vérifiées à chaque patch majeur`,
  'mega.upcomingSoon': 'À venir',

  'home.title': 'Tests et guides des jeux live-service',
  'home.h1': 'Tests, guides et actus indépendants sur les jeux live-service',
  'home.wire': 'Le fil',
  'home.headlines': 'À la une',
  'home.goToStory': (n: number) => `Sujet ${n}`,
  'home.pauseStories': 'Mettre la Une en pause',
  'home.playStories': 'Reprendre la Une',
  'home.seeDeals': 'Voir les bons plans',
  'home.gamesCovered': 'Jeux couverts',
  'home.allGames': 'Tous les jeux →',
  'home.deals': 'Bons plans du moment',
  'home.allTrackedGames': 'Tous les jeux suivis →',
  'home.trending': 'Tendances',
  'home.gameDatabase': 'Base de jeux →',
  'home.seeAll': 'Tout voir →',
  'home.seeAllOf': (label: string) => `Voir tous les ${label.toLowerCase()}`,
  'home.promoTitle': 'Un prix baisse, vous le saurez',
  'home.promoBody':
    'La lettre du mardi : les sorties qui valent le coup, les patchs qui changent un jeu, et les offres que nous avons vérifiées nous-mêmes.',
  'home.promoCta': 'Recevoir la lettre',

  'card.min': 'min',
  'card.live': 'En direct',
  'card.articles': (n: number) => `${n} article${n > 1 ? 's' : ''}`,
  'card.released': 'Sortie',
  'card.toCheck': 'à vérifier',
  'card.recommended': 'recommandé',

  'noun.news': 'actu',
  'noun.review': 'test',
  'noun.guide': 'guide',
  'noun.setup': 'config',
  'section.news.title': 'Actus',
  'section.news.lede': 'Le fil de la rédaction, mis à jour en continu.',
  'section.review.title': 'Tests',
  'section.review.lede': 'Une note, une version testée, un historique de révisions.',
  'section.guide.title': 'Guides',
  'section.guide.lede':
    'Vérifiés à chaque patch majeur. La version testée est indiquée sur chaque guide.',
  'section.setup.title': 'Configs',
  'section.setup.lede':
    'Réglages, matériel et paramètres, mesurés sur nos machines.',

  'archive.clearFilters': 'Effacer les filtres',
  'archive.onThisPage': (n: number, noun: string) => `${noun}${n > 1 ? 's' : ''} sur cette page`,
  'archive.emptySection': (noun: string) => `Aucun ${noun} publié dans cette rubrique. La lettre du mardi vous préviendra.`,
  'archive.noneWithFilters': (noun: string) => `Aucun ${noun} avec ces filtres`,
  'archive.resultsOf': (shown: number, total: number) => `${shown} sur ${total}`,
  'archive.emptyTitle': 'Rien ici pour le moment',
  'archive.emptyBody':
    'Cette combinaison ne donne rien sur cette page. Retirez un filtre, ou parcourez toutes les pages.',
  'archive.nothingYet': 'Rien encore',
  'archive.pagination': 'Pagination',
  'archive.prev': 'Page précédente',
  'archive.next': 'Page suivante',

  'games.title': 'Base de jeux',
  'games.lede': (n: number) => `${n} jeux suivis. Chaque fiche regroupe notre note, la version testée et tous nos articles sur le jeu.`,
  'games.desc': 'Tous les jeux que nous suivons, avec leur note, leur version testée et notre couverture complète.',
  'games.upcomingSub': 'Ce que nous couvrirons',
  'games.allTitle': 'Tous les jeux',
  'games.allSub': 'Classés par note',
  'game.overview': 'Aperçu',
  'game.coverageSub': 'Du plus récent au plus ancien',
  'game.bestPrice': (p: string) => `Meilleur prix — ${p}`,
  'game.atShop': (s: string) => `chez ${s}`,
  'game.followers': (n: string) => `${n} joueurs le suivent`,
  'game.articlesOn': (n: number, g: string) => `${n} article${n > 1 ? 's' : ''} sur ${g}`,
  'game.noneOfType': (label: string) => `Nous n’avons pas publié de ${label.toLowerCase()} sur ce jeu.`,
  'game.alsoFollowSub': 'Les autres jeux que nous couvrons',
  'game.votes': (n: string) => `${n} votes`,
  'game.desc': (title: string, studio: string) => `${title} — ${studio}. Notre note, la version suivie et toute notre couverture.`,
  'game.follow': 'Suivre ce jeu',
  'game.fullPage': 'Fiche complète →',
  'game.seePage': 'Voir la fiche',
  'game.allCoverage': 'Toute notre couverture',
  'game.trackedVersion': 'Version suivie',
  'game.ourScore': 'Note Gridshift',
  'game.playerScore': 'Note des joueurs',
  'game.completedBy': 'Terminé par',
  'game.allOffers': 'toutes les offres',
  'game.allArticles': 'Tous ses articles →',
  'game.wholeDatabase': 'Toute la base',
  'game.alsoFollow': 'À suivre aussi',

  'author.articles': 'Ses articles',
  'author.publications': (n: number) => `${n} publication${n > 1 ? 's' : ''}`,
  'tag.topics': 'Sujets',
  'tag.desc': (tag: string) => `Tous nos articles sur ${tag} : tests, guides et actus.`,
  'tag.lede': (n: number, tag: string) => `${n} article${n > 1 ? 's' : ''} classé${n > 1 ? 's' : ''} sous « ${tag} ».`,
  'author.since': (y: string) => `à Gridshift depuis ${y}`,
  'author.published': (n: number) => `${n} article${n > 1 ? 's' : ''} publié${n > 1 ? 's' : ''}`,
  'review.testedOn': 'Pour la version ',
  'review.readTime': (n: number) => `${n} min de lecture`,
  'review.updatedOn': (d: string) => `Mis à jour le ${d}`,
  'review.ourAverage': 'Notre moyenne',
  'review.topPercent': (p: number) => `Top ${p} % de nos tests`,
  'review.whereToBuy': 'Où acheter',
  'aff.pricesChecked': (d: string) => `Prix relevés le ${d}. `,
  'review.theGame': 'Le jeu',
  'review.siblingCount': (n: number) => `${n} article${n > 1 ? 's' : ''} sur ce jeu`,
  'review.verdict': 'Verdict',
  'review.nextOn': (g: string) => `La suite sur ${g}`,
  'review.readNext': 'À lire ensuite',
  'review.howWeTested': 'Comment nous avons testé',
  'review.whatWorks': 'Ce qui marche',
  'review.whatDoesnt': 'Ce qui coince',
  'review.revisedScore': 'Note révisée',
  'review.scoresMove': 'Les notes bougent',
  'review.sources': 'Sources',
  'review.corrections': 'Corrections',
  'review.inThisGuide': 'Dans ce guide',
  'review.share': 'Partager',
  'review.linkCopied': 'Lien copié',

  'news.kicker': 'Chaque mardi',
  'news.title': 'Ce qui compte vraiment cette semaine',
  'news.body':
    'Une sélection courte : les sorties qui valent le coup, les patchs qui changent un jeu, les tests que nous révisons. Pas de liste de liens.',
  'news.email': 'Adresse e-mail',
  'news.placeholder': 'vous@exemple.fr',
  'news.cta': 'Recevoir la lettre',
  'news.sending': 'Envoi…',
  'news.terms': 'Un envoi par semaine. Désabonnement en un clic.',
  'news.errEmpty': 'Entrez votre adresse e-mail.',
  'news.errInvalid': 'Cette adresse ne semble pas valide — vérifiez le @ et le domaine.',
  'news.notConfigured': 'Inscription non configurée',
  'news.notConfiguredBody': 'Renseignez PUBLIC_NEWSLETTER_ACTION dans .env',

  'consent.title': 'Nous utilisons des cookies publicitaires.',
  'consent.body':
    'Ils financent la rédaction et ne servent qu’à ça. Aucun n’est déposé tant que vous n’avez pas accepté.',
  'consent.more': 'En savoir plus',
  'consent.accept': 'Accepter',
  'consent.refuse': 'Refuser',
  'consent.reset': 'Revenir sur mon choix',
  'consent.resetDone': 'Choix effacé',
  'consent.resetBody': 'La bannière réapparaîtra au prochain chargement.',

  'theme.toLight': 'Passer au thème clair',
  'theme.toDark': 'Passer au thème sombre',

  'foot.content': 'Contenu',
  'foot.site': 'Le site',
  'foot.legal': 'Légal',
  'foot.about': 'Qui nous sommes',
  'foot.team': 'La rédaction',
  'foot.charter': 'Charte éditoriale',
  'foot.howWeScore': 'Comment nous notons',
  'foot.contact': 'Nous écrire',
  'foot.legalNotice': 'Mentions légales',
  'foot.privacy': 'Confidentialité',
  'foot.cookies': 'Cookies',
  'foot.affiliate': 'Liens affiliés',
  'foot.credits': 'Crédits photo',
  'foot.rss': 'Flux RSS',
  'foot.affiliateNote': 'Liens affiliés :',
  'foot.affiliateBody':
    'certaines offres nous rapportent une commission. Elle ne change ni votre prix, ni nos notes.',

  'aff.note':
    'Liens affiliés : nous pouvons toucher une commission, sans effet sur votre prix ni sur nos notes.',
  'aff.seeOffer': 'Voir l’offre',
  'aff.atShopNewTab': (shop: string) => ` chez ${shop} (nouvel onglet)`,

  'ad.label': 'PUBLICITÉ',

  '404.title': 'Page introuvable',
  '404.heading': 'Cette page n’existe plus',
  '404.body':
    'Elle a peut-être été fusionnée avec un guide plus récent, ou le jeu a changé de fiche.',
  '404.home': 'Retour à l’accueil',
  '404.latest': 'Nos derniers articles',
};

export const strings: Record<Locale, Dict> = { en, fr };

export type UIKey = keyof Dict;

/* `t` d'une langue : `const t = useT(lang)` puis `t('nav.home')`.
   Les entrées paramétrées restent des fonctions — `t('card.articles')(3)`. */
export const useT = (lang: Locale) => <K extends UIKey>(key: K): Dict[K] => strings[lang][key];
