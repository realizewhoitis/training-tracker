const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Version 0.4 Multi-Tenant Backfill Migration ---');

    console.log('1. Constructing Default Agency...');
    const defaultAgency = await prisma.agency.upsert({
        where: { name: 'Orbit 911 Default' },
        update: {},
        create: {
            name: 'Orbit 911 Default',
            timezone: 'America/Chicago'
        }
    });
    console.log(`=> Created/Found Default Agency: ${defaultAgency.id}`);

    const id = defaultAgency.id;

    console.log('\n2. Backfilling Users...');
    const users = await prisma.user.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${users.count} Users.`);

    console.log('\n3. Backfilling Employees...');
    const employees = await prisma.employee.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${employees.count} Employees.`);

    console.log('\n4. Backfilling Shifts...');
    const shifts = await prisma.shift.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${shifts.count} Shifts.`);

    console.log('\n5. Backfilling Assets...');
    const categories = await prisma.assetCategory.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    const assets = await prisma.asset.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${categories.count} Asset Categories & ${assets.count} Assets.`);

    console.log('\n6. Backfilling Training & Certificates...');
    const trainings = await prisma.training.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    const certs = await prisma.certificate.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${trainings.count} Trainings & ${certs.count} Certificates.`);

    console.log('\n7. Backfilling Policy...');
    const policies = await prisma.policy.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${policies.count} Policies.`);

    console.log('\n8. Backfilling Evaluation Templates...');
    const forms = await prisma.formTemplate.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${forms.count} Form Templates.`);

    console.log('\n9. Backfilling Organization Settings...');
    const settings = await prisma.organizationSettings.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${settings.count} Settings.`);

    console.log('\n10. Backfilling Audit Logs...');
    const logs = await prisma.auditLog.updateMany({
        where: { agencyId: null },
        data: { agencyId: id }
    });
    console.log(`=> Migrated ${logs.count} Audit Logs.`);

    console.log('\n--- Migration Complete. It is now safe to enforce strict agencyId requirements in schema.prisma ---');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Migration failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
