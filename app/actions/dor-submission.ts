'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendEmail, generateDORSubmittedEmail, generateDORSignedEmail } from '@/lib/email';

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
            trainer: true
        }
    });
}

export async function signDOR(id: number) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const updatedDor = await prisma.formResponse.update({
        where: { id },
        data: {
            status: 'REVIEWED',
            traineeSignatureAt: new Date()
        },
        include: {
            trainer: true,
            trainee: true
        }
    });

    if (updatedDor.trainer.email) {
        // Fire and forget email to avoid blocking UI
        sendEmail({
            to: updatedDor.trainer.email,
            subject: `DOR Signed: #${updatedDor.id}`,
            html: generateDORSignedEmail(updatedDor.trainer.name, updatedDor.trainee.empName || 'Trainee', updatedDor.date, updatedDor.id)
        }).catch(e => console.error("Failed to send signature email", e));
    }

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

export async function getTrainers() {
    return await prisma.user.findMany({
        where: {
            role: { in: ['TRAINER', 'SUPERVISOR', 'ADMIN'] }
        },
        orderBy: { name: 'asc' }
    });
}

export async function submitDOR(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const templateId = parseInt(formData.get('templateId') as string);
    const traineeId = parseInt(formData.get('traineeId') as string);
    const formTrainerId = formData.get('trainerId') ? parseInt(formData.get('trainerId') as string) : parseInt(session.user.id);

    // Fetch Template for Naming Convention
    const template = await prisma.formTemplate.findUnique({
        where: { id: templateId },
        include: { sections: { include: { fields: true } } }
    });

    // Collect all field data & Helper map for labels
    const responseData: Record<string, any> = {};
    const fieldLabelMap: Record<string, string> = {};

    for (const [key, value] of Array.from(formData.entries())) {
        if (key.startsWith('field-')) {
            const fieldId = key.replace('field-', '');
            responseData[fieldId] = value;
        }
    }

    // Build field label map
    if (template) {
        template.sections.forEach(section => {
            section.fields.forEach(field => {
                fieldLabelMap[field.label] = String(field.id);
            });
        });
    }

    let customTitle = null;
    if (template?.namingConvention) {
        const traineeUser = await prisma.employee.findUnique({ where: { empId: traineeId } });
        const trainer = await prisma.user.findUnique({ where: { id: formTrainerId } });
        const dateStr = new Date().toISOString().split('T')[0];

        let title = template.namingConvention;
        title = title.replace(/\{\{date\}\}/g, dateStr);
        title = title.replace(/\{\{trainee\}\}/g, traineeUser?.empName || 'Unknown');
        title = title.replace(/\{\{trainer\}\}/g, trainer?.name || 'Unknown');

        // Replace field values {{field:Label}}
        const fieldRegex = /\{\{field:(.+?)\}\}/g;
        title = title.replace(fieldRegex, (match, fieldLabel) => {
            const fieldId = fieldLabelMap[fieldLabel];
            if (fieldId && responseData[fieldId]) {
                return String(responseData[fieldId]);
            }
            return ''; // Empty string if field not found or empty
        });

        customTitle = title;
    }

    const newDor = await prisma.formResponse.create({
        data: {
            templateId,
            traineeId,
            trainerId: formTrainerId,
            responseData: JSON.stringify(responseData),
            customTitle,
            status: 'SUBMITTED'
        }
    });

    // Email Notification
    try {
        const traineeUser = await prisma.user.findUnique({ where: { empId: traineeId } });
        const trainer = await prisma.user.findUnique({ where: { id: formTrainerId } });

        if (traineeUser?.email && trainer) {
            await sendEmail({
                to: traineeUser.email,
                subject: `New DOR Submitted: ${customTitle || `#${newDor.id}`}`,
                html: generateDORSubmittedEmail(traineeUser.name, trainer.name, newDor.date, newDor.id)
            });
        }
    } catch (e) {
        console.error("Failed to send submission email", e);
    }

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

export async function deleteDOR(id: number) {
    const session = await auth();
    // Strict Admin Check
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin Access Required");
    }

    await prisma.formResponse.delete({
        where: { id }
    });

    revalidatePath('/admin/forms/submissions');
    revalidatePath('/dashboard');
    revalidatePath('/employees');
}
