
import prisma from './lib/prisma';

async function main() {
    // Set Template 1 to RADIO
    await prisma.formTemplate.update({
        where: { id: 1 },
        data: { type: 'RADIO' }
    });
    console.log('Updated Template 1 to RADIO');

    // Set Template 3 (and 4, 5 duplicates) to CALL_TAKING
    // Using updateMany is not supported for id list easily without where in, but id is unique.
    // I'll just update ID 3 for now.
    await prisma.formTemplate.update({
        where: { id: 3 },
        data: { type: 'CALL_TAKING' }
    });
    await prisma.formTemplate.update({
        where: { id: 4 },
        data: { type: 'CALL_TAKING' }
    });
    await prisma.formTemplate.update({
        where: { id: 5 },
        data: { type: 'CALL_TAKING' }
    });
    console.log('Updated Templates 3, 4, 5 to CALL_TAKING');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
