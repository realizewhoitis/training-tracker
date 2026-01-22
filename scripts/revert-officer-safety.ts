
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Reverting: Telecommunicator Safety -> Officer Safety");

    const sections = await prisma.formSection.updateMany({
        where: { title: 'Telecommunicator Safety' },
        data: { title: 'Officer Safety' }
    });

    console.log(`Reverted ${sections.count} sections to 'Officer Safety'.`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
