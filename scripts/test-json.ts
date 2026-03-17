import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching FormResponses...');
    const responses = await prisma.formResponse.findMany();
    let invalidCount = 0;

    for (const res of responses) {
        try {
            JSON.parse(res.responseData);
        } catch (e) {
            console.error(`Invalid JSON in FormResponse ID ${res.id}:`, res.responseData);
            invalidCount++;
        }
    }
    console.log(`Finished checking. Invalid responses: ${invalidCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
