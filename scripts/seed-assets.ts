

const { PrismaClient: PrismaClientSeed } = require('@prisma/client');
const seedPrisma = new PrismaClientSeed();

async function mainAssets() {
    const categories = [
        { name: 'Electronics', description: 'Radios, Laptops, Phones, Body Cameras' },
        { name: 'Firearms', description: 'Handguns, Rifles, Less-Lethal Launchers' },
        { name: 'Uniforms', description: 'Shirts, Pants, Belts, Boots, Jackets' },
        { name: 'Badges & IDs', description: 'Policed Badges, Key Cards, Access Tokens' },
        { name: 'Keys', description: 'Vehicle Keys, Building Keys' },
        { name: 'Vehicles', description: 'Patrol Cars, Unmarked Units, Specialty Vehicles' },
        { name: 'Tactical Gear', description: 'Vests, Helmets, Batons, Flashlights' }
    ];

    console.log('Seeding Asset Categories...');

    for (const cat of categories) {
        const exists = await seedPrisma.assetCategory.findFirst({
            where: { name: cat.name }
        });

        if (!exists) {
            await seedPrisma.assetCategory.create({
                data: cat
            });
            console.log(`Created category: ${cat.name}`);
        } else {
            console.log(`Category exists: ${cat.name}`);
        }
    }
}

mainAssets()
    .then(async () => {
        await seedPrisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await seedPrisma.$disconnect();
        process.exit(1);
    });
