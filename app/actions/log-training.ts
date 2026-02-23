'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from "@/lib/audit";

export type TrainingLogEntry = {
    employeeId: number;
    trainingId: number;
    date: Date;
    hours: number;
    note?: string;
};

export async function submitTrainingLogs(entries: TrainingLogEntry[]) {
    let successCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
        try {
            // Basic validation: Check if Employee and Training exist
            const emp = await prisma.employee.findUnique({ where: { empId: entry.employeeId } });
            if (!emp) {
                errors.push(`Employee ID ${entry.employeeId} not found`);
                continue;
            }

            const training = await prisma.training.findUnique({ where: { TrainingID: entry.trainingId } });
            if (!training) {
                errors.push(`Training ID ${entry.trainingId} not found`);
                continue;
            }

            await prisma.attendance.create({
                data: {
                    employeeID: entry.employeeId,
                    trainingID: entry.trainingId,
                    attendanceDate: entry.date,
                    attendanceHours: entry.hours,
                    attendanceNote: entry.note || "Bulk Import",
                    attendanceHealth: true // Default
                }
            });
            successCount++;

        } catch (e) {
            console.error(e);
            errors.push(`Error saving record for Emp ${entry.employeeId}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }

    revalidatePath('/training');
    revalidatePath('/employees');

    return { successCount, errors };
}

export async function submitRoster(
    trainingId: number,
    date: Date,
    hours: number,
    employeeIds: number[],
    note?: string
) {
    if (!employeeIds.length) {
        return { success: false, error: 'No employees selected.' };
    }

    try {
        // Basic validation: Check if Training exists
        const training = await prisma.training.findUnique({ where: { TrainingID: trainingId } });
        if (!training) {
            return { success: false, error: `Training ID ${trainingId} not found.` };
        }

        const data = employeeIds.map(empId => ({
            employeeID: empId,
            trainingID: trainingId,
            attendanceDate: date,
            attendanceHours: hours,
            attendanceNote: note || "Virtual Roster",
            attendanceHealth: true
        }));

        const result = await prisma.attendance.createMany({
            data,
            skipDuplicates: true // In case someone clicks twice fast
        });

        await logAudit({
            action: 'CREATE',
            resource: 'Virtual Roster',
            details: `Logged ${result.count} employees for Training ID ${trainingId}`,
            severity: 'INFO'
        });

        revalidatePath('/training');
        revalidatePath('/employees');

        return { success: true, count: result.count };

    } catch (e) {
        console.error("Roster submission error:", e);
        return { success: false, error: e instanceof Error ? e.message : 'Unknown error occurred.' };
    }
}
