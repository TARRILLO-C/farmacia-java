import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('sgf_auth_token')?.value ||
    request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Si ya tiene sesión activa y navega a /login, llevarlo al dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Proteger todas las rutas bajo /dashboard: si no hay token, redirigir a /login
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. La raíz '/' es la página pública con el catálogo y sliders
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
