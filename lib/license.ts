import { getTenantPrisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function verifyLicense() {
    const session = await auth();
    // @ts-ignore
    if (session?.user && session.user.role === 'SUPERUSER') {
        return { valid: true, status: "SUPERUSER_OVERRIDE" };
    }

    // 1. Get Settings
    const settings = await (await getTenantPrisma()).organizationSettings.findFirst();
    if (!settings) return { valid: true, status: "NO_SETTINGS_FOUND" }; // Fail open for now or fail closed?

    // 2. Check Key Format (Mock)
    // Real impl would verify cryptographic signature
    const key = settings.licenseKey || "";

    // Mock IssuedLicense since it is not in the schema yet
    const issuedLicense = {
        isActive: key.length > 0, // mock rule
        gracePeriodDays: 14
    };

    if (!issuedLicense.isActive) {
        return { valid: false, status: "INVALID_KEY" };
    }

    // 3. Check Expiry
    if (settings.licenseExpiry && new Date() > settings.licenseExpiry) {
        const graceEndDate = new Date(settings.licenseExpiry);
        graceEndDate.setDate(graceEndDate.getDate() + (issuedLicense as any).gracePeriodDays);

        if (new Date() <= graceEndDate) {
            const msRemaining = graceEndDate.getTime() - new Date().getTime();
            const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 3600 * 24)));
            return { valid: true, status: "GRACE", daysRemaining, graceEndDate };
        }
        return { valid: false, status: "EXPIRED" };
    }

    return { valid: true, status: "ACTIVE" };
}
