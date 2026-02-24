'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateEmployee(
    currentEmpId: number,
    formData: FormData
) {
    const empName = formData.get('empName') as string;
    const newEmpIdRaw = formData.get('empId') as string;
    const departed = formData.get('departed') === 'on';
    const shiftIdRaw = formData.get('shiftId') as string;
    const shiftId = shiftIdRaw ? parseInt(shiftIdRaw) : null;

    if (!empName || !newEmpIdRaw) {
        throw new Error('Name and ID are required');
    }

    const newEmpId = parseInt(newEmpIdRaw);

    try {
        await prisma.employee.update({
            where: { empId: currentEmpId },
            data: {
                empName,
                empId: newEmpId, // Prisma will update PK and cascade to FKs
                departed,
                shiftId: shiftId
            }
        });
    } catch (error) {
        console.error('Failed to update employee:', error);
        throw new Error('Failed to update employee. ID might be in use.');
    }

    revalidatePath('/employees');
    revalidatePath(`/employees/${newEmpId}`);
    redirect(`/employees/${newEmpId}`);
}

export async function bulkAssignShift(employeeIds: number[], shiftId: number | null): Promise<{ success: boolean, error?: string }> {
    if (!employeeIds || employeeIds.length === 0) {
        return { success: false, error: 'No employees selected' };
    }

    try {
        await prisma.employee.updateMany({
            where: {
                empId: { in: employeeIds }
            },
            data: {
                shiftId: shiftId
            }
        });
    } catch (e: any) {
        console.error('Bulk shift assignment failed:', e);
        return { success: false, error: e.message || 'Failed to perform bulk shift assignment.' };
    }

    revalidatePath('/employees');
    return { success: true };
}

export async function bulkUpdateRole(employeeIds: number[], role: string): Promise<{ success: boolean, error?: string }> {
    if (!employeeIds || employeeIds.length === 0) {
        return { success: false, error: 'No employees selected' };
    }
    if (!role) {
        return { success: false, error: 'Role is required' };
    }

    try {
        await prisma.user.updateMany({
            where: {
                empId: { in: employeeIds }
            },
            data: {
                role: role
            }
        });
    } catch (e: any) {
        console.error('Bulk role update failed:', e);
        return { success: false, error: e.message || 'Failed to update roles.' };
    }

    revalidatePath('/employees');
    return { success: true };
}

export async function bulkUpdateStatus(employeeIds: number[], departed: boolean): Promise<{ success: boolean, error?: string }> {
    if (!employeeIds || employeeIds.length === 0) {
        return { success: false, error: 'No employees selected' };
    }

    try {
        await prisma.employee.updateMany({
            where: {
                empId: { in: employeeIds }
            },
            data: {
                departed: departed
            }
        });
    } catch (e: any) {
        console.error('Bulk status update failed:', e);
        return { success: false, error: e.message || 'Failed to update status.' };
    }

    revalidatePath('/employees');
    return { success: true };
}
