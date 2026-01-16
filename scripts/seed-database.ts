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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
