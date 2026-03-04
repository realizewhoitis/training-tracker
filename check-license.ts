import { verifyLicense } from './lib/license';
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const settings = await prisma.organizationSettings.findFirst();
    console.log("Settings =>", settings);

    if (settings && settings.licenseKey) {
        const issued = await prisma.issuedLicense.findUnique({
            where: { key: settings.licenseKey }
        });
        console.log("IssuedLicense =>", issued);
    }

    const licenseStatus = await verifyLicense();
    console.log("verifyLicense() returns =>", licenseStatus);

    await prisma.$disconnect();
}

main();
