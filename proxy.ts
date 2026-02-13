import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnLogin = req.nextUrl.pathname.startsWith('/login');

    // Allow public access to specific paths (api, static, images)
    // Note: The matcher in config handles most of this, but explicit check here is safer
    const isPublic =
        req.nextUrl.pathname.startsWith('/api/auth') || // Allow auth API routes
        req.nextUrl.pathname.startsWith('/_next') ||
        req.nextUrl.pathname.startsWith('/static') ||
        req.nextUrl.pathname.endsWith('.png') ||
        req.nextUrl.pathname.endsWith('.ico');

    if (!isLoggedIn && !isOnLogin && !isPublic) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    if (isLoggedIn && isOnLogin) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', req.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
});

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
