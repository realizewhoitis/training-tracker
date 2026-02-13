
import prisma from './lib/prisma';

async function main() {
    const templates = await prisma.formTemplate.findMany();
    console.log('Templates:', JSON.stringify(templates, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
