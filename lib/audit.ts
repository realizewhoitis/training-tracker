import prisma from "@/lib/prisma";

export async function logAudit({
    userId,
    action,
    resource,
    details = "",
    severity = "INFO"
}: {
    userId?: number;
    action: string;
    resource: string;
    details?: string;
    severity?: "INFO" | "WARN" | "CRITICAL";
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
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
