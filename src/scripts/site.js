import { filterIndex, groupResults } from '../lib/search.js';

const $ = (s) => document.querySelector(s);
/* Les libellés viennent du HTML rendu par Astro, qui seul connaît la langue
   de la page : aucune chaîne visible n'est écrite dans ce fichier. */
const S = document.body.dataset;
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* thème — le thème clair est un vrai papier, pas un inverse mécanique.
   `theme-color` suit le thème CHOISI : il était accroché à prefers-color-scheme
   alors que le thème vient de data-theme, donc le chrome du navigateur
   contredisait la page dès qu'on basculait. */
const themeBtn = $('#theme');
function paintTheme(t) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'papier' ? '#EDEFF3' : '#0E1016');
  if (themeBtn) themeBtn.setAttribute('aria-label', t === 'papier' ? S.themeDark : S.themeLight);
}
paintTheme(document.documentElement.dataset.theme);
on(themeBtn, 'click', () => {
  const r = document.documentElement;
  r.dataset.theme = r.dataset.theme === 'nuit' ? 'papier' : 'nuit';
  try { localStorage.setItem('gs_theme', r.dataset.theme); } catch {}
  paintTheme(r.dataset.theme);
});

/* consentement — rien de la régie n'est chargé avant un « oui » explicite.
   Le choix vit dans localStorage : le site est statique, il n'y a pas de
   serveur pour le retenir, et il n'a pas à quitter la machine du lecteur. */
const KEY = 'gs_consent';
const readConsent = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

function loadAds(client) {
  if (!client || document.getElementById('gs-ads')) return;
  const sc = document.createElement('script');
  sc.id = 'gs-ads';
  sc.async = true;
  sc.crossOrigin = 'anonymous';
  sc.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
  document.head.append(sc);
}

const consent = $('#consent');
if (consent) {
  const client = consent.dataset.adsense;
  const answer = readConsent();
  if (answer === 'yes') loadAds(client);
  else if (answer !== 'no') consent.hidden = false;

  consent.querySelectorAll('[data-consent]').forEach((b) => on(b, 'click', () => {
    const value = b.dataset.consent;
    try { localStorage.setItem(KEY, value); } catch {}
    consent.hidden = true;
    if (value === 'yes') loadAds(client);
  }));
}

/* la page Cookies permet de revenir sur le choix — sinon le consentement
   serait donné une fois pour toutes, ce qui n'en est pas un */
on($('[data-consent-reset]'), 'click', () => {
  try { localStorage.removeItem(KEY); } catch {}
  const c = $('#consent');
  toast(c?.dataset.resetTitle ?? '', c?.dataset.resetBody ?? '');
});

/* méga-menu */
const mega = $('#mega'), megaBtn = $('#megaBtn');
if (mega && megaBtn) {
  const setMega = (open) => { mega.hidden = !open; megaBtn.setAttribute('aria-expanded', String(open)); };
  on(megaBtn, 'click', (e) => { e.stopPropagation(); setMega(mega.hidden); });
  on(document, 'click', (e) => { if (!mega.contains(e.target) && e.target !== megaBtn) setMega(false); });
  on(document, 'keydown', (e) => { if (e.key === 'Escape') setMega(false); });
}

/* recherche : ⌘K est le raccourci attendu, y compris hors SaaS */
const cmd = $('#cmd');
if (cmd) {
  const input = $('#cmdInput'), res = $('#cmdRes');
  let index = null, active = -1, indexBroken = false;

  const load = async () => {
    if (index) return index;
    try {
      const r = await fetch(cmd.dataset.index);
      if (!r.ok) throw new Error(r.status);
      index = await r.json();
      indexBroken = false;
    } catch {
      /* dire que l'index n'a pas chargé, pas que la recherche n'a rien trouvé :
         renvoyer « Aucun résultat » sur une panne réseau accuse la requête */
      index = [];
      indexBroken = true;
    }
    return index;
  };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const row = (r) => `<a class="pop-item" role="option" href="${esc(r.href)}">
      <span><b style="display:block;font-size:var(--ui-sm)">${esc(r.title)}</b>
      <span class="meta">${esc(r.sub || '')}</span></span>
      ${r.score ? `<span class="k" style="font-weight:800;color:var(--sc-${r.bucket})">${esc(r.score)}</span>` : ''}
    </a>`;

  const groupLabels = {
    game: cmd.dataset.grpGame, news: cmd.dataset.grpNews, review: cmd.dataset.grpReview,
    guide: cmd.dataset.grpGuide, setup: cmd.dataset.grpSetup,
  };
  const render = () => {
    const groups = groupResults(filterIndex(index || [], input.value), groupLabels);
    active = -1;
    res.innerHTML = groups.length
      ? groups.map((g) => `<p class="cmd-grp">${g.label}</p>${g.items.map(row).join('')}`).join('')
      : indexBroken
        ? `<div class="empty"><h3>${esc(cmd.dataset.msgBrokenTitle)}</h3><p>${esc(cmd.dataset.msgBrokenBody)}</p></div>`
        : input.value.trim().length < 2
          ? `<p class="cmd-grp">${esc(cmd.dataset.msgMin)}</p>`
          : `<div class="empty"><h3>${esc(cmd.dataset.msgEmptyTitle)}</h3><p>${esc(cmd.dataset.msgEmptyBody)}</p></div>`;
  };

  const openCmd = async () => { cmd.showModal(); input.focus(); await load(); render(); };
  document.querySelectorAll('[data-search]').forEach((el) => on(el, 'click', (e) => { e.preventDefault(); openCmd(); }));
  on($('#cmdClose'), 'click', () => cmd.close());
  on(input, 'input', render);
  on(document, 'keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd(); }
  });
  on(cmd, 'keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
    const items = [...res.querySelectorAll('.pop-item')];
    if (!items.length) return;
    if (e.key === 'Enter') { if (active >= 0) { e.preventDefault(); items[active].click(); } return; }
    e.preventDefault();
    active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
    items.forEach((el, i) => el.setAttribute('aria-selected', String(i === active)));
    items[active].scrollIntoView({ block: 'nearest' });
  });
}

/* onglets, segments, filtres : un seul gestionnaire pour trois motifs */
document.querySelectorAll('.tabs, .seg, .chipbar').forEach((group) => {
  on(group, 'click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !group.contains(btn)) return;
    const attr = group.classList.contains('tabs') ? 'aria-selected' : 'aria-pressed';
    if (!btn.hasAttribute(attr)) return;
    /* les filtres de la barre à jetons sont cumulables, les onglets exclusifs */
    if (group.classList.contains('chipbar')) {
      btn.setAttribute(attr, String(btn.getAttribute(attr) !== 'true'));
      group.dispatchEvent(new CustomEvent('gs:filter', { bubbles: true }));
      return;
    }
    group.querySelectorAll('[' + attr + ']').forEach((x) => x.setAttribute(attr, 'false'));
    btn.setAttribute(attr, 'true');
    selectTab(group, btn);
  });

  /* motif onglets : tabindex mobile + flèches, comme l'attend un lecteur d'écran */
  if (!group.classList.contains('tabs')) return;
  on(group, 'keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
    if (!(e.key in keys)) return;
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const next = keys[e.key] === 'first' ? tabs[0]
      : keys[e.key] === 'last' ? tabs[tabs.length - 1]
      : tabs[(i + keys[e.key] + tabs.length) % tabs.length];
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === next)));
    selectTab(group, next);
    next.focus();
  });
});

function selectTab(group, btn) {
  group.querySelectorAll('[role="tab"]').forEach((t) => {
    t.tabIndex = t === btn ? 0 : -1;
  });
  const panel = btn.dataset.panel;
  if (panel) document.querySelectorAll('[data-tabpanel]').forEach((p) => { p.hidden = p.dataset.tabpanel !== panel; });
}

/* filtres d'archive : purement client, l'URL reste propre et la page reste statique */
const grid = $('[data-filterable]');
if (grid) {
  const count = $('[data-count]');
  const none = $('#noResults');
  const apply = () => {
    const active = [...document.querySelectorAll('.chipbar [aria-pressed="true"]')]
      .map((b) => b.dataset.filter).filter(Boolean);
    let shown = 0;
    grid.querySelectorAll('[data-tags]').forEach((el) => {
      const tags = el.dataset.tags.split('|');
      const hit = active.length === 0 || active.some((f) => tags.includes(f));
      el.hidden = !hit;
      if (hit) shown++;
    });
    if (count) count.textContent = String(shown);
    /* une grille vide n'explique rien : on dit pourquoi et on offre la sortie */
    if (none) { none.hidden = shown > 0; grid.hidden = shown === 0; }
  };
  on(document, 'gs:filter', apply);
  on($('[data-clear-filters]'), 'click', () => {
    document.querySelectorAll('.chipbar [aria-pressed="true"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    apply();
  });
}

/* barre de contexte de lecture : n'apparaît qu'une fois dans l'article */
const ctx = $('#ctxbar'), readbar = $('#readbar'), art = $('#article-body');
if (ctx && art) {
  let queued = false;
  const update = () => {
    const top = art.offsetTop, h = art.offsetHeight, y = scrollY + innerHeight * 0.3;
    const inside = y > top && y < top + h;
    ctx.classList.toggle('on', inside);
    if (inside) readbar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, (y - top) / h)).toFixed(3) + ')';
    queued = false;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* partage : l'API native sur mobile, le presse-papier ailleurs */
document.querySelectorAll('[data-share]').forEach((btn) => {
  on(btn, 'click', async () => {
    const data = { title: document.title, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} return; }
    try { await navigator.clipboard.writeText(location.href); toast(S.shareCopied); } catch {}
  });
});

/* sommaire d'un guide : surligne l'étape lue */
const stepLinks = [...document.querySelectorAll('.steps a[href^="#"]')];
if (stepLinks.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      stepLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)));
    });
  }, { rootMargin: '-15% 0px -70% 0px' });
  stepLinks.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });
}

/* notifications */
function toast(title, detail = '') {
  const stack = $('#toasts');
  if (!stack) return;
  const t = document.createElement('div');
  t.className = 'toast t-ok';
  t.innerHTML = `<div><b></b><span></span></div>`;
  t.querySelector('b').textContent = title;
  t.querySelector('span').textContent = detail;
  stack.append(t);
  setTimeout(() => t.remove(), 4200);
  if (stack.children.length > 3) stack.firstElementChild?.remove();
}

/* Lettre : un seul gestionnaire pour la validation, l'état d'envoi et le cas
   « fournisseur non configuré ». En deux gestionnaires, une adresse invalide
   déclenchait AUSSI le message de configuration — deux réponses pour une
   seule erreur. Le formulaire porte `novalidate` : le message va sous le
   champ, pas dans une bulle native qui saute au premier clic. */
document.querySelectorAll('.news-form').forEach((f) => {
  const input = f.querySelector('input[type="email"]');
  const btn = f.querySelector('button[type="submit"]');
  const msg = document.getElementById(input?.getAttribute('aria-describedby') ?? '');

  const setError = (text) => {
    if (msg) { msg.textContent = text; msg.hidden = false; }
    input?.setAttribute('aria-invalid', 'true');
    input?.focus();
  };
  const clearError = () => {
    if (msg) { msg.hidden = true; msg.textContent = ''; }
    input?.removeAttribute('aria-invalid');
  };
  on(input, 'input', clearError);

  on(f, 'submit', (e) => {
    clearError();
    if (!input.value.trim()) {
      e.preventDefault();
      setError(S.newsEmpty);
      return;
    }
    if (!input.checkValidity()) {
      e.preventDefault();
      setError(S.newsInvalid);
      return;
    }
    if (f.hasAttribute('data-newsletter')) {
      /* pas de fournisseur : on le dit, on ne fait pas semblant d'avoir inscrit */
      e.preventDefault();
      toast(S.newsUnconfigured, S.newsUnconfiguredBody);
      return;
    }
    /* la requête part : le bouton se verrouille et le dit */
    if (btn) { btn.disabled = true; btn.textContent = S.newsSending; }
  });
});

/* la barre de consensus se dessine à la révélation — le seul mouvement décoratif du système */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io2 = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const fill = en.target, to = fill.style.transform;
      fill.style.transform = 'scaleX(0)';
      requestAnimationFrame(() => { fill.style.transform = to; });
      obs.unobserve(fill);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.consensus .fill').forEach((f) => io2.observe(f));
}
