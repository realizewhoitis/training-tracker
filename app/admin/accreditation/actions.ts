import { enforceWriteAccess } from '@/lib/licenseAccess';
'use server'

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTenant } from '@/lib/tenant';
import { auth } from '@/auth';

export async function createStandard(formData: FormData) {
    await enforceWriteAccess();
    const session = await auth();
    if ((session?.user as any)?.role === 'AUDITOR') throw new Error("Auditors have read-only access.");

    const agencyId = await getTenant();
    if (!agencyId) return;

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    await ((await getTenantPrisma()) as any).accreditationStandard.create({
        data: {
            agencyId,
            name,
            description
        }
    });

    revalidatePath('/admin/accreditation');
}

export async function deleteStandard(formData: FormData) {
    await enforceWriteAccess();
    const session = await auth();
    if ((session?.user as any)?.role === 'AUDITOR') throw new Error("Auditors have read-only access.");

    const id = parseInt(formData.get('id') as string);
    await ((await getTenantPrisma()) as any).accreditationStandard.delete({ where: { id } });
    revalidatePath('/admin/accreditation');
}

export async function createRequirement(formData: FormData) {
    await enforceWriteAccess();
    const session = await auth();
    if ((session?.user as any)?.role === 'AUDITOR') throw new Error("Auditors have read-only access.");

    const standardId = parseInt(formData.get('standardId') as string);
    const clauseNumber = formData.get('clauseNumber') as string;
    const description = formData.get('description') as string;

    await ((await getTenantPrisma()) as any).standardRequirement.create({
        data: {
            standardId,
            clauseNumber,
            description
        }
    });

    revalidatePath('/admin/accreditation');
    revalidatePath(`/admin/accreditation/${standardId}`);
}

export async function deleteRequirement(formData: FormData) {
    await enforceWriteAccess();
    const session = await auth();
    if ((session?.user as any)?.role === 'AUDITOR') throw new Error("Auditors have read-only access.");

    const id = parseInt(formData.get('id') as string);
    await ((await getTenantPrisma()) as any).standardRequirement.delete({ where: { id } });
    revalidatePath('/admin/accreditation');
}
