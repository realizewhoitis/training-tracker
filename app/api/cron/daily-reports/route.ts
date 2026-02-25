import { NextResponse } from 'next/server';
import { getTenantPrisma } from '@/lib/prisma';
import { sendDailyDORDigestEmail } from '@/lib/mail';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';

// Helper function to resolve dynamic user capabilities
async function getEffectivePermissions(user: any): Promise<string[]> {
    if (user.customPermissions) {
        return JSON.parse(user.customPermissions);
    }
    const template = await (await getTenantPrisma()).roleTemplate.findUnique({
        where: { roleName: user.role }
    });
    if (template) {
        return JSON.parse(template.permissions);
    }
    return DEFAULT_ROLE_PERMISSIONS[user.role] || [];
}

export async function GET(request: Request) {
    // 1. Authenticate the Cron Request using the bearer token
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('Executing automated Daily DOR Digest...');

        // 2. Fetch trailing 24 hour submissions
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const recentSubmissions = await (await getTenantPrisma()).formResponse.findMany({
            where: {
                date: {
                    gte: yesterday,
                },
            },
            include: {
                trainee: true,
                trainer: true,
                template: true
            },
            orderBy: {
                date: 'desc',
            }
        });

        if (recentSubmissions.length === 0) {
            console.log('No submissions found in the trailing 24 hours. Gracefully exiting.');
            return NextResponse.json({ message: 'No submissions found in the last 24 hours. Email skipped.' });
        }

        // 3. Identify all users eligible to receive the report
        const activeUsers = await (await getTenantPrisma()).user.findMany();

        const recipientEmails: string[] = [];

        for (const user of activeUsers) {
            const permissions = await getEffectivePermissions(user);
            if (permissions.includes(PERMISSIONS.RECEIVE_DAILY_REPORTS)) {
                recipientEmails.push(user.email);
            }
        }

        if (recipientEmails.length === 0) {
            console.log('No users possess the RECEIVE_DAILY_REPORTS capability. Gracefully exiting.');
            return NextResponse.json({ message: 'No users possess the RECEIVE_DAILY_REPORTS permission. Email skipped.' });
        }

        // 4. Dispatch the bundled HTML emails
        console.log(`Dispatching aggregated payload (${recentSubmissions.length} submissions) to ${recipientEmails.length} recipients...`);
        for (const email of recipientEmails) {
            await sendDailyDORDigestEmail(email, recentSubmissions);
        }

        console.log('Cron Job Completed Successfully.');
        return NextResponse.json({ message: `Successfully dispatched daily digest to ${recipientEmails.length} users.`, processed: recentSubmissions.length });
    } catch (error) {
        console.error('Critical failure executing daily reports cron:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
