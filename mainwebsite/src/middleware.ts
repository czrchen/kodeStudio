import { defineMiddleware } from 'astro:middleware';
import { isAdmin } from './lib/auth';

export const onRequest = defineMiddleware((ctx, next) => {
  const { pathname } = ctx.url;
  const protectedPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const protectedApi = pathname.startsWith('/api/admin');

  if ((protectedPage || protectedApi) && !isAdmin(ctx.cookies)) {
    if (protectedApi) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    return ctx.redirect('/admin/login');
  }
  return next();
});
