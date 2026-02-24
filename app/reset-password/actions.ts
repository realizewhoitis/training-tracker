'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function submitNewPassword(password: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated.' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: parseInt(session.user.id) },
            data: {
                password: hashedPassword,
                forcePasswordReset: false
            }
        });

        // NextAuth will need to re-evaluate the session on the next request.
        // The edge middleware reads from the JWT which will still have forcePasswordReset=true
        // until a new JWT is issued. However, since the database is updated, the user can logout
        // and log back in, or NextAuth might refresh the token if we force a session update.
        // The easiest path is to instruct the client to sign out so they can sign in with the new password.
        return { success: true };
    } catch (error) {
        console.error('Failed to reset password:', error);
        return { success: false, error: 'Failed to reset password. Please try again later.' };
    }
}
