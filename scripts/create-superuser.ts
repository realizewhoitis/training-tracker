
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'superuser@orbit911.com';
    const password = await bcrypt.hash('orbit!super', 10);
    const twoFactorSecret = 'ORBITSUPERUSERSECRET12345'; // Email-based TOTP secret

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            twoFactorEnabled: true,
            twoFactorSecret: twoFactorSecret
        },
        create: {
            email,
            name: 'System Superuser',
            password,
            role: 'SUPERUSER',
            twoFactorEnabled: true,
            twoFactorSecret: twoFactorSecret
        },
    });

    console.log('Superuser created:', user.email);

    // Create a default license if none exists
    const existingLicense = await prisma.issuedLicense.findFirst();
    if (!existingLicense) {
        await prisma.issuedLicense.create({
            data: {
                key: 'ORBIT-SYSTEM-DEFAULT-KEY',
                clientName: 'System Default',
                isActive: true
            }
        });
        console.log('Default license created: ORBIT-SYSTEM-DEFAULT-KEY');

        // Link to settings
        const settings = await prisma.organizationSettings.findFirst();
        if (settings) {
            await prisma.organizationSettings.update({
                where: { id: settings.id },
                data: { licenseKey: 'ORBIT-SYSTEM-DEFAULT-KEY' }
            });
            console.log('Settings updated with default license key.');
        } else {
            await prisma.organizationSettings.create({
                data: {
                    orgName: 'Orbit 911 Center',
                    licenseKey: 'ORBIT-SYSTEM-DEFAULT-KEY',
                    modules: JSON.stringify(['INVENTORY', 'EIS', 'DOR', 'REPORTS'])
                }
            });
            console.log('Organization Settings created with default license.');
        }
    } else {
        console.log('License already exists, skipping creation.');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
