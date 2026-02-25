'use server';

import { getTenantPrisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { sendTemplatedEmail } from '@/lib/mail';

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

    const user = await (await getTenantPrisma()).user.create({
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

    if (formData.get('sendEmail') === 'on') {
        // Run asynchronously so it doesn't block the UI
        sendTemplatedEmail('Account Creation', email, {
            name: name,
            email: email,
            password: password,
            login_url: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/login` : 'our system'
        });
    }

    revalidatePath('/admin/users');
}

export async function deleteUser(id: number) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const adminRole = session?.user?.role;

    const targetUser = await (await getTenantPrisma()).user.findUnique({ where: { id } });
    if (targetUser?.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to delete Superuser accounts');
    }

    await (await getTenantPrisma()).user.delete({ where: { id } });

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

    const targetUser = await (await getTenantPrisma()).user.findUnique({ where: { id } });

    // Check if trying to upgrade someone to SUPERUSER, or edit an existing SUPERUSER
    if ((role === 'SUPERUSER' || targetUser?.role === 'SUPERUSER') && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to grant or modify Superuser roles');
    }

    await (await getTenantPrisma()).user.update({
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

    const targetUser = await (await getTenantPrisma()).user.findUnique({ where: { id: userId } });
    if (targetUser?.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to reset passwords for Superuser accounts');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await (await getTenantPrisma()).user.update({
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

    const targetUser = await (await getTenantPrisma()).user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');

    if (targetUser.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to modify Superuser 2FA settings');
    }

    const generateBase32Secret = (length: number = 32) => {
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
        ? generateBase32Secret(32)
        : targetUser.twoFactorSecret;

    await (await getTenantPrisma()).user.update({
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

export async function toggleForcePasswordReset(userId: number, force: boolean) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;

    // @ts-ignore
    const adminRole = session?.user?.role;

    const targetUser = await (await getTenantPrisma()).user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');

    if (targetUser.role === 'SUPERUSER' && adminRole !== 'SUPERUSER') {
        throw new Error('Unauthorized to modify Superuser security settings');
    }

    await (await getTenantPrisma()).user.update({
        where: { id: userId },
        data: {
            forcePasswordReset: force
        }
    });

    await logAudit({
        userId: adminId,
        action: 'FORCE_PASSWORD_RESET',
        resource: 'User',
        details: `${force ? 'Enabled' : 'Disabled'} Force Password Reset for user ID ${userId}`,
        severity: 'WARN'
    });

    revalidatePath('/admin/users');
}

export async function provisionEmployeeAccount(empId: number, name: string, email: string, role: string, sendWelcomeEmail: boolean): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;
    // @ts-ignore
    const permissions = session?.user?.permissions as string[] || [];

    if (!permissions.includes('users.manage')) {
        return { success: false, error: 'Unauthorized to provision user accounts' };
    }

    if (!name || !email || !role) {
        return { success: false, error: 'Missing required configuration fields' };
    }

    try {
        // Generate a 12-char random secure temporary password
        const crypto = require('crypto');
        const tempPassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);

        // At least one lowercase, uppercase, and number to pass basic validation if needed later
        const finalTempPassword = tempPassword + 'Aa1';

        const hashedPassword = await bcrypt.hash(finalTempPassword, 10);

        const newUser = await (await getTenantPrisma()).user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                empId: empId,
                forcePasswordReset: true
            }
        });

        await logAudit({
            userId: adminId,
            action: 'CREATE',
            resource: 'User',
            details: `Auto-provisioned User Account ${email} for Employee ID ${empId}`,
            severity: 'WARN'
        });

        if (sendWelcomeEmail) {
            sendTemplatedEmail('Account Creation', email, {
                name: name,
                email: email,
                password: finalTempPassword,
                login_url: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/login` : 'our system'
            });
        }

        revalidatePath(`/employees/${empId}`);
        revalidatePath('/employees');
        revalidatePath('/admin/users');

        return { success: true };
    } catch (e: any) {
        console.error("Account provisioning failed:", e);
        if (e.code === 'P2002') {
            return { success: false, error: 'The email address provided is already registered to another account.' };
        }
        return { success: false, error: e.message || 'Failed to provision account' };
    }
}
