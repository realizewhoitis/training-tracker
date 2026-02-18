'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateRoleTemplate(formData: FormData) {
    const roleName = formData.get('roleName') as string;
    const permissions = formData.getAll('permissions') as string[];

    if (!roleName) throw new Error('Role name is required');

    // Upsert the template
    const existing = await prisma.roleTemplate.findUnique({
        where: { roleName }
    });

    if (existing) {
        await prisma.roleTemplate.update({
            where: { id: existing.id },
            data: {
                permissions: JSON.stringify(permissions)
            }
        });
    } else {
        await prisma.roleTemplate.create({
            data: {
                roleName,
                permissions: JSON.stringify(permissions)
            }
        });
    }

    revalidatePath('/admin/roles');
}

export async function createRole(roleName: string) {
    if (!roleName) throw new Error('Role name is required');

    // Check if exists
    const existing = await prisma.roleTemplate.findUnique({
        where: { roleName }
    });

    if (existing) {
        throw new Error('Role already exists');
    }

    await prisma.roleTemplate.create({
        data: {
            roleName,
            permissions: JSON.stringify([]) // Start with no permissions
        }
    });

    revalidatePath('/admin/roles');
    revalidatePath('/admin/users'); // Update users page too
}
