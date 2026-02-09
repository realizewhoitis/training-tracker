
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const counts = {
            employees: await prisma.employee.count(),
            trainings: await prisma.training.count(),
            attendances: await prisma.attendance.count(),
            certificates: await prisma.certificate.count(),
            expirations: await prisma.expiration.count(),
            exclusions: await prisma.certificateTrainingExclusion.count(),
        };

        const sampleAttendance = await prisma.attendance.findFirst({
            include: { employee: true, training: true }
        });

        const debugInfo = {
            counts,
            sampleAttendance: sampleAttendance ? {
                id: sampleAttendance.attendanceID,
                employee: sampleAttendance.employee?.empName || 'MISSING LINK',
                training: sampleAttendance.training?.TrainingName || 'MISSING LINK'
            } : 'No attendance records found'
        };

        return NextResponse.json(debugInfo);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
