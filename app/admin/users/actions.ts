'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { logAudit } from '@/lib/audit';

export async function createUser(formData: FormData) {
    const session = await auth();
    const adminId = session?.user?.id ? parseInt(session.user.id) : undefined;

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !role) {
        throw new Error('Missing required fields');
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

    const userId = parseInt(formData.get('userId') as string);
    const newPassword = formData.get('newPassword') as string;

    if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
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
