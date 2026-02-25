const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.update({
        where: { email: 'superuser@orbit911.com' },
        data: { twoFactorEnabled: false }
    });
    console.log('Disabled 2FA for', user.email);
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
