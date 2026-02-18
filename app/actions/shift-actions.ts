'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createShift(name: string) {
    if (!name) return;

    try {
        await prisma.shift.create({
            data: { name }
        });
        revalidatePath('/employees');
        revalidatePath('/employees/new');
        return { success: true };
    } catch (error) {
        console.error('Failed to create shift:', error);
        return { success: false, error: 'Failed to create shift' };
    }
}

export async function getShifts() {
    return await prisma.shift.findMany({
        orderBy: { name: 'asc' }
    });
}
