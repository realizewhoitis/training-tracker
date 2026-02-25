'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateUserPermissions(formData: FormData) {
    const userId = parseInt(formData.get('userId') as string);
    const useDefaults = formData.get('useDefaults') === 'on';
    const permissions = formData.getAll('permissions') as string[];

    if (!userId) throw new Error('User ID is required');

    await (await getTenantPrisma()).user.update({
        where: { id: userId },
        data: {
            customPermissions: useDefaults ? null : JSON.stringify(permissions)
        }
    });

    revalidatePath(`/admin/users`);
    revalidatePath(`/admin/users/${userId}/permissions`);
}
