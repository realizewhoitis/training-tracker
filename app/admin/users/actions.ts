'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !role) {
        throw new Error('Missing required fields');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    revalidatePath('/admin/users');
}

export async function deleteUser(id: number) {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
}

export async function updateUserRole(id: number, role: string) {
    await prisma.user.update({
        where: { id },
        data: { role }
    });
    revalidatePath('/admin/users');
}

export async function resetPassword(formData: FormData) {
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

    revalidatePath('/admin/users');
}
