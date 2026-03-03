import { getTenantPrisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getTenant } from '@/lib/tenant';
import MandatorySignOverlay from './MandatorySignOverlay';

export default async function GatekeeperProvider({ children }: { children: React.ReactNode }) {
    const session = await auth();
    // @ts-ignore
    const user = session?.user;

    // Unauthenticated or Superusers bypass the gatekeeper overlay
    if (!user || user.role === 'SUPERUSER') return <>{children}</>;

    const agencyId = await getTenant();
    if (!agencyId) return <>{children}</>;

    const prisma = await getTenantPrisma();

    // Check Global Override
    const agency = await prisma.agency.findUnique({ where: { id: agencyId } }) as any;
    if (agency?.globalGateOverride) return <>{children}</>;

    // Find the employee record
    const dbUser = await prisma.user.findUnique({
        where: { id: (user as any).id },
        include: { employee: true } as any
    }) as any;
    const employee = dbUser?.employee;
    if (!employee) return <>{children}</>;

    // Find all Level 3 published policies
    const allLevel3Policies = await prisma.policyVersion.findMany({
        where: {
            container: { agencyId },
            status: 'PUBLISHED',
            enforcementLevel: 3,
        },
        include: {
            container: true,
            attestations: {
                where: { employeeId: employee.empId }
            }
        },
        orderBy: { publishedAt: 'asc' } // Oldest active first
    });

    // Filter to ones the user hasn't signed, AND which target their role
    const pending = allLevel3Policies.find((version: any) => {
        // If they already signed, it's not pending
        if (version.attestations.length > 0) return false;

        // Check if role matches
        if (!version.targetRoles) return true; // Targets everyone
        try {
            const roles = JSON.parse(version.targetRoles);
            if (roles.includes(user.role)) return true;
        } catch { }

        return false;
    });

    if (pending) {
        return <MandatorySignOverlay version={pending} employeeId={employee.empId} />;
    }

    return <>{children}</>;
}
