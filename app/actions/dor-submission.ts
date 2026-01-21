'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function getDOR(id: number) {
    return await prisma.formResponse.findUnique({
        where: { id },
        include: {
            template: {
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
            },
            trainee: true,
            fto: true
        }
    });
}

export async function signDOR(id: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await prisma.formResponse.update({
        where: { id },
        data: {
            status: 'REVIEWED',
            traineeSignatureAt: new Date()
        }
    });

    revalidatePath(`/dor/${id}`);
}

export async function getLatestPublishedTemplate() {
    return await prisma.formTemplate.findFirst({
        where: { isPublished: true },
        orderBy: { version: 'desc' },
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

export async function getTrainees() {
    return await prisma.employee.findMany({
        where: { departed: false },
        orderBy: { empName: 'asc' }
    });
}

export async function submitDOR(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const templateId = parseInt(formData.get('templateId') as string);
    const traineeId = parseInt(formData.get('traineeId') as string);

    // Collect all field data
    const responseData: Record<string, any> = {};
    for (const [key, value] of Array.from(formData.entries())) {
        if (key.startsWith('field-')) {
            const fieldId = key.replace('field-', '');
            responseData[fieldId] = value;
        }
    }

    await prisma.formResponse.create({
        data: {
            templateId,
            traineeId,
            ftoId: parseInt(session.user.id),
            responseData: JSON.stringify(responseData),
            status: 'SUBMITTED'
        }
    });

    revalidatePath('/dashboard');
    redirect(`/employees/${traineeId}`);
}

export async function updateDOR(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const dorId = parseInt(formData.get('dorId') as string);
    const traineeId = parseInt(formData.get('traineeId') as string);

    // Collect all field data
    const responseData: Record<string, any> = {};
    for (const [key, value] of Array.from(formData.entries())) {
        if (key.startsWith('field-')) {
            const fieldId = key.replace('field-', '');
            responseData[fieldId] = value;
        }
    }

    await prisma.formResponse.update({
        where: { id: dorId },
        data: {
            traineeId,
            responseData: JSON.stringify(responseData),
        }
    });

    revalidatePath(`/dor/${dorId}`);
    redirect(`/dor/${dorId}`);
}
