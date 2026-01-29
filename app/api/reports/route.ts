import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await auth();
    // Allow any authenticated user
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    try {
        if (type === 'roster') {
            const employees = await prisma.employee.findMany({
                where: { departed: false },
                include: {
                    user: true,
                    assetAssignments: {
                        where: { returnedAt: null }
                    }
                },
                orderBy: { empName: 'asc' }
            });

            // CSV Header
            let csv = 'Employee ID,Name,Email,Role,Active Assets\n';

            // CSV Rows
            csv += employees.map(e => {
                const name = (e.empName || '').replace(/"/g, '""'); // Escape quotes
                const email = e.user?.email || '';
                const role = e.user?.role || 'N/A';
                const assets = e.assetAssignments.length;
                return `${e.empId},"${name}",${email},${role},${assets}`;
            }).join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="employee_roster_${new Date().toISOString().split('T')[0]}.csv"`
                }
            });

        } else if (type === 'expirations') {
            const now = new Date();
            const ninetyDays = new Date();
            ninetyDays.setDate(now.getDate() + 90);

            const expirations = await prisma.expiration.findMany({
                where: {
                    Expiration: {
                        lte: ninetyDays
                    }
                },
                include: {
                    employee: true,
                    certificate: true
                },
                orderBy: { Expiration: 'asc' }
            });

            let csv = 'Employee,Certificate,Expiration Date,Status,Days Remaining\n';
            csv += expirations.map(exp => {
                if (!exp.Expiration) return null;
                const name = (exp.employee.empName || '').replace(/"/g, '""');
                const cert = (exp.certificate.certificateName || '').replace(/"/g, '""');
                const date = exp.Expiration.toISOString().split('T')[0];

                const diffTime = exp.Expiration.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const status = diffDays < 0 ? 'EXPIRED' : 'Expiring Soon';

                return `"${name}","${cert}",${date},${status},${diffDays}`;
            }).filter(Boolean).join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="expirations_${new Date().toISOString().split('T')[0]}.csv"`
                }
            });

        } else if (type === 'training') {
            const currentYear = new Date().getFullYear();
            const startOfYear = new Date(currentYear, 0, 1);
            const endOfYear = new Date(currentYear, 11, 31);

            const employees = await prisma.employee.findMany({
                where: { departed: false },
                include: {
                    attendances: {
                        where: {
                            attendanceDate: {
                                gte: startOfYear,
                                lte: endOfYear
                            }
                        }
                    }
                },
                orderBy: { empName: 'asc' }
            });

            let csv = 'Employee ID,Name,Total Hours (YTD),Sessions Logged\n';
            csv += employees.map(e => {
                const name = (e.empName || '').replace(/"/g, '""');
                const totalHours = e.attendances.reduce((sum, a) => sum + (a.attendanceHours || 0), 0);
                return `${e.empId},"${name}",${totalHours.toFixed(2)},${e.attendances.length}`;
            }).join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="training_summary_${currentYear}.csv"`
                }
            });
        }

        return new NextResponse('Invalid Type', { status: 400 });

    } catch (e) {
        console.error(e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
