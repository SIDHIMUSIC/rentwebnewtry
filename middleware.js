import { NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

const protectedRoutes = ['/dashboard', '/tenants', '/add-tenant']

export function middleware(request) {
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('token')?.value
  const user = token ? verifyToken(token) : null

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tenants/:path*', '/add-tenant/:path*'],
}
