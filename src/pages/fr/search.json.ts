import type { APIRoute } from 'astro';
import { searchIndex } from '../../lib/searchIndex';
export const GET: APIRoute = async ({ locals }) =>
  new Response(JSON.stringify(await searchIndex(locals, 'fr')), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
