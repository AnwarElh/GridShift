import { filterIndex, groupResults } from '../lib/search.js';

const $ = (s) => document.querySelector(s);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* thème — le thème clair est un vrai papier, pas un inverse mécanique */
on($('#theme'), 'click', () => {
  const r = document.documentElement;
  r.dataset.theme = r.dataset.theme === 'nuit' ? 'papier' : 'nuit';
  try { localStorage.setItem('gs_theme', r.dataset.theme); } catch {}
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
  let index = null, active = -1;

  const load = async () => {
    if (index) return index;
    index = await fetch('/search.json').then((r) => r.json()).catch(() => []);
    return index;
  };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const row = (r) => `<a class="pop-item" role="option" href="${esc(r.href)}">
      <span><b style="display:block;font-size:var(--ui-sm)">${esc(r.title)}</b>
      <span class="meta">${esc(r.sub || '')}</span></span>
      ${r.score ? `<span class="k" style="font-weight:800;color:var(--sc-${r.bucket})">${esc(r.score)}</span>` : ''}
    </a>`;

  const render = () => {
    const groups = groupResults(filterIndex(index || [], input.value));
    active = -1;
    res.innerHTML = groups.length
      ? groups.map((g) => `<p class="cmd-grp">${g.label}</p>${g.items.map(row).join('')}`).join('')
      : input.value.trim().length < 2
        ? '<p class="cmd-grp">Tapez au moins deux lettres</p>'
        : '<div class="empty"><h3>Aucun résultat</h3><p>Essayez le nom du jeu plutôt que celui du studio.</p></div>';
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

/* carrousel de tête : le défilement natif fait le travail, le script ne
   sert qu'à relier les vignettes de droite et à marquer la diapo lue */
const hero = $('[data-hero]');
if (hero) {
  const track = hero.querySelector('[data-hero-track]');
  const thumbs = [...hero.querySelectorAll('[data-hero-go]')];
  const slides = [...track.children];
  thumbs.forEach((t) => on(t, 'click', () => {
    const el = slides[Number(t.dataset.heroGo)];
    track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const i = slides.indexOf(en.target);
      thumbs.forEach((t, n) => t.setAttribute('aria-current', String(n === i)));
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((s) => io.observe(s));
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
    try { await navigator.clipboard.writeText(location.href); toast('Lien copié'); } catch {}
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

/* newsletter sans fournisseur configuré : on le dit, on ne fait pas semblant */
document.querySelectorAll('form[data-newsletter]').forEach((f) => {
  on(f, 'submit', (e) => {
    e.preventDefault();
    toast('Inscription non configurée', 'Renseignez PUBLIC_NEWSLETTER_ACTION dans .env');
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
