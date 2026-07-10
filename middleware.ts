import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // 1. Exclude API routes, static assets, and auth routes from rewrite
  if (path.startsWith('/api') || path.startsWith('/_next') || path.includes('.') || path.startsWith('/login') || path.startsWith('/register')) {
    return NextResponse.next();
  }

  // 2. Check if this is a custom domain (e.g., mybusiness.com)
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  let tenantSlug: string | null = null;

  if (!isLocalhost && !host.includes('localhost')) {
    // Production: try to find tenant by custom domain
    // We'll do a fast lookup in the DB via an API call, but for middleware we can't query DB directly.
    // Instead, we'll rewrite to a resolver endpoint or check against a list.
    // For now, we'll just pass the host as a header to be resolved in the page.
    // Better: we'll let the page fetch the tenant by host.
    // So we set a header and let the page handle it.
    const response = NextResponse.next();
    response.headers.set('x-custom-host', host);
    return response;
  }

  // 3. Localhost subdomain routing (tenant.localhost:3000)
  if (isLocalhost) {
    const parts = host.split('.');
    if (parts.length >= 2) {
      const sub = parts[0];
      if (sub !== 'localhost' && sub !== 'www' && sub !== '127') {
        // Rewrite to /[tenant]
        url.pathname = `/${sub}${path}`;
        return NextResponse.rewrite(url);
      }
    }
    // Default: serve dashboard or root
    if (path === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sites).*)'],
};
