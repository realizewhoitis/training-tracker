
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@orbit911.com';
    const password = await bcrypt.hash('orbit123', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password,
            role: 'ADMIN',
            name: 'Test Admin'
        },
        create: {
            email,
            password,
            role: 'ADMIN',
            name: 'Test Admin'
        }
    });

    console.log('Created/Updated Admin User:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
