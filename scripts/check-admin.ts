// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@example.com'; // Standard seed admin
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });

    console.log('User found:', user);

    if (user && user.role !== 'ADMIN') {
        console.log('Fixing Admin Role...');
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'ADMIN' }
        });
        console.log('Role updated to ADMIN');
    } else {
        console.log('Role is already:', user ? user.role : 'USER NOT FOUND');

        // Check all users logic just in case
        const allUsers = await prisma.user.findMany();
        console.log('All Users:', allUsers.map(u => ({ email: u.email, role: u.role })));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
