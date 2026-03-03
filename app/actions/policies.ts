'use server'
import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function signPolicyAction(formData: FormData) {
    const versionId = parseInt(formData.get('versionId') as string);
    const employeeId = parseInt(formData.get('employeeId') as string);

    // Attempt to get IP from headers
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || 'Unknown IP');

    await (await getTenantPrisma()).userAttestation.create({
        data: {
            versionId,
            employeeId,
            ipAddress
        }
    });

    // Revalidate the entire app to release the Gatekeeper lock
    revalidatePath('/', 'layout');
}
