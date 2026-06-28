import prisma from '@/lib/prisma';

/**
 * Log a server-side error to the AuditLog.
 * Safe to call from anywhere — never throws.
 */
export async function logError({
    error,
    route,
    context,
    userId,
    agencyId,
}: {
    error: unknown;
    route?: string;
    context?: string;
    userId?: number;
    agencyId?: string | null;
}) {
    try {
        const err = error instanceof Error ? error : new Error(String(error));
        const details = JSON.stringify({
            message: err.message,
            stack: err.stack?.slice(0, 2000), // cap stack traces
            context,
        });

        await prisma.auditLog.create({
            data: {
                userId: userId ?? null,
                agencyId: agencyId ?? null,
                action: 'SYSTEM_ERROR',
                resource: route ?? 'Unknown',
                details,
                severity: 'CRITICAL',
            },
        });
    } catch {
        // Logging must never crash the app
        console.error('[logError] Failed to write error to AuditLog:', error);
    }
}
