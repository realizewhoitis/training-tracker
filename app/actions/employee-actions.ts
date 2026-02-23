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

export async function bulkAssignShift(employeeIds: number[], shiftId: number | null) {
    if (!employeeIds || employeeIds.length === 0) {
        throw new Error('No employees selected');
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
        throw new Error('Failed to perform bulk shift assignment.');
    }

    revalidatePath('/employees');
}
