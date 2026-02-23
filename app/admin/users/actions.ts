'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { logAudit } from '@/lib/audit';

export async function createUser(formData: FormData) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const adminRole = session?.user?.role;

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !role) {
        throw new Error('Missing required fields');
    }

    if (role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to create Superuser accounts');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    await logAudit({
        userId: adminId,
        action: 'CREATE',
        resource: 'User',
        details: `Created user ${email} (ID: ${user.id})`,
        severity: 'WARN'
    });

    revalidatePath('/admin/users');
}

export async function deleteUser(id: number) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const adminRole = session?.user?.role;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to delete Superuser accounts');
    }

    await prisma.user.delete({ where: { id } });

    await logAudit({
        userId: adminId,
        action: 'DELETE',
        resource: 'User',
        details: `Deleted user ID ${id}`,
        severity: 'WARN'
    });

    revalidatePath('/admin/users');
}

export async function updateUserRole(id: number, role: string) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const adminRole = session?.user?.role;

    const targetUser = await prisma.user.findUnique({ where: { id } });

    // Check if trying to upgrade someone to SUPERUSER, or edit an existing SUPERUSER
    if ((role === 'SUPERUSER' || targetUser?.role === 'SUPERUSER') && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to grant or modify Superuser roles');
    }

    await prisma.user.update({
        where: { id },
        data: { role }
    });

    await logAudit({
        userId: adminId,
        action: 'UPDATE_ROLE',
        resource: 'User',
        details: `Updated role for user ID ${id} to ${role}`,
        severity: 'WARN'
    });

    revalidatePath('/admin/users');
}

export async function resetPassword(formData: FormData) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const adminRole = session?.user?.role;

    const userId = parseInt(formData.get('userId') as string);
    const newPassword = formData.get('newPassword') as string;

    if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to reset passwords for Superuser accounts');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    await logAudit({
        userId: adminId,
        action: 'RESET_PASSWORD',
        resource: 'User',
        details: `Reset password for user ID ${userId}`,
        severity: 'WARN'
    });

    revalidatePath('/admin/users');
}

export async function toggleTwoFactor(userId: number, enabled: boolean) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const adminRole = session?.user?.role;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');

    if (targetUser.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to modify Superuser 2FA settings');
    }

    const generateBase32Secret = (length: number = 20) => {
        const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        const crypto = require('crypto');
        const bytes = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            secret += base32chars[bytes[i] % 32];
        }
        return secret;
    };

    // If enabling and they don't have a secret yet, generate one
    const newSecret = enabled && !targetUser.twoFactorSecret
        ? generateBase32Secret(20)
        : targetUser.twoFactorSecret;

    await prisma.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: enabled,
            twoFactorSecret: newSecret
        }
    });

    await logAudit({
        userId: adminId,
        action: 'UPDATE_2FA',
        resource: 'User',
        details: `${enabled ? 'Enabled' : 'Disabled'} 2FA for user ID ${userId}`,
        severity: 'WARN'
    });

    revalidatePath('/admin/users');
}
