'use server';
import { enforceWriteAccess } from '@/lib/licenseAccess';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { saveFile } from '@/lib/storage';

export async function saveDraftAction(formData: FormData) {
    await enforceWriteAccess();
    const versionId = parseInt(formData.get('versionId') as string);
    const containerId = parseInt(formData.get('containerId') as string);
    const prisma = await getTenantPrisma();

    // Ensure we are only saving a draft
    const version = await prisma.policyVersion.findUnique({ where: { id: versionId } });
    if (!version || version.status !== 'DRAFT') {
        throw new Error("Cannot edit a non-draft version.");
    }

    const rolesForm = formData.getAll('targetRoles');
    let targetRoles = null;
    if (rolesForm.length > 0) {
        targetRoles = JSON.stringify(rolesForm);
    }

    const pdfFile = formData.get('pdfFile') as File | null;
    let mediaUrl = undefined;
    let mediaType = undefined;

    if (pdfFile && pdfFile.size > 0) {
        const savedPath = await saveFile(pdfFile, 'policies');
        mediaUrl = `/api/files/${savedPath}`;
        mediaType = pdfFile.type;
    }

    await prisma.policyVersion.update({
        where: { id: versionId },
        data: {
            title: formData.get('title') as string,
            content: formData.get('content') as string || '',
            enforcementLevel: parseInt(formData.get('enforcementLevel') as string) || 1,
            readingTimer: parseInt(formData.get('readingTimer') as string) || 0,
            targetRoles: targetRoles,
            ...(mediaUrl ? { mediaUrl, mediaType } : {})
        }
    });

    revalidatePath(`/admin/policies/${containerId}`);
}

export async function publishDraftAction(formData: FormData) {
    await enforceWriteAccess();
    const versionId = parseInt(formData.get('versionId') as string);
    const containerId = parseInt(formData.get('containerId') as string);
    const prisma = await getTenantPrisma();

    // Ensure it is a draft
    const version = await prisma.policyVersion.findUnique({
        where: { id: versionId },
        include: { container: true }
    });
    if (!version || version.status !== 'DRAFT') {
        throw new Error("This version is already published or archived.");
    }

    // First save any pending changes
    await saveDraftAction(formData);

    // Archive globally active versions in this container
    await prisma.policyVersion.updateMany({
        where: {
            containerId: containerId,
            status: 'PUBLISHED',
            id: { not: versionId }
        },
        data: {
            status: 'ARCHIVED',
            archivedAt: new Date()
        }
    });

    // Publish this one
    await prisma.policyVersion.update({
        where: { id: versionId },
        data: {
            status: 'PUBLISHED',
            publishedAt: new Date()
        }
    });

    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    try {
        await prisma.auditLog.create({
            data: {
                agencyId: version.container.agencyId,
                action: 'PUBLISH_POLICY',
                resource: 'PolicyVersion',
                userId: userId,
                details: JSON.stringify({ versionId, containerId })
            }
        });
    } catch (e) { }

    redirect(`/admin/policies/${containerId}`);
}
