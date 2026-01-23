
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Inventory Verification Seed...');

    // 1. Clean up previous test data if any specific ones exist (optional, but good for idempotency)
    // For now, we'll just create new ones to avoid deleting real data

    // 2. Create Categories if not exist
    let category = await prisma.assetCategory.findFirst({ where: { name: 'Test Category' } });
    if (!category) {
        category = await prisma.assetCategory.create({
            data: { name: 'Test Category', description: 'For automated verification' }
        });
        console.log('Created Test Category');
    }

    // 3. Create Employees if not exist
    let commA = await prisma.employee.findFirst({ where: { empName: 'Comm A' } });
    if (!commA) {
        commA = await prisma.employee.create({
            data: { empName: 'Comm A', departed: false }
        });
        console.log('Created Comm A');
    }

    let commB = await prisma.employee.findFirst({ where: { empName: 'Comm B' } });
    if (!commB) {
        commB = await prisma.employee.create({
            data: { empName: 'Comm B', departed: false }
        });
        console.log('Created Comm B');
    }

    // 4. Create an Asset
    const assetTag = `TEST-${Date.now()}`;
    const asset = await prisma.asset.create({
        data: {
            name: 'Verification Radio',
            assetTag: assetTag,
            categoryId: category.id,
            status: 'AVAILABLE',
            condition: 'NEW'
        }
    });
    console.log(`Created Asset: ${asset.name} (${asset.assetTag})`);

    // 5. Assign to Comm A (lifecycle test)
    console.log('Assigning to Comm A...');
    const assignment1 = await prisma.assetAssignment.create({
        data: {
            assetId: asset.id,
            employeeId: commA.empId,
            notes: 'Initial issue'
        }
    });
    await prisma.asset.update({
        where: { id: asset.id },
        data: { status: 'ASSIGNED' }
    });

    // Verify status
    const assetAfterAssign = await prisma.asset.findUnique({ where: { id: asset.id } });
    if (assetAfterAssign.status !== 'ASSIGNED') throw new Error('Status failed to update to ASSIGNED');
    console.log('Asset status Verified: ASSIGNED');

    // 6. Return Asset
    console.log('Returning asset...');
    await prisma.assetAssignment.update({
        where: { id: assignment1.id },
        data: { returnedAt: new Date() }
    });
    await prisma.asset.update({
        where: { id: asset.id },
        data: { status: 'AVAILABLE', condition: 'GOOD' }
    });

    // Verify
    const assetAfterReturn = await prisma.asset.findUnique({ where: { id: asset.id } });
    if (assetAfterReturn.status !== 'AVAILABLE') throw new Error('Status failed to update to AVAILABLE');
    console.log('Asset status Verified: AVAILABLE');

    // 7. Assign to Comm B
    console.log('Assigning to Comm B...');
    await prisma.assetAssignment.create({
        data: {
            assetId: asset.id,
            employeeId: commB.empId,
            notes: 'Re-issue'
        }
    });
    await prisma.asset.update({
        where: { id: asset.id },
        data: { status: 'ASSIGNED' }
    });

    console.log('Inventory Lifecycle Verification Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
