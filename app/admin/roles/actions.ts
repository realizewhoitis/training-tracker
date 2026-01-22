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
