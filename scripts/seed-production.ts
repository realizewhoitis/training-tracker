import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
    return new Date(dateStr);
}

async function main() {
    console.log('Checking if database needs seeding...');

    // Safety Check: Only seed if NO users exist
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        console.log('Database already has users. Skipping production seed.');
        return;
    }

    console.log('Database is empty. Starting production seed...');

    // 0. Create Admin User
    const email = 'admin@example.com';
    const password = await bcrypt.hash('password123', 10);
    await prisma.user.create({
        data: {
            email,
            name: 'Admin User',
            password,
            role: 'ADMIN',
        }
    });
    console.log('Created Admin User (admin@example.com)');

    // 1. Employee
    const employeesData = readJson('Employee.json');
    for (const emp of employeesData) {
        await prisma.employee.create({
            data: {
                empId: emp.empId,
                empName: emp.empName,
                departed: emp.departed,
            }
        }).catch(e => console.warn(`Skipped Employee ${emp.empId}: ${e.message}`));
    }
    console.log(`Seeded Employees`);

    // 2. Training
    const trainingsData = readJson('Training.json');
    for (const t of trainingsData) {
        await prisma.training.create({
            data: {
                TrainingID: t.TrainingID,
                TrainingName: t.TrainingName,
            }
        }).catch(e => console.warn(`Skipped Training ${t.TrainingID}: ${e.message}`));
    }
    console.log(`Seeded Trainings`);

    // 3. Certificate
    const certificatesData = readJson('Certificate.json');
    for (const c of certificatesData) {
        await prisma.certificate.create({
            data: {
                CertificateID: c.CertificateID,
                certificateName: c.certificateName,
                neededHours: c.neededHours,
                yearsValid: c.yearsValid,
            }
        }).catch(e => console.warn(`Skipped Certificate ${c.CertificateID}: ${e.message}`));
    }
    console.log(`Seeded Certificates`);

    // 4. Attendance
    const attendanceData = readJson('Attendance.json');
    for (const a of attendanceData) {
        let date = parseDate(a.attendanceDate);
        await prisma.attendance.create({
            data: {
                attendanceID: a.attendanceID,
                attendanceDate: date,
                attendanceHealth: a.attendanceHealth,
                attendanceHours: a.attendanceHours,
                attendanceNote: a.attendanceNote,
                employeeID: a.employeeID,
                trainingID: a.trainingID,
            }
        }).catch(e => console.warn(`Skipped Attendance ${a.attendanceID}`));
    }
    console.log(`Seeded Attendance`);

    // 5. Exclusions
    const exclusionsData = readJson('CertificateTrainingExclusion.json');
    for (const e of exclusionsData) {
        await prisma.certificateTrainingExclusion.create({
            data: {
                certificateID: e.certificateID,
                trainingID: e.trainingID,
            }
        }).catch(e => console.warn(`Skipped Exclusion: ${e.message}`));
    }
    console.log(`Seeded Exclusions`);

    // 6. Expiration
    const expirationsData = readJson('Expiration.json');
    for (const e of expirationsData) {
        let date = parseDate(e.Expiration);
        await prisma.expiration.create({
            data: {
                CertificateID: e.CertificateID,
                EmployeeID: e.EmployeeID,
                Expiration: date
            }
        }).catch(e => console.warn(`Skipped Expiration`));
    }
    console.log(`Seeded Expirations`);

    console.log('Production seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
