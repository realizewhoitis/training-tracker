
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Migration: Officer Safety -> Telecommunicator Safety");

    const sections = await prisma.formSection.updateMany({
        where: { title: 'Officer Safety' },
        data: { title: 'Telecommunicator Safety' }
    });

    console.log(`Updated ${sections.count} sections from 'Officer Safety' to 'Telecommunicator Safety'.`);

    // Also check for any fields labeled "Officer"
    // e.g. "Officer Presence" -> "Telecommunicator Presence" (unlikely but good to check)
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
