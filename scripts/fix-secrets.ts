const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const generateBase32Secret = (length = 20) => {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        secret += base32chars[bytes[i] % 32];
    }
    return secret;
};

async function main() {
    const users = await prisma.user.findMany();
    let count = 0;
    for (const user of users) {
        // Base32 encoded strings only contain A-Z and 2-7
        if (user.twoFactorSecret && !/^[A-Z2-7]+$/.test(user.twoFactorSecret)) {
            console.log(`Fixing invalid hex secret for ${user.email}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorSecret: generateBase32Secret(20) }
            });
            count++;
        }
    }
    console.log(`Finished fixing ${count} invalid secrets.`);
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
