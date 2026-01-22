
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Verifying Template: Metro 911 Telecommunicator Standard");

    const template = await prisma.formTemplate.findFirst({
        where: { title: 'Metro 911 Telecommunicator Standard' },
        include: {
            sections: {
                include: { fields: true },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!template) {
        console.error("Template not found!");
        return;
    }

    console.log(`Template ID: ${template.id}`);

    for (const section of template.sections) {
        console.log(`\n[${section.title}]`);
        // Sort fields by order just in case
        const sortedFields = section.fields.sort((a, b) => a.order - b.order);
        for (const field of sortedFields) {
            console.log(`  - ${field.label}`);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
