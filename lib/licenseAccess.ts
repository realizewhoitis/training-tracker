import { verifyLicense } from './license';

export async function enforceWriteAccess() {
    const license = await verifyLicense();
    if (license.status === "GRACE") {
        throw new Error("License in Grace Period - Read Only Mode: Modifications are disabled.");
    }
    if (!license.valid) {
        throw new Error("Invalid or Expired License.");
    }
}
