'use server'
import { enforceWriteAccess } from '@/lib/licenseAccess';
import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTenant } from '@/lib/tenant';

export async function createPolicyContainer(formData: FormData) {
    await enforceWriteAccess();
    const agencyId = await getTenant();
    if (!agencyId) return;

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    const reviewCycleMonthsRaw = formData.get('reviewCycleMonths') as string;
    const reviewCycleMonths = reviewCycleMonthsRaw ? parseInt(reviewCycleMonthsRaw) : null;

    const ownerIdRaw = formData.get('ownerId') as string;
    const ownerId = ownerIdRaw ? parseInt(ownerIdRaw) : null;

    let nextReviewDate = null;
    if (reviewCycleMonths) {
        nextReviewDate = new Date();
        nextReviewDate.setMonth(nextReviewDate.getMonth() + reviewCycleMonths);
    }

    await ((await getTenantPrisma()) as any).policyContainer.create({
        data: {
            agencyId,
            title,
            description,
            category,
            reviewCycleMonths,
            nextReviewDate,
            ownerId
        }
    });

    revalidatePath('/admin/policies');
}

export async function deletePolicyContainer(formData: FormData) {
    await enforceWriteAccess();
    const id = parseInt(formData.get('id') as string);
    await ((await getTenantPrisma()) as any).policyContainer.delete({ where: { id } });
    revalidatePath('/admin/policies');
}
