'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Shift } from '@prisma/client';

export async function createShift(name: string): Promise<{ success: boolean; shift?: Shift; error?: string }> {
    if (!name) return { success: false, error: 'Name is required' };

    try {
        const shift = await prisma.shift.create({
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
    return await prisma.shift.findMany({
        orderBy: { name: 'asc' }
    });
}
