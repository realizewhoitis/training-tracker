'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from "@/lib/audit";
import { auth } from "@/auth";

export async function addAttendee(trainingId: number, formData: FormData) {
    const session = await auth();
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : undefined;

    const employeeId = parseInt(formData.get('employeeId') as string);
    const dateStr = formData.get('date') as string;
    const hours = parseFloat(formData.get('hours') as string);
    const note = formData.get('note') as string;

    if (!employeeId || !dateStr || isNaN(hours)) {
        throw new Error("Missing required fields");
    }

    const attendanceDate = new Date(dateStr);

    try {
        await prisma.attendance.create({
            data: {
                trainingID: trainingId,
                employeeID: employeeId,
                attendanceDate: attendanceDate,
                attendanceHours: hours,
                attendanceNote: note
            }
        });

        await logAudit({
            userId: currentUserId,
            action: 'CREATE_ATTENDANCE',
            resource: 'Attendance',
            details: `Added Employee ${employeeId} to Training ${trainingId}`,
            severity: 'INFO'
        });

        revalidatePath(`/training/${trainingId}`);
        revalidatePath(`/training`);
        return { success: true };
    } catch (e) {
        console.error("Failed to add attendee:", e);
        return { success: false, error: "Failed to add attendee" };
    }
}

export async function removeAttendee(attendanceId: number, trainingId: number) {
    const session = await auth();
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : undefined;

    try {
        await prisma.attendance.delete({
            where: { attendanceID: attendanceId }
        });

        await logAudit({
            userId: currentUserId,
            action: 'DELETE_ATTENDANCE',
            resource: 'Attendance',
            details: `Removed Attendance ${attendanceId}`,
            severity: 'INFO'
        });

        revalidatePath(`/training/${trainingId}`);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to remove attendee" };
    }
}

export type BulkAttendeeEntry = {
    employeeId: number;
    date: Date;
    hours: number;
    note: string;
};

export async function bulkAddAttendees(trainingId: number, entries: BulkAttendeeEntry[]) {
    const session = await auth();
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : undefined;

    let successCount = 0;
    const errors: string[] = [];

    // Process sequentially but don't fail all on one error (match Bulk Upload behavior)
    for (const entry of entries) {
        try {
            await prisma.attendance.create({
                data: {
                    trainingID: trainingId,
                    employeeID: entry.employeeId,
                    attendanceDate: entry.date,
                    attendanceHours: entry.hours,
                    attendanceNote: entry.note
                }
            });
            successCount++;
        } catch (e) {
            console.error(`Failed to add bulk attendee ${entry.employeeId}:`, e);
            errors.push(`Failed to add Employee ${entry.employeeId}`);
        }
    }

    if (successCount > 0) {
        await logAudit({
            userId: currentUserId,
            action: 'BULK_CREATE',
            resource: 'Attendance',
            details: `Bulk added ${successCount} attendees to Training ${trainingId}`,
            severity: 'INFO'
        });

        revalidatePath(`/training/${trainingId}`);
        revalidatePath(`/training`);
    }

    return { successCount, errors };
}
