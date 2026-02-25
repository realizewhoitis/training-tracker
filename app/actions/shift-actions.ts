'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Shift } from '@prisma/client';

export async function createShift(name: string): Promise<{ success: boolean; shift?: Shift; error?: string }> {
    if (!name) return { success: false, error: 'Name is required' };

    try {
        const shift = await (await getTenantPrisma()).shift.create({
            data: { name }
        });
        revalidatePath('/employees');
        revalidatePath('/employees/new');
        return { success: true, shift };
    } catch (error) {
        console.error('Failed to create shift:', error);
        return { success: false, error: 'Failed to create shift' };
    }
}

export async function getShifts() {
    return await (await getTenantPrisma()).shift.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function deleteShift(shiftId: number): Promise<{ success: boolean; error?: string }> {
    if (!shiftId) return { success: false, error: 'Shift ID is required' };

    try {
        await (await getTenantPrisma()).$transaction([
            (await getTenantPrisma()).employee.updateMany({
                where: { shiftId: shiftId },
                data: { shiftId: null }
            }),
            (await getTenantPrisma()).shift.delete({
                where: { id: shiftId }
            })
        ]);

        revalidatePath('/employees');
        revalidatePath('/employees/new');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete shift:', error);
        return { success: false, error: error.message || 'Failed to delete shift' };
    }
}
