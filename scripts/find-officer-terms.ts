
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sections = await prisma.formSection.findMany({
        where: { title: { contains: 'Officer' } }
    });
    console.log("Sections with 'Officer':", sections);

    const fields = await prisma.formField.findMany({
        where: { label: { contains: 'Officer' } }
    });
    console.log("Fields with 'Officer':", fields);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
