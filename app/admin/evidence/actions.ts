'use server'
import { enforceWriteAccess } from '@/lib/licenseAccess';

import { getTenantPrisma } from '@/lib/prisma';
import { getTenant } from '@/lib/tenant';
import { saveFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function uploadEvidence(formData: FormData) {
    await enforceWriteAccess();
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    if ((session?.user as any)?.role === 'AUDITOR') throw new Error("Auditors have read-only access.");
    const uploaderId = parseInt(session.user.id);

    const agencyId = await getTenant();
    if (!agencyId) return;

    const file = formData.get('file') as File;
    const requirementId = formData.get('requirementId') ? parseInt(formData.get('requirementId') as string) : null;
    const containerId = formData.get('containerId') ? parseInt(formData.get('containerId') as string) : null;

    if (!file || file.size === 0) throw new Error("File is empty.");

    const savedPath = await saveFile(file, 'evidence');

    await ((await getTenantPrisma()) as any).complianceEvidence.create({
        data: {
            agencyId,
            requirementId,
            containerId,
            fileUrl: `/api/files/${savedPath}`,
            fileName: file.name,
            isLocked: true,
            uploadedById: uploaderId
        }
    });

    if (containerId) revalidatePath(`/admin/policies/${containerId}`);
    return { success: true };
}
