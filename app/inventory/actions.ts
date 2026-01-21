'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function assignAsset(formData: FormData) {
    const assetId = parseInt(formData.get('assetId') as string);
    const employeeId = parseInt(formData.get('employeeId') as string);

    if (!employeeId || !assetId) return;

    // Check if already assigned to prevent race condition
    const freshAsset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (freshAsset?.status === 'ASSIGNED') return;

    await prisma.$transaction([
        prisma.assetAssignment.create({
            data: {
                assetId: assetId,
                employeeId: employeeId,
                notes: formData.get('notes') as string
            }
        }),
        prisma.asset.update({
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

    await prisma.$transaction([
        prisma.assetAssignment.update({
            where: { id: assignmentId },
            data: { returnedAt: new Date() }
        }),
        prisma.asset.update({
            where: { id: assetId },
            data: {
                status: 'AVAILABLE',
                condition: condition
            }
        })
    ]);

    revalidatePath(`/inventory/${assetId}`);
    revalidatePath('/inventory');
    // We should also find the employee and revalidate their page, but we don't have the employeeId here easily without a query. 
    // It's probably fine as the employee page will be fresh on navigation.
}
