
import prisma from "@/lib/prisma";

export async function verifyLicense() {
    // 1. Get Settings
    const settings = await prisma.organizationSettings.findFirst();
    if (!settings) return { valid: true, status: "NO_SETTINGS_FOUND" }; // Fail open for now or fail closed?

    // 2. Check Key Format (Mock)
    // Real impl would verify cryptographic signature
    const key = settings.licenseKey || "";

    // Check against IssuedLicense table
    const issuedLicense = await prisma.issuedLicense.findUnique({
        where: { key }
    });

    if (!issuedLicense) {
        return { valid: false, status: "INVALID_KEY" };
    }

    if (!issuedLicense.isActive) {
        return { valid: false, status: "REVOKED" };
    }

    // 3. Check Expiry
    if (settings.licenseExpiry && new Date() > settings.licenseExpiry) {
        return { valid: false, status: "EXPIRED" };
    }

    return { valid: true, status: "ACTIVE" };
}
