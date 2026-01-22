
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Migration: FTO -> TRAINER");

    // 1. Copy ftoId to trainerId
    const responses = await prisma.formResponse.findMany();
    let updatedCount = 0;
    for (const r of responses) {
        if (r.ftoId && !r.trainerId) {
            await prisma.formResponse.update({
                where: { id: r.id },
                data: { trainerId: r.ftoId }
            });
            updatedCount++;
        }
    }
    console.log(`Copied ftoId to trainerId for ${updatedCount} responses.`);

    // 2. Update Role 'FTO' -> 'TRAINER'
    const updateRole = await prisma.user.updateMany({
        where: { role: 'FTO' },
        data: { role: 'TRAINER' }
    });
    console.log(`Updated ${updateRole.count} users from FTO to TRAINER.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
