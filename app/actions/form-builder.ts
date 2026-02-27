'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTemplate(title: string) {
    const template = await (await getTenantPrisma()).formTemplate.create({
        data: {
            title,
            version: 1,
            isPublished: false,
            ratingScaleOptions: JSON.stringify(["1", "2", "3", "4", "5", "6", "7", "N.O."])
        }
    });

    redirect(`/admin/forms/builder/${template.id}`);
}

export async function getTemplate(id: number) {
    return await (await getTenantPrisma()).formTemplate.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: { order: 'asc' },
                include: {
                    fields: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    });
}

export async function addSection(templateId: number, title: string, order: number) {
    await (await getTenantPrisma()).formSection.create({
        data: {
            templateId,
            title,
            order
        }
    });
    revalidatePath(`/admin/forms/builder/${templateId}`);
}

export async function addField(sectionId: number, label: string, type: string, order: number) {
    await (await getTenantPrisma()).formField.create({
        data: {
            sectionId,
            label,
            type,
            order
        }
    });
    revalidatePath(`/admin/forms/builder`); // Revalidating builder area
}

export async function updateSection(sectionId: number, title: string) {
    const section = await (await getTenantPrisma()).formSection.update({
        where: { id: sectionId },
        data: { title }
    });
    revalidatePath(`/admin/forms/builder/${section.templateId}`);
}

export async function deleteSection(sectionId: number) {
    const section = await (await getTenantPrisma()).formSection.delete({
        where: { id: sectionId }
    });
    revalidatePath(`/admin/forms/builder/${section.templateId}`);
}

export async function publishTemplate(id: number) {
    await (await getTenantPrisma()).formTemplate.update({
        where: { id },
        data: { isPublished: true }
    });
    revalidatePath('/admin/forms');
}

export async function updateTemplateMetadata(id: number, data: { title?: string, namingConvention?: string, isPublished?: boolean, ratingScaleOptions?: string }) {
    await (await getTenantPrisma()).formTemplate.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.namingConvention !== undefined && { namingConvention: data.namingConvention }),
            ...(data.ratingScaleOptions !== undefined && { ratingScaleOptions: data.ratingScaleOptions }),
            ...(data.isPublished !== undefined && { isPublished: data.isPublished })
        }
    });
    revalidatePath(`/admin/forms/builder/${id}`);
}

export async function updateField(fieldId: number, label: string) {
    const field = await (await getTenantPrisma()).formField.update({
        where: { id: fieldId },
        data: { label },
        include: { section: true }
    });
    revalidatePath(`/admin/forms/builder/${field.section.templateId}`);
}

export async function deleteField(fieldId: number) {
    const field = await (await getTenantPrisma()).formField.delete({
        where: { id: fieldId },
        include: { section: true }
    });
    revalidatePath(`/admin/forms/builder/${field.section.templateId}`);
}
