'use server';

import { auth } from '@/auth';
import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateTOTPSecret, verifyTOTP } from '@/lib/totp';

export async function generateTwoFactorSecret() {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const secret = generateTOTPSecret();
    const label = encodeURIComponent(`Orbit 911:${session.user.email}`);
    const issuer = encodeURIComponent('Orbit 911');
    const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    return { secret, otpauth };
}

export async function enableTwoFactor(secret: string, token: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Not authenticated');

    const isValid = verifyTOTP(token, secret, 2);

    if (!isValid) {
        return { success: false, message: 'Invalid code. Please try again.' };
    }

    await (await getTenantPrisma()).user.update({
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

    await (await getTenantPrisma()).user.update({
        where: { email: session.user.email },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
        }
    });

    revalidatePath('/profile');
}
