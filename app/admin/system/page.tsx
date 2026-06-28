import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import SystemHealthClient from './SystemHealthClient';

export const dynamic = 'force-dynamic';

export default async function SystemHealthPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'SUPERUSER') redirect('/');

    const agencyId = (session?.user as any)?.agencyId as string | null;
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // SUPERUSER sees all agencies; ADMIN scoped to their own
    const where = role === 'SUPERUSER' ? {} : { agencyId };

    const [logs, stats] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 200,
            include: { user: { select: { name: true, email: true } } },
        }),
        prisma.auditLog.groupBy({
            by: ['severity'],
            where: { ...where, timestamp: { gte: since24h } },
            _count: true,
        }),
    ]);

    const countBySeverity = Object.fromEntries(stats.map(s => [s.severity, s._count]));

    const statsSummary = {
        criticalLast24h: countBySeverity['CRITICAL'] ?? 0,
        warnLast24h: countBySeverity['WARN'] ?? 0,
        eventsLast24h: Object.values(countBySeverity).reduce((a, b) => a + b, 0),
    };

    return <SystemHealthClient logs={logs as any} stats={statsSummary} />;
}
