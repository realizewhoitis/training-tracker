
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import employeesData from '@/data/utils/Employee.json';
import trainingsData from '@/data/utils/Training.json';
import certificatesData from '@/data/utils/Certificate.json';
import attendanceData from '@/data/utils/Attendance.json';
import exclusionsData from '@/data/utils/CertificateTrainingExclusion.json';
import expirationsData from '@/data/utils/Expiration.json';

const prisma = new PrismaClient();

function parseDate(dateStr: string | null) {
    if (!dateStr) return null;
    const match = dateStr.match(/\/Date\((\d+)\)\//);
    if (match) {
        return new Date(parseInt(match[1], 10));
    }
    return new Date(dateStr);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'Orbit911SuperSecure2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const results = {
            employees: 0,
            trainings: 0,
            certificates: 0,
            attendance: 0,
            exclusions: 0,
            expirations: 0,
            dor: false
        };

        // Helper for bulk operations
        const chunkArray = (arr: any[], size: number) => {
            return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
                arr.slice(i * size, i * size + size)
            );
        };

        // 1. Employee
        // optimize: Use createMany with skipDuplicates
        await prisma.employee.createMany({
            data: employeesData.map(e => ({
                empId: e.empId,
                empName: e.empName,
                departed: e.departed,
            })),
            skipDuplicates: true
        });
        results.employees = employeesData.length;

        // 2. Training
        await prisma.training.createMany({
            data: trainingsData.map(t => ({
                TrainingID: t.TrainingID,
                TrainingName: t.TrainingName,
            })),
            skipDuplicates: true
        });
        results.trainings = trainingsData.length;

        // 3. Certificate
        await prisma.certificate.createMany({
            data: certificatesData.map(c => ({
                CertificateID: c.CertificateID,
                certificateName: c.certificateName,
                neededHours: c.neededHours,
                yearsValid: c.yearsValid,
            })),
            skipDuplicates: true
        });
        results.certificates = certificatesData.length;

        // 4. Attendance (The big one!)
        // Delete existing to avoid conflicts and ensure clean state (optional, but faster than upsert)
        // For safety, we'll try createMany with skipDuplicates first.

        const attendanceChunks = chunkArray(attendanceData, 500);
        let attendanceCount = 0;

        for (const chunk of attendanceChunks) {
            const formatted = chunk.map((a: any) => ({
                attendanceID: a.attendanceID,
                attendanceDate: parseDate(a.attendanceDate),
                attendanceHealth: a.attendanceHealth,
                attendanceHours: a.attendanceHours,
                attendanceNote: a.attendanceNote,
                employeeID: a.employeeID,
                trainingID: a.trainingID,
            }));

            await prisma.attendance.createMany({
                data: formatted,
                skipDuplicates: true
            });
            attendanceCount += chunk.length;
        }
        results.attendance = attendanceCount;

        // 5. Exclusions
        await prisma.certificateTrainingExclusion.createMany({
            data: exclusionsData.map(e => ({
                certificateID: e.certificateID,
                trainingID: e.trainingID,
            })),
            skipDuplicates: true
        });
        results.exclusions = exclusionsData.length;

        // 6. Expiration
        await prisma.expiration.deleteMany({}); // Delete all first as per original logic
        const expirationChunks = chunkArray(expirationsData, 500);
        for (const chunk of expirationChunks) {
            const formatted = chunk.map((e: any) => ({
                CertificateID: e.CertificateID,
                EmployeeID: e.EmployeeID,
                Expiration: parseDate(e.Expiration)
            }));
            await prisma.expiration.createMany({
                data: formatted,
                skipDuplicates: true
            });
        }
        results.expirations = expirationsData.length;

        // 7. DOR Data
        // ... (Keep existing DOR logic as it is complex and small volume)
        const template = await prisma.formTemplate.upsert({
            where: { id: 1 },
            update: {},
            create: {
                title: "Daily Observation Report (Standard)",
                isPublished: true,
                version: 1,
                sections: {
                    create: [
                        {
                            title: "Officer Safety",
                            order: 1,
                            fields: {
                                create: [
                                    { label: "General Safety", type: "RATING", order: 1 },
                                    { label: "Suspect Control", type: "RATING", order: 2 }
                                ]
                            }
                        },
                        {
                            title: "Driving",
                            order: 2,
                            fields: {
                                create: [
                                    { label: "Normal driving", type: "RATING", order: 1 },
                                    { label: "Emergency response", type: "RATING", order: 2 }
                                ]
                            }
                        },
                        {
                            title: "Report Writing",
                            order: 3,
                            fields: {
                                create: [
                                    { label: "Grammar/Spelling", type: "RATING", order: 1 },
                                    { label: "Timeliness", type: "RATING", order: 2 }
                                ]
                            }
                        }
                    ]
                }
            },
            include: { sections: { include: { fields: true } } }
        });

        const trainee = await prisma.employee.findFirst();
        let trainer = await prisma.user.findFirst({ where: { role: 'TRAINER' } });
        if (!trainer) {
            trainer = await prisma.user.create({
                data: {
                    email: "trainer@example.com",
                    name: "FTO Trainer",
                    password: "hashedpassword123",
                    role: "TRAINER"
                }
            });
        }

        if (trainee && trainer) {
            const dates = [
                new Date(Date.now() - 5 * 86400000),
                new Date(Date.now() - 4 * 86400000),
                new Date(Date.now() - 3 * 86400000),
                new Date(Date.now() - 2 * 86400000),
                new Date(Date.now() - 1 * 86400000),
            ];
            const baseScores = [2, 3, 3, 5, 6];

            for (let i = 0; i < dates.length; i++) {
                const responseData: Record<string, any> = {};
                template.sections.forEach(section => {
                    section.fields.forEach(field => {
                        let score = baseScores[i];
                        if (section.title === 'Driving') score += 1;
                        if (section.title === 'Report Writing') score -= 1;
                        score = Math.max(1, Math.min(7, score));
                        responseData[field.id.toString()] = score.toString();
                    });
                });

                await prisma.formResponse.create({
                    data: {
                        date: dates[i],
                        traineeId: trainee.empId,
                        trainerId: trainer.id,
                        templateId: template.id,
                        responseData: JSON.stringify(responseData),
                        status: 'REVIEWED'
                    }
                });
            }
            results.dor = true;
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
