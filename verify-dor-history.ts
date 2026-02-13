import prisma from './lib/prisma';

async function main() {
    // 1. Find an employee who has some DOR activity (either as trainee or trainer)
    // We'll look for one with formResponses first
    let employee = await prisma.employee.findFirst({
        where: {
            OR: [
                { formResponses: { some: {} } },
                { user: { authoredTrainerResponses: { some: {} } } }
            ]
        },
        include: {
            formResponses: {
                include: {
                    template: true,
                    trainer: true
                }
            },
            user: {
                include: {
                    authoredTrainerResponses: {
                        include: {
                            template: true,
                            trainee: true
                        }
                    }
                }
            }
        }
    });

    if (!employee) {
        console.log("No employee found with DOR activity. Cannot verify history.");
        return;
    }

    console.log(`Verifying DOR History for: ${employee.empName} (ID: ${employee.empId})`);

    // 2. Verify Received DORs (Trainee)
    const received = employee.formResponses || [];
    console.log(`\n[Received DORs]: ${received.length}`);
    received.forEach(r => {
        console.log(` - ID: ${r.id} | Date: ${r.date.toISOString().split('T')[0]} | Trainer: ${r.trainer.name} | Template: ${r.template.title}`);
    });

    // 3. Verify Written DORs (Trainer)
    const written = employee.user?.authoredTrainerResponses || [];
    console.log(`\n[Written DORs]: ${written.length}`);
    written.forEach(r => {
        console.log(` - ID: ${r.id} | Date: ${r.date.toISOString().split('T')[0]} | Trainee: ${r.trainee.empName} | Template: ${r.template.title}`);
    });

    // 4. Verify Aggregation Logic (Who Trained Them)
    console.log(`\n[Aggregation: Trained By]`);
    const trainers = received.reduce((acc: any, dor: any) => {
        const key = `${dor.trainer.name}-${dor.template.title}`;
        if (!acc[key]) {
            acc[key] = {
                name: dor.trainer.name,
                position: dor.template.title,
                count: 0
            };
        }
        acc[key].count++;
        return acc;
    }, {});

    Object.values(trainers).forEach((t: any) => {
        console.log(` - ${t.name} (${t.position}): ${t.count} times`);
    });

    // 5. Verify Aggregation Logic (Who They Trained)
    console.log(`\n[Aggregation: Has Trained]`);
    const trainees = written.reduce((acc: any, dor: any) => {
        const key = `${dor.trainee.empName}-${dor.template.title}`;
        if (!acc[key]) {
            acc[key] = {
                name: dor.trainee.empName,
                position: dor.template.title,
                count: 0
            };
        }
        acc[key].count++;
        return acc;
    }, {});

    Object.values(trainees).forEach((t: any) => {
        console.log(` - ${t.name} (${t.position}): ${t.count} times`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
