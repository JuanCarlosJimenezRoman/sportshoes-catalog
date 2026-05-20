import { NextResponse } from 'next/server';

export function middleware(request) {
  // Solo verificar rutas de admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Para API requests
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, message: 'No autorizado' },
          { status: 401 }
        );
      }
      
      // Para páginas
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};