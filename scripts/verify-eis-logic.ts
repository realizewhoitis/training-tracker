import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting EIS Logic Verification...");

    // 1. Create Test Employee
    const emp = await prisma.employee.create({
        data: {
            empName: 'Test Risk',
            departed: false
        }
    });
    console.log(`Created Employee: ${emp.empId}`);

    try {
        // 2. Create Low Score DOR
        // Need a template first or catch if fails?
        // We'll trust there is a template or just create raw formResponse.
        // FormResponse needs templateId, ftoId.
        const fto = await prisma.user.findFirst();
        const template = await prisma.formTemplate.findFirst();

        if (!fto || !template) {
            console.error("No FTO or Template found to create DOR.");
            return;
        }

        const lowScoreData = JSON.stringify({
            "1": 1, "2": 1, "3": 1 // Assuming fields 1,2,3 exist
        });

        await prisma.formResponse.create({
            data: {
                traineeId: emp.empId,
                ftoId: fto.id,
                templateId: template.id,
                date: new Date(),
                status: "REVIEWED",
                responseData: lowScoreData
            }
        });
        console.log("Created Low Score DOR");

        // 3. Run Logic (Copied from actions.ts for standalone test)
        console.log("Running Scan...");

        // Logic extraction
        const employees = await prisma.employee.findMany({
            where: { empId: emp.empId },
            include: {
                formResponses: {
                    where: {
                        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                        status: 'REVIEWED'
                    },
                    select: { responseData: true }
                }
            }
        });

        for (const e of employees) {
            let grandTotalScore = 0;
            let grandTotalCount = 0;
            for (const res of e.formResponses) {
                try {
                    const data = JSON.parse(res.responseData as string);
                    Object.values(data).forEach((val: any) => {
                        if (typeof val === 'number' && val >= 1 && val <= 7) {
                            grandTotalScore += val;
                            grandTotalCount++;
                        }
                    });
                } catch (e) { }
            }

            if (grandTotalCount > 0) {
                const avg = grandTotalScore / grandTotalCount;
                console.log(`Calculated Avg Score: ${avg}`);
                if (avg < 2.5) {
                    // Check Flag
                    // @ts-ignore
                    const flag = await prisma.eISFlag.create({
                        data: {
                            employeeId: e.empId,
                            type: 'PERFORMANCE',
                            severity: avg < 2.0 ? 'HIGH' : 'MEDIUM',
                            description: `Test Flag: Avg ${avg.toFixed(1)}`
                        }
                    });
                    console.log(`Flag Created: ${flag.id} - ${flag.severity}`);
                }
            }
        }

        // 4. Verify Flag Exists in DB
        // @ts-ignore
        const flags = await prisma.eISFlag.findMany({ where: { employeeId: emp.empId } });
        if (flags.length > 0) {
            console.log("SUCCESS: EIS Flag found in database.");
        } else {
            console.error("FAILURE: No flag found.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        // Cleanup
        //   await prisma.formResponse.deleteMany({ where: { traineeId: emp.empId } });
        //   // @ts-ignore
        //   await prisma.eISFlag.deleteMany({ where: { employeeId: emp.empId } });
        //   await prisma.employee.delete({ where: { empId: emp.empId } });
        console.log("Cleanup skipped for inspection.");
    }
}

main();
