const SITES_ORIGIN = 'https://loompass-garment-readiness.iratul825.chatgpt.site';

/**
 * Keep the public Vercel experience connected to the durable Sites backend.
 * Sites builds never enter this branch, so their native D1/R2 bindings remain
 * the source of truth.
 */
export async function proxyPublicApiToSites(request: Request) {
  if (!process.env.VERCEL) return null;

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, SITES_ORIGIN);
  const method = request.method.toUpperCase();
  const origin = request.headers.get('origin');
  if (
    method !== 'GET' &&
    method !== 'HEAD' &&
    origin &&
    origin !== incoming.origin
  ) {
    return Response.json(
      { error: 'Cross-origin changes are not allowed.' },
      { status: 403 },
    );
  }
  const headers = new Headers(request.headers);
  for (const name of [
    'host',
    'origin',
    'referer',
    'content-length',
    'accept-encoding',
    'x-forwarded-host',
    'x-forwarded-proto',
  ]) headers.delete(name);

  const upstream = await fetch(target, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer(),
    cache: 'no-store',
    redirect: 'manual',
  });
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.set('x-fabripass-backend', 'sites');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
