'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Dynamic imports to handle optional dependency during dev
async function getAuthenticator() {
    const { authenticator } = await import('otplib');
    return authenticator;
}

export async function generateTwoFactorSecret() {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const authenticator = await getAuthenticator();
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(session.user.email, 'Orbit 911', secret);

    return { secret, otpauth };
}

export async function enableTwoFactor(secret: string, token: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const authenticator = await getAuthenticator();
    const isValid = authenticator.check(token, secret);

    if (!isValid) {
        return { success: false, message: 'Invalid code. Please try again.' };
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            twoFactorSecret: secret,
            twoFactorEnabled: true
        }
    });

    revalidatePath('/profile');
    return { success: true };
}

export async function disableTwoFactor() {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    await prisma.user.update({
        where: { email: session.user.email },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
        }
    });

    revalidatePath('/profile');
}
