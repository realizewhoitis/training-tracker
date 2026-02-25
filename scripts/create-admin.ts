
const { PrismaClient: PrismaClientAdmin } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const adminPrisma = new PrismaClientAdmin();

async function mainAdmin() {
    const email = 'admin@example.com';
    const password = await bcrypt.hash('password123', 10);

    const user = await adminPrisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    });

    console.log({ user });
}

mainAdmin()
    .then(async () => {
        await adminPrisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await adminPrisma.$disconnect();
        process.exit(1);
    });

export {};
