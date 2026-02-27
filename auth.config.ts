
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // Run on Edge middleware to decode token properties into auth object
        session({ session, token }) {
            if (session.user && token) {
                // @ts-ignore
                session.user.forcePasswordReset = token.forcePasswordReset;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/'); // Protect everything for now, can refine later
            const isOnLogin = nextUrl.pathname.startsWith('/login');
            const isOnReset = nextUrl.pathname.startsWith('/reset-password');

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Redirect to dashboard if already logged in
                return true;
            }

            // Global interception for forced password resets
            // @ts-ignore
            if (isLoggedIn && auth?.user?.forcePasswordReset) {
                if (!isOnReset) {
                    return Response.redirect(new URL('/reset-password', nextUrl));
                }
                return true; // Allow them to hit the reset page
            }

            // Normal authorization flows

            // If identifying generic static assets, allow them
            if (nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/static')) {
                return true;
            }

            // Allow setup route for database initialization
            if (nextUrl.pathname.startsWith('/setup')) {
                return true;
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
