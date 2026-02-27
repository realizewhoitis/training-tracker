import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const url = new URL(req.url);
    const headers = new Headers(req.headers);
    headers.set('x-pathname', url.pathname);

    return NextResponse.next({
        request: {
            headers
        }
    });
});

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
