import { getTenantPrisma } from '@/lib/prisma';

export async function logAudit({
    userId,
    agencyId,
    action,
    resource,
    details = "",
    severity = "INFO"
}: {
    userId?: number;
    agencyId?: string | null;
    action: string;
    resource: string;
    details?: string;
    severity?: "INFO" | "WARN" | "CRITICAL";
}) {
    try {
        await (await getTenantPrisma()).auditLog.create({
            data: {
                userId,
                agencyId: agencyId ?? undefined,
                action,
                resource,
                details,
                severity
            }
        });
    } catch (error) {
        // Audit logging should essentially never fail the main request, 
        // but in high security envs you might want to throw.
        console.error("Failed to log audit event:", error);
    }
}
