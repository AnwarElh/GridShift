import type { APIRoute } from 'astro';
import { markdownResponse } from '../../lib/articleMarkdown.ts';
import { site } from '../../site.ts';

export const prerender = false;

export const GET: APIRoute = ({ params, locals, site: astroSite }) =>
  markdownResponse(
    locals, 'en', params.section!, params.slug!,
    (astroSite ?? new URL(site.url)).origin,
  );
