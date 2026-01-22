
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Data Cleanup: FTO Names -> Trainer");

    // Update Frank FTO
    const frank = await prisma.user.findFirst({ where: { email: { contains: 'fto' } } });
    if (frank) {
        await prisma.user.update({
            where: { id: frank.id },
            data: {
                name: 'Frank Trainer',
                email: frank.email.replace('fto', 'trainer')
            }
        });
        console.log("Renamed Frank FTO -> Frank Trainer");
    }

    // Update generic FTO user
    const generic = await prisma.user.findFirst({ where: { name: 'F.T. Officer' } });
    if (generic) {
        await prisma.user.update({
            where: { id: generic.id },
            data: { name: 'Field Trainer' }
        });
        console.log("Renamed F.T. Officer -> Field Trainer");
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
