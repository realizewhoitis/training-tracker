const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodeCrypto = require('crypto');

const generateBase32Secret = (length = 32) => {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const bytes = nodeCrypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        secret += base32chars[bytes[i] % 32];
    }
    return secret;
};

async function main() {
    const users = await prisma.user.findMany();
    let count = 0;
    for (const user of users) {
        if (user.twoFactorSecret && (user.twoFactorSecret.length !== 32 || !/^[A-Z2-7]+$/.test(user.twoFactorSecret))) {
            console.log(`Fixing invalid 2FA secret padding for ${user.email}`);
            await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorSecret: generateBase32Secret(32) }
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

export {};
