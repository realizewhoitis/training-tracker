
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Use a new instance or import the existing one if preferred, 
// but here we ensure clean isolation for this quick task.
const prisma = new PrismaClient();

// In Vercel, files in 'data/utils' need to be accessable.
// Since we didn't explicitly bundle them, we hope they are there.
// If not, we might need a different strategy, but let's try reading relative to process.cwd()
const dataDir = path.join(process.cwd(), 'data', 'utils');

function readJson(filename: string) {
    try {
        const content = fs.readFileSync(path.join(dataDir, filename), 'utf8');
        return JSON.parse(content.replace(/^\uFEFF/, ''));
    } catch (e) {
        console.error(`Error reading ${filename}:`, e);
        return [];
    }
}

function parseDate(dateStr: string | null) {
    if (!dateStr) return null;
    const match = dateStr.match(/\/Date\((\d+)\)\//);
    if (match) {
        return new Date(parseInt(match[1], 10));
    }
    return new Date(dateStr);
}

export async function GET() {
    try {
        const results = [];

        // 1. Employee
        const employeesData = readJson('Employee.json');
        if (employeesData.length > 0) {
            for (const emp of employeesData) {
                await prisma.employee.upsert({
                    where: { empId: emp.empId },
                    update: {},
                    create: {
                        empId: emp.empId,
                        empName: emp.empName,
                        departed: emp.departed,
                    },
                });
            }
            results.push(`Seeded ${employeesData.length} employees`);
        } else {
            results.push('No employee data found');
        }

        // 2. Training
        const trainingsData = readJson('Training.json');
        if (trainingsData.length > 0) {
            for (const t of trainingsData) {
                await prisma.training.upsert({
                    where: { TrainingID: t.TrainingID },
                    update: {},
                    create: {
                        TrainingID: t.TrainingID,
                        TrainingName: t.TrainingName,
                    },
                });
            }
            results.push(`Seeded ${trainingsData.length} trainings`);
        }

        // 3. Certificate
        const certificatesData = readJson('Certificate.json');
        if (certificatesData.length > 0) {
            for (const c of certificatesData) {
                await prisma.certificate.upsert({
                    where: { CertificateID: c.CertificateID },
                    update: {},
                    create: {
                        CertificateID: c.CertificateID,
                        certificateName: c.certificateName,
                        neededHours: c.neededHours,
                        yearsValid: c.yearsValid,
                    },
                });
            }
            results.push(`Seeded ${certificatesData.length} certificates`);
        }

        // 4. Attendance (Limit for safety?)
        const attendanceData = readJson('Attendance.json');
        if (attendanceData.length > 0) {
            let count = 0;
            for (const a of attendanceData) {
                let date = parseDate(a.attendanceDate);
                try {
                    await prisma.attendance.upsert({
                        where: { attendanceID: a.attendanceID },
                        update: {}, // Don't overwrite if exists
                        create: {
                            attendanceID: a.attendanceID,
                            attendanceDate: date,
                            attendanceHealth: a.attendanceHealth,
                            attendanceHours: a.attendanceHours,
                            attendanceNote: a.attendanceNote,
                            employeeID: a.employeeID,
                            trainingID: a.trainingID,
                        },
                    });
                    count++;
                } catch (e) {
                    console.warn(`Failed to seed attendance ${a.attendanceID}`, e);
                }
            }
            results.push(`Seeded ${count} attendance records`);
        }

        // 5. Training Categories (Buckets) - Just basic inferred or hardcoded if needed?
        // Skipped for now, focusing on core data.

        return NextResponse.json({
            success: true,
            message: "Production data seeding completed.",
            details: results
        });

    } catch (error) {
        console.error('Seeding failed:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
