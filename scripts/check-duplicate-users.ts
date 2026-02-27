import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            email: { contains: "tlsmith@metro911.org", mode: 'insensitive' }
        }
    });

    console.log("Found Users matching email:");
    for (const u of users) {
        console.log(`- ID: ${u.id}, Email: '${u.email}', AgencyID: ${u.agencyId}, 2FA Enabled: ${u.twoFactorEnabled}`);
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

export { };
