import NextAuth, { CredentialsSignin } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

class TwoFactorRequiredError extends CredentialsSignin {
    code = '2FA_REQUIRED';
    constructor() {
        super('2FA_REQUIRED');
        this.name = 'TwoFactorRequiredError';
    }
}

class TwoFactorInvalidError extends CredentialsSignin {
    code = '2FA_INVALID';
    constructor() {
        super('2FA_INVALID');
        this.name = 'TwoFactorInvalidError';
    }
}
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { DEFAULT_ROLE_PERMISSIONS, Permission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

// In-Memory Rate Limiting Dictionary
// For production scale with multiple instances, use Redis. For standard/single-instance, global Map is sufficient.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record) {
        if (now > record.resetAt) {
            rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
            return true;
        } else if (record.count >= MAX_ATTEMPTS) {
            return false;
        } else {
            record.count++;
            return true;
        }
    } else {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }
}

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
            async authorize(credentials, request) {
                // Determine remote IP for Rate Limiting
                // @ts-ignore - Next-Auth Request objects sometimes lack precise typing for generic headers in v5
                const ip = request?.headers?.get('x-forwarded-for') || request?.headers?.get('x-real-ip') || 'unknown';

                if (ip !== 'unknown' && !checkRateLimit(ip)) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }

                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6),
                        twoFactorCode: z.string().optional()
                    })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password, twoFactorCode } = parsedCredentials.data;
                    const normalizedEmail = email.toLowerCase();
                    const user = await getUser(normalizedEmail);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (!passwordsMatch) return null;

                    if (user.twoFactorEnabled && user.twoFactorSecret) {
                        try {
                            const { OTP } = await import('otplib');
                            const totp = new OTP();

                            // If code is not provided, send it via email
                            if (!twoFactorCode) {
                                const token = await totp.generate({ secret: user.twoFactorSecret });
                                const { sendTwoFactorTokenEmail } = await import('@/lib/mail');
                                await sendTwoFactorTokenEmail(email, token);
                                throw new TwoFactorRequiredError();
                            }

                            const result = await totp.verify({ token: twoFactorCode, secret: user.twoFactorSecret, epochTolerance: 5 });
                            if (!result.valid) throw new TwoFactorInvalidError();
                        } catch (e: any) {
                            if (e instanceof TwoFactorRequiredError || e.code === '2FA_REQUIRED' || e.message?.includes('2FA_REQUIRED')) {
                                throw new TwoFactorRequiredError();
                            }
                            if (e instanceof TwoFactorInvalidError || e.code === '2FA_INVALID' || e.message?.includes('2FA_INVALID')) {
                                throw new TwoFactorInvalidError();
                            }
                            console.error('2FA Error', e);
                            throw e;
                        }
                    }

                    return { ...user, id: user.id.toString() };
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
                // @ts-ignore
                token.agencyId = user.agencyId;
                // @ts-ignore
                token.forcePasswordReset = user.forcePasswordReset;

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
                session.user.agencyId = token.agencyId as string | null;
                // @ts-ignore
                session.user.forcePasswordReset = token.forcePasswordReset as boolean;
                // @ts-ignore
                session.user.permissions = token.permissions as string[];
            }
            return session;
        }
    },
    events: {
        async signIn({ user }) {
            if (user.id) {
                try {
                    await logAudit({
                        userId: parseInt(user.id),
                        action: 'LOGIN',
                        resource: 'Auth',
                        details: 'User logged in',
                        severity: 'INFO'
                    });
                } catch (e) {
                    console.error('Audit log failed', e);
                }
            }
        },
        async signOut(message) {
            const token = 'token' in message ? message.token : null;
            if (token?.id) {
                try {
                    await logAudit({
                        userId: parseInt(token.id as string),
                        action: 'LOGOUT',
                        resource: 'Auth',
                        details: 'User logged out',
                        severity: 'INFO'
                    });
                } catch (e) {
                    console.error('Audit log failed', e);
                }
            }
        }
    }
});
