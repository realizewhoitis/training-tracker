import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const settings = await prisma.organizationSettings.findMany({
        include: { agency: true }
    });
    console.log("All Settings:");
    settings.forEach(s => {
        console.log(`- ID: ${s.id}, Agency: ${s.agency?.name}, Key: ${s.licenseKey}, Expiry: ${s.licenseExpiry}`);
    });

    const issued = await prisma.issuedLicense.findMany();
    console.log("\nAll Issued Licenses:");
    issued.forEach(l => {
        console.log(`- ID: ${l.id}, Key: ${l.key}, Client: ${l.clientName}, Active: ${l.isActive}, Grace: ${l.gracePeriodDays}, Expires: ${l.expiresAt}`);
    });

    await prisma.$disconnect();
}

main().catch(console.error);
