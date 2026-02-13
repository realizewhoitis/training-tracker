'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTemplate(title: string) {
    const template = await prisma.formTemplate.create({
        data: {
            title,
            version: 1,
            isPublished: false,
        }
    });

    redirect(`/admin/forms/builder/${template.id}`);
}

export async function getTemplate(id: number) {
    return await prisma.formTemplate.findUnique({
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
    await prisma.formSection.create({
        data: {
            templateId,
            title,
            order
        }
    });
    revalidatePath(`/admin/forms/builder/${templateId}`);
}

export async function addField(sectionId: number, label: string, type: string, order: number) {
    await prisma.formField.create({
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
    const section = await prisma.formSection.update({
        where: { id: sectionId },
        data: { title }
    });
    revalidatePath(`/admin/forms/builder/${section.templateId}`);
}

export async function deleteSection(sectionId: number) {
    const section = await prisma.formSection.delete({
        where: { id: sectionId }
    });
    revalidatePath(`/admin/forms/builder/${section.templateId}`);
}

export async function publishTemplate(id: number) {
    await prisma.formTemplate.update({
        where: { id },
        data: { isPublished: true }
    });
    revalidatePath('/admin/forms');
}

export async function updateTemplateMetadata(id: number, data: { title?: string, namingConvention?: string }) {
    await prisma.formTemplate.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.namingConvention !== undefined && { namingConvention: data.namingConvention })
        }
    });
    revalidatePath(`/admin/forms/builder/${id}`);
}
