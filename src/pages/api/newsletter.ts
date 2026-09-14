/* Inscription à la lettre — POST /api/newsletter.
 *
 * Le formulaire poste ici depuis chaque page qui porte un bloc lettre.
 * L'adresse est validée côté serveur (le client fait sa propre passe,
 * mais le serveur est le dernier mot), puis insérée dans D1.
 *
 * INSERT OR IGNORE rend l'opération idempotente : un lecteur qui clique
 * deux fois ne voit pas d'erreur et n'est compté qu'une fois. On renvoie
 * quand même un champ `duplicate` pour que le client puisse adapter son
 * message s'il le souhaite. */
import type { APIRoute } from 'astro';
import type { D1Like } from '../../lib/db.ts';

/* Validation minimale mais suffisante : un caractère avant l'arobase, un point
   après, et une longueur raisonnable. Le reste est l'affaire du MTA. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 320; /* RFC 5321 */

interface Runtime {
  env?: { DB?: D1Like };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const db = (locals as { runtime?: Runtime }).runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ ok: false, error: 'database unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  /* Accepter FormData (submit natif) et JSON (fetch). */
  let email: string | undefined;
  let lang = 'en';
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    try {
      const body = await request.json() as Record<string, unknown>;
      email = typeof body.email === 'string' ? body.email : undefined;
      if (typeof body.lang === 'string') lang = body.lang;
    } catch { /* corps invalide — email restera undefined */ }
  } else {
    const fd = await request.formData();
    email = fd.get('email')?.toString();
    lang = fd.get('lang')?.toString() ?? lang;
  }

  /* Deviner la langue depuis le Referer si le formulaire ne l'a pas envoyée. */
  if (lang === 'en') {
    const ref = request.headers.get('referer') ?? '';
    if (/\/fr(\/|$)/.test(ref)) lang = 'fr';
    else if (/\/de(\/|$)/.test(ref)) lang = 'de';
  }

  email = email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > MAX_LEN) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid email' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  /* Vérifier si l'adresse existe déjà. */
  const { results } = await db
    .prepare('SELECT 1 FROM newsletter_subscribers WHERE email = ?')
    .bind(email)
    .all<{ 1: number }>();

  if (results.length > 0) {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    await db
      .prepare('INSERT OR IGNORE INTO newsletter_subscribers (email, lang) VALUES (?, ?)')
      .bind(email, lang)
      .run();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'write failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
