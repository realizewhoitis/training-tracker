import { enforceWriteAccess } from '@/lib/licenseAccess';
'use server'
import { getTenantPrisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createDraftAction(formData: FormData) {
    await enforceWriteAccess();
    const containerId = parseInt(formData.get('containerId') as string);
    const prisma = await getTenantPrisma();

    // Find the most recent version to clone its settings
    const latest = await prisma.policyVersion.findFirst({
        where: { containerId },
        orderBy: { id: 'desc' }
    });

    let nextVersion = "1.0";
    if (latest) {
        const parts = latest.versionNumber.split('.');
        const minor = parseInt(parts[1] || "0") + 1;
        nextVersion = `${parts[0]}.${minor}`;
    }

    const container = await prisma.policyContainer.findUnique({ where: { id: containerId } });

    const draft = await prisma.policyVersion.create({
        data: {
            containerId,
            versionNumber: nextVersion,
            status: 'DRAFT',
            title: latest?.title || container?.title || 'New Draft',
            content: latest?.content || '<p>Start writing your policy here...</p>',
            mediaUrl: latest?.mediaUrl,
            mediaType: latest?.mediaType,
            enforcementLevel: latest?.enforcementLevel || 1,
            readingTimer: latest?.readingTimer || 0,
            targetRoles: latest?.targetRoles,
        }
    });

    redirect(`/admin/policies/${containerId}/edit/${draft.id}`);
}
