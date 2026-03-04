'use server'
import { enforceWriteAccess } from '@/lib/licenseAccess';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addMapping(versionId: number, requirementId: number, paragraph: string) {
    await enforceWriteAccess();
    const prisma = await getTenantPrisma() as any;
    await prisma.policyMapping.create({
        data: {
            versionId,
            requirementId,
            mappedParagraphs: paragraph || null
        }
    });
    revalidatePath(`/admin/policies`);
}

export async function deleteMapping(mappingId: number) {
    await enforceWriteAccess();
    const prisma = await getTenantPrisma() as any;
    await prisma.policyMapping.delete({
        where: { id: mappingId }
    });
    revalidatePath(`/admin/policies`);
}
