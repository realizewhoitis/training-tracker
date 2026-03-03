import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
import { sendPolicyReviewReminderEmail } from '@/lib/mail';

export async function GET(request: Request) {
    // 1. Authenticate the Cron Request using the bearer token
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('Executing automated Policy Lifecycle Review scans...');

        const prisma = await getTenantPrisma();

        // Find all active policy containers that have a nextReviewDate
        const containers = await (prisma as any).policyContainer.findMany({
            where: {
                nextReviewDate: {
                    not: null
                }
            },
            include: {
                owner: true
            }
        });

        if (containers.length === 0) {
            return NextResponse.json({ message: 'No policies have active review cycles. Exiting.' });
        }

        const now = new Date();
        let notifiedCount = 0;

        for (const container of containers) {
            if (!container.nextReviewDate || !container.owner?.email) continue;

            const diffTime = container.nextReviewDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Trigger points: 90, 60, 30, and 0 days
            if ([90, 60, 30, 0].includes(diffDays)) {
                await sendPolicyReviewReminderEmail(container.owner.email, container.title, diffDays);
                notifiedCount++;
            }
        }

        console.log(`Policy Lifecycle scan complete. Dispatched ${notifiedCount} reminders.`);
        return NextResponse.json({ message: `Successfully checked ${containers.length} targets and dispatched ${notifiedCount} notifications.` });
    } catch (error) {
        console.error('Critical failure executing policy lifecycle cron:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
