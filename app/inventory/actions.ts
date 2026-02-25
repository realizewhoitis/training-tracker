'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function assignAsset(formData: FormData) {
    const assetId = parseInt(formData.get('assetId') as string);
    const employeeId = parseInt(formData.get('employeeId') as string);

    if (!employeeId || !assetId) return;

    // Check if already assigned to prevent race condition
    const freshAsset = await (await getTenantPrisma()).asset.findUnique({ where: { id: assetId } });
    if (freshAsset?.status === 'ASSIGNED') return;

    await (await getTenantPrisma()).$transaction([
        (await getTenantPrisma()).assetAssignment.create({
            data: {
                assetId: assetId,
                employeeId: employeeId,
                notes: formData.get('notes') as string
            }
        }),
        (await getTenantPrisma()).asset.update({
            where: { id: assetId },
            data: { status: 'ASSIGNED' }
        })
    ]);

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
    revalidatePath(`/employees/${employeeId}`);
}

export async function returnAsset(formData: FormData) {
    const assignmentId = parseInt(formData.get('assignmentId') as string);
    const assetId = parseInt(formData.get('assetId') as string);
    const condition = formData.get('condition') as string;

    await (await getTenantPrisma()).$transaction([
        (await getTenantPrisma()).assetAssignment.update({
            where: { id: assignmentId },
            data: { returnedAt: new Date() }
        }),
        (await getTenantPrisma()).asset.update({
            where: { id: assetId },
            data: {
                status: 'AVAILABLE',
                condition: condition
            }
        })
    ]);

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
    // It's probably fine as the employee page will be fresh on navigation.
}

export async function createCategory(name: string) {
    if (!name) return;

    await (await getTenantPrisma()).assetCategory.create({
        data: { name }
    });

    revalidatePath('/inventory/new');
}
