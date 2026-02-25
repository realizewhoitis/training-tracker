'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function scanForFlags() {
    const perfCount = await checkPerformanceFlags();
    const assetCount = await checkAssetFlags();
    // compliance check can be added later or now if simple

    revalidatePath('/admin/eis');
    return { performance: perfCount, assets: assetCount };
}

async function checkPerformanceFlags() {
    // Logic: Calculate avg score for each employee over last 7 days.
    // If avg < 2.0 (arbitrary threshold from plan), create flag if not exists open.

    // 1. Get all employees
    const employees = await (await getTenantPrisma()).employee.findMany({
        include: {
            formResponses: {
                where: {
                    date: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                    status: 'REVIEWED' // Only count fully reviewed DORs
                },
                select: {
                    responseData: true
                }
            }
        }
    });

    let createdCount = 0;

    for (const emp of employees) {
        if (emp.formResponses.length === 0) continue;

        let grandTotalScore = 0;
        let grandTotalCount = 0;

        for (const res of emp.formResponses) {
            try {
                const data = JSON.parse(res.responseData as string);
                // Iterate values and sum numeric ones (1-7 range heuristic)
                Object.values(data).forEach((val: any) => {
                    if (typeof val === 'number' && val >= 1 && val <= 7) {
                        grandTotalScore += val;
                        grandTotalCount++;
                    }
                });
            } catch (e) {
                // Ignore parsing errors
            }
        }

        if (grandTotalCount === 0) continue;

        const avgScore = grandTotalScore / grandTotalCount;

        if (avgScore < 2.5) { // Threshold for "Low Performance"
            // Check if open flag exists
            // @ts-ignore - Prisma client not regenerated yet
            const existing = await (await getTenantPrisma()).eISFlag.findFirst({
                where: {
                    employeeId: emp.empId,
                    type: 'PERFORMANCE',
                    status: 'OPEN'
                }
            });

            if (!existing) {
                // @ts-ignore
                await (await getTenantPrisma()).eISFlag.create({
                    data: {
                        employeeId: emp.empId,
                        type: 'PERFORMANCE',
                        severity: avgScore < 2.0 ? 'HIGH' : 'MEDIUM',
                        description: `Avg Score ${avgScore.toFixed(1)} over last 7 days (${emp.formResponses.length} reports)`,
                    }
                });
                createdCount++;
            }
        }
    }
    return createdCount;
}

async function checkAssetFlags() {
    // Logic: Find assigned assets with condition POOR or DAMAGED
    const problematicAssets = await (await getTenantPrisma()).assetAssignment.findMany({
        where: {
            returnedAt: null,
            asset: {
                condition: { in: ['POOR', 'DAMAGED'] }
            }
        },
        include: {
            asset: true
        }
    });

    let createdCount = 0;

    for (const assignment of problematicAssets) {
        const existing = await (await getTenantPrisma()).eISFlag.findFirst({
            where: {
                employeeId: assignment.employeeId,
                type: 'ASSET',
                status: 'OPEN',
                description: { contains: assignment.asset.name }
            }
        });

        if (!existing) {
            await (await getTenantPrisma()).eISFlag.create({
                data: {
                    employeeId: assignment.employeeId,
                    type: 'ASSET',
                    severity: assignment.asset.condition === 'DAMAGED' ? 'HIGH' : 'MEDIUM',
                    description: `Assigned asset ${assignment.asset.name} is in ${assignment.asset.condition} condition`,
                }
            });
            createdCount++;
        }
    }
    return createdCount;
}

export async function resolveFlag(flagId: number, notes: string) {
    await (await getTenantPrisma()).eISFlag.update({
        where: { id: flagId },
        data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            resolutionNotes: notes
        }
    });
    revalidatePath('/admin/eis');
}

export async function dismissFlag(flagId: number) {
    await (await getTenantPrisma()).eISFlag.update({
        where: { id: flagId },
        data: {
            status: 'DISMISSED',
            resolvedAt: new Date(),
        }
    });
    revalidatePath('/admin/eis');
}
