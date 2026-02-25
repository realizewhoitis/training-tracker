
import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';

export async function GET() {
    try {
        const counts = {
            employees: await (await getTenantPrisma()).employee.count(),
            trainings: await (await getTenantPrisma()).training.count(),
            attendances: await (await getTenantPrisma()).attendance.count(),
            certificates: await (await getTenantPrisma()).certificate.count(),
            expirations: await (await getTenantPrisma()).expiration.count(),
            exclusions: await (await getTenantPrisma()).certificateTrainingExclusion.count(),
        };

        const sampleAttendance = await (await getTenantPrisma()).attendance.findFirst({
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
