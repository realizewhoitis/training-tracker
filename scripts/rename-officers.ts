
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for employees with 'Officer' in their name...");

    const officers = await prisma.employee.findMany({
        where: {
            empName: { contains: 'Officer' }
        }
    });

    console.log(`Found ${officers.length} records to update.`);

    for (const officer of officers) {
        const newName = officer.empName.replace('Officer', 'Telecommunicator');
        console.log(`Renaming '${officer.empName}' -> '${newName}'`);

        await prisma.employee.update({
            where: { empId: officer.empId },
            data: { empName: newName }
        });
    }

    // Also check Users table if any test users were created there
    const users = await prisma.user.findMany({
        where: {
            name: { contains: 'Officer' }
        }
    });

    for (const user of users) {
        const newName = user.name.replace('Officer', 'Telecommunicator');
        console.log(`Renaming User '${user.name}' -> '${newName}'`);

        await prisma.user.update({
            where: { id: user.id },
            data: { name: newName }
        });
    }

    console.log("Migration complete.");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
