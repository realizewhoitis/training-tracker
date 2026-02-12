import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), 'data/utils');

function readJson(filename: string) {
    const content = fs.readFileSync(path.join(dataDir, filename), 'utf8');
    return JSON.parse(content.replace(/^\uFEFF/, ''));
}

function parseDate(dateStr: string | null) {
    if (!dateStr) return null;
    const match = dateStr.match(/\/Date\((\d+)\)\//);
    if (match) {
        return new Date(parseInt(match[1], 10));
    }
    return new Date(dateStr); // Fallback for standard ISO strings
}

async function main() {
    console.log('Seeding database...');

    // 1. Employee
    const employeesData = readJson('Employee.json');
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
    console.log(`Seeded ${employeesData.length} employees`);

    // 2. Training
    const trainingsData = readJson('Training.json');
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
    console.log(`Seeded ${trainingsData.length} trainings`);

    // 3. Certificate
    const certificatesData = readJson('Certificate.json');
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
    console.log(`Seeded ${certificatesData.length} certificates`);

    // 4. Attendance
    const attendanceData = readJson('Attendance.json');
    console.log(`Processing ${attendanceData.length} attendance records...`);

    // Process in chunks to avoid memory issues if data is huge
    // But for 1MB it's fine to loop.
    for (const a of attendanceData) {
        let date = parseDate(a.attendanceDate);

        try {
            await prisma.attendance.upsert({
                where: { attendanceID: a.attendanceID },
                update: {
                    attendanceDate: date,
                    attendanceHealth: a.attendanceHealth,
                    attendanceHours: a.attendanceHours,
                    attendanceNote: a.attendanceNote,
                    employeeID: a.employeeID,
                    trainingID: a.trainingID,
                },
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
        } catch (e) {
            console.warn(`Failed to seed attendance ${a.attendanceID}:`, e);
        }
    }
    console.log(`Seeded attendance records`);

    // 5. Exclusions
    const exclusionsData = readJson('CertificateTrainingExclusion.json');
    for (const e of exclusionsData) {
        try {
            await prisma.certificateTrainingExclusion.upsert({
                where: {
                    certificateID_trainingID: {
                        certificateID: e.certificateID,
                        trainingID: e.trainingID
                    }
                },
                update: {},
                create: {
                    certificateID: e.certificateID,
                    trainingID: e.trainingID,
                }
            });
        } catch (err) {
            console.warn(`Failed to seed exclusion cert=${e.certificateID} training=${e.trainingID}:`, err);
        }
    }
    console.log(`Seeded ${exclusionsData.length} exclusions`);

    // 6. Expiration
    const expirationsData = readJson('Expiration.json');

    // No unique key on Expiration (Employee+Cert), so we clear it first to avoid duplicates on re-seed
    await prisma.expiration.deleteMany({});

    for (const e of expirationsData) {
        let date = parseDate(e.Expiration);
        try {
            await prisma.expiration.create({
                data: {
                    CertificateID: e.CertificateID,
                    EmployeeID: e.EmployeeID,
                    Expiration: date
                }
            });
        } catch (err) {
            console.warn(`Failed to seed expiration`, err);
        }
    }
    console.log(`Seeded ${expirationsData.length} expirations`);

    // 7. DOR Data (Templates & Responses for Analytics)
    console.log("Seeding DOR data for analytics...");

    // Create a Standard Template
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

    // Seed DORs for the first employee found
    const trainee = await prisma.employee.findFirst();
    // find a trainer (user)
    let trainer = await prisma.user.findFirst({ where: { role: 'TRAINER' } });

    // If no trainer exists, create one
    if (!trainer) {
        trainer = await prisma.user.create({
            data: {
                email: "trainer@example.com",
                name: "FTO Trainer",
                password: "hashedpassword123", // dummy
                role: "TRAINER"
            }
        });
    }

    if (trainee && trainer) {
        // Create a trend: Improving scores over 5 days
        const dates = [
            new Date(Date.now() - 5 * 86400000), // 5 days ago
            new Date(Date.now() - 4 * 86400000),
            new Date(Date.now() - 3 * 86400000),
            new Date(Date.now() - 2 * 86400000),
            new Date(Date.now() - 1 * 86400000),
        ];

        // Scores increasing: 2 -> 3 -> 4 -> 5 -> 6
        const baseScores = [2, 3, 3, 5, 6];

        for (let i = 0; i < dates.length; i++) {
            // Map fields to scores
            const responseData: Record<string, any> = {};

            template.sections.forEach(section => {
                section.fields.forEach(field => {
                    // Add some randomness but stick to trend
                    let score = baseScores[i];
                    if (section.title === 'Driving') score += 1; // Good at driving
                    if (section.title === 'Report Writing') score -= 1; // Bad at writing

                    // clamp 1-7
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
        console.log(`Seeded 5 progression DORs for ${trainee.empName}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
