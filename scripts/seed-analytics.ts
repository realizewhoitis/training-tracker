
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding analytics data...');

    // 1. Create Users
    const traineeEmail = 'analytics.trainee@example.com';
    const trainerEmail = 'analytics.trainer@example.com';

    const trainee = await prisma.user.upsert({
        where: { email: traineeEmail },
        update: {},
        create: {
            email: traineeEmail,
            name: 'Alice Trainee',
            password: await hash('password123', 12),
            role: 'TRAINEE',
            employee: {
                create: { empName: 'Alice Trainee' }
            }
        },
        include: { employee: true }
    });

    const trainer = await prisma.user.upsert({
        where: { email: trainerEmail },
        update: {},
        create: {
            email: trainerEmail,
            name: 'Frank Trainer',
            password: await hash('password123', 12),
            role: 'TRAINER',
            employee: {
                create: { empName: 'Frank Trainer' }
            }
        },
        include: { employee: true }
    });

    // ... (template creation skipped for brevity in replace, context match handles it)

    // ...

    // 2. Create Template
    const template = await prisma.formTemplate.create({
        data: {
            title: '2026 Field Training Standard',
            isPublished: true,
            sections: {
                create: [
                    {
                        title: 'Officer Safety',
                        order: 1,
                        fields: {
                            create: [
                                { label: 'Situational Awareness', type: 'RATING', order: 1 },
                                { label: 'Radio Discipline', type: 'RATING', order: 2 }
                            ]
                        }
                    },
                    {
                        title: 'Legal Knowledge',
                        order: 2,
                        fields: {
                            create: [
                                { label: 'Case Law Application', type: 'RATING', order: 1 },
                                { label: 'Search & Seizure', type: 'RATING', order: 2 }
                            ]
                        }
                    }
                ]
            }
        },
        include: {
            sections: {
                include: { fields: true }
            }
        }
    });

    // 3. Create 10 Days of Reports
    const fieldIds = template.sections.flatMap(s => s.fields.map(f => f.id));

    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (9 - i)); // Past 10 days

        // Generate random scores trending upwards
        const baseScore = 3 + (i * 0.3); // Starts around 3, ends around 6
        const responseData: Record<string, string> = {};

        fieldIds.forEach(fid => {
            // Add some random variance
            const score = Math.min(7, Math.max(1, Math.round(baseScore + (Math.random() * 2 - 1))));
            responseData[fid.toString()] = score.toString();
        });

        await prisma.formResponse.create({
            data: {
                date: date,
                traineeId: trainee.employee!.empId,
                trainerId: trainer.id,
                templateId: template.id,
                responseData: JSON.stringify(responseData),
                status: 'REVIEWED',
                traineeSignatureAt: new Date()
            }
        });
    }

    console.log('Seeding complete. Login as:', traineeEmail);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
