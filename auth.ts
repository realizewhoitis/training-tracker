
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { DEFAULT_ROLE_PERMISSIONS, Permission } from '@/lib/permissions';

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

async function getEffectivePermissions(user: any): Promise<string[]> {
    // 1. Check for custom overrides
    if (user.customPermissions) {
        return JSON.parse(user.customPermissions);
    }

    // 2. Check for DB-based Role Template
    const template = await prisma.roleTemplate.findUnique({
        where: { roleName: user.role }
    });

    if (template) {
        return JSON.parse(template.permissions);
    }

    // 3. Fallback to code defaults
    return DEFAULT_ROLE_PERMISSIONS[user.role] || [];
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return { ...user, id: user.id.toString() };
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;

                // Fetch permissions
                const fullUser = await getUser(user.email!);
                const perms = await getEffectivePermissions(fullUser);
                token.permissions = perms;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.role = token.role as string;
                // @ts-ignore
                session.user.permissions = token.permissions as string[];
            }
            return session;
        }
    }
});
