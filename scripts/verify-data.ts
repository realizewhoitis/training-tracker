
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Database Verification ---");

    const employees = await prisma.employee.count();
    console.log(`Employees: ${employees}`);

    const certificates = await prisma.certificate.count();
    console.log(`Certificates: ${certificates}`);

    const expirations = await prisma.expiration.count();
    console.log(`Expirations: ${expirations}`);

    // Check Employee 1 specifically
    const emp1 = await prisma.employee.findUnique({
        where: { empId: 1 },
        include: {
            expirations: {
                include: { certificate: true }
            }
        }
    });

    if (emp1) {
        console.log(`\nEmployee 1 (${emp1.empName}):`);
        console.log(`- Expirations found: ${emp1.expirations.length}`);
        emp1.expirations.forEach(exp => {
            console.log(`  - ${exp.certificate.certificateName} (Expires: ${exp.Expiration})`);
        });
    } else {
        console.log("\nEmployee 1 not found");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
