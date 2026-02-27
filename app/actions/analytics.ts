'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getTraineeProgress(traineeId: number) {
    const session = await auth();
    if (!session?.user) return [];

    // Fetch all submitted/reviewed DORs for this trainee
    const dors = await (await getTenantPrisma()).formResponse.findMany({
        where: {
            traineeId: traineeId,
            status: { in: ['SUBMITTED', 'REVIEWED'] }
        },
        orderBy: { date: 'asc' },
        include: { template: { include: { sections: { include: { fields: true } } } } }
    });

    // Process data for the chart
    const progressData = dors.map(dor => {
        const responseData = JSON.parse(dor.responseData);
        let totalScore = 0;
        let scoreCount = 0;

        // Iterate through all fields in the template to find ratings
        dor.template.sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.type === 'RATING') {
                    const val = responseData[field.id.toString()];
                    // Safely ignore custom string ratings like N.A., N.O., Bonus, etc.
                    if (val && !isNaN(parseInt(val)) && val.trim() === parseInt(val).toString()) {
                        totalScore += parseInt(val);
                        scoreCount++;
                    }
                }
            });
        });

        const average = scoreCount > 0 ? (totalScore / scoreCount).toFixed(2) : 0;

        return {
            date: new Date(dor.date).toLocaleDateString(),
            fullDate: dor.date, // For sorting if needed
            average: parseFloat(average as string),
            id: dor.id
        };
    });

    return progressData;
}

export async function getCategoryStrengths(traineeId: number) {
    const session = await auth();
    if (!session?.user) return [];

    // Fetch all submitted/reviewed DORs
    const dors = await (await getTenantPrisma()).formResponse.findMany({
        where: {
            traineeId: traineeId,
            status: { in: ['SUBMITTED', 'REVIEWED'] }
        },
        include: { template: { include: { sections: { include: { fields: true } } } } }
    });

    const categoryStats: Record<string, { total: number; count: number }> = {};

    dors.forEach(dor => {
        const responseData = JSON.parse(dor.responseData);

        dor.template.sections.forEach(section => {
            // We assume Section Title approximates "Category" for now
            // In a more advanced version, we might tag fields with specific categories
            if (!categoryStats[section.title]) {
                categoryStats[section.title] = { total: 0, count: 0 };
            }

            section.fields.forEach(field => {
                if (field.type === 'RATING') {
                    const val = responseData[field.id.toString()];
                    if (val && !isNaN(parseInt(val)) && val.trim() === parseInt(val).toString()) {
                        categoryStats[section.title].total += parseInt(val);
                        categoryStats[section.title].count++;
                    }
                }
            });
        });
    });

    // Transform to array for Recharts
    const radarData = Object.keys(categoryStats).map(category => {
        const { total, count } = categoryStats[category];
        const average = count > 0 ? (total / count).toFixed(2) : 0;
        return {
            category,
            score: parseFloat(average as string),
            fullMark: 7 // Max score on standard scale
        };
    });

    return radarData;
}
