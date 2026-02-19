
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/'); // Protect everything for now, can refine later
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isOnLogin) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Redirect to dashboard if already logged in
                return true;
            }

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
