'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck

import { getTenantPrisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendEmail, generateDORSubmittedEmail, generateDORSignedEmail } from '@/lib/email';

export async function getDOR(id: number) {
    return await (await getTenantPrisma()).formResponse.findUnique({
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

export async function signDOR(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const id = parseInt(formData.get('dorId') as string);
    const comment = (formData.get('traineeComment') as string)?.trim() || null;

    const updatedDor = await (await getTenantPrisma()).formResponse.update({
        where: { id },
        data: {
            status: 'SIGNED',
            traineeSignatureAt: new Date(),
            traineeComment: comment,
            traineeDisputed: false,
        },
        include: { trainer: true, trainee: true }
    });

    if (updatedDor.trainer.email) {
        sendEmail({
            to: updatedDor.trainer.email,
            subject: `DOR Signed: #${updatedDor.id}`,
            html: generateDORSignedEmail(updatedDor.trainer.name, updatedDor.trainee.empName || 'Trainee', updatedDor.date, updatedDor.id)
        }).catch(e => console.error("Failed to send signature email", e));
    }

    revalidatePath(`/dor/${id}`);
}

export async function disputeDOR(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    const id = parseInt(formData.get('dorId') as string);
    const note = (formData.get('disputeNote') as string)?.trim();
    if (!note) throw new Error("A dispute reason is required.");

    const updatedDor = await (await getTenantPrisma()).formResponse.update({
        where: { id },
        data: {
            status: 'DISPUTED',
            traineeSignatureAt: new Date(),
            traineeDisputed: true,
            traineeDisputeNote: note,
        },
        include: { trainer: true, trainee: true }
    });

    if (updatedDor.trainer.email) {
        sendEmail({
            to: updatedDor.trainer.email,
            subject: `DOR Disputed: #${updatedDor.id}`,
            html: `<p>${updatedDor.trainee.empName || 'Trainee'} has disputed DOR #${updatedDor.id}.</p><p><strong>Reason:</strong> ${note}</p>`
        }).catch(e => console.error("Failed to send dispute email", e));
    }

    revalidatePath(`/dor/${id}`);
}

export async function approveDOR(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const sessionUser = session.user as any;
    const canApprove = sessionUser.permissions?.includes('dors.approve');
    if (!canApprove) throw new Error("You do not have permission to approve DORs.");

    const id = parseInt(formData.get('dorId') as string);
    const notes = (formData.get('approvalNotes') as string)?.trim() || null;

    await (await getTenantPrisma()).formResponse.update({
        where: { id },
        data: {
            status: 'APPROVED',
            approvedByUserId: parseInt(session.user.id),
            approvedAt: new Date(),
            approvalNotes: notes,
        }
    });

    revalidatePath(`/dor/${id}`);
    revalidatePath('/admin/forms/submissions');
}

export async function remindTrainee(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const sessionUser = session.user as any;
    const isAdminOrSupervisor = ['ADMIN', 'SUPERUSER', 'SUPERVISOR'].includes(sessionUser.role);
    if (!isAdminOrSupervisor) throw new Error("You do not have permission to send reminders.");

    const id = parseInt(formData.get('dorId') as string);
    const prisma = await getTenantPrisma();

    const dor = await prisma.formResponse.findUnique({
        where: { id },
        include: { trainee: true, trainer: true, template: true }
    });
    if (!dor) throw new Error("DOR not found.");
    if (dor.traineeSignatureAt) throw new Error("Trainee has already signed this DOR.");

    // 24-hour cooldown
    if (dor.lastReminderSentAt) {
        const hoursSince = (Date.now() - new Date(dor.lastReminderSentAt).getTime()) / 1000 / 60 / 60;
        if (hoursSince < 24) {
            const hoursLeft = Math.ceil(24 - hoursSince);
            throw new Error(`A reminder was already sent recently. Please wait ${hoursLeft} more hour${hoursLeft === 1 ? '' : 's'} before sending another.`);
        }
    }

    // Find the trainee's user account to get their email
    const traineeUser = await prisma.user.findFirst({ where: { empId: dor.traineeId } });
    if (!traineeUser?.email) throw new Error("Trainee does not have a linked user account with an email address.");

    const dorUrl = `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://www.orbit911.com'}/dor/${id}`;
    const reportName = dor.customTitle ?? `DOR #${id} — ${new Date(dor.date).toLocaleDateString()}`;

    await sendEmail({
        to: traineeUser.email,
        subject: `Reminder: Please sign your Daily Observation Report`,
        html: `
            <p>Hi ${dor.trainee.empName ?? 'there'},</p>
            <p>This is a reminder that your Daily Observation Report <strong>${reportName}</strong> written by ${dor.trainer.name} on ${new Date(dor.date).toLocaleDateString()} is awaiting your signature.</p>
            <p><a href="${dorUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Review &amp; Sign DOR</a></p>
            <p style="color:#6b7280;font-size:12px;margin-top:16px;">If you believe this is an error, please contact your supervisor.</p>
        `
    });

    await prisma.formResponse.update({
        where: { id },
        data: { lastReminderSentAt: new Date() }
    });

    revalidatePath(`/dor/${id}`);
}

export async function getLatestPublishedTemplate() {
    return await (await getTenantPrisma()).formTemplate.findFirst({
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
    return await (await getTenantPrisma()).employee.findMany({
        where: { departed: false },
        orderBy: { empName: 'asc' }
    });
}

export async function getTrainers() {
    return await (await getTenantPrisma()).user.findMany({
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
    const template = await (await getTenantPrisma()).formTemplate.findUnique({
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
        const traineeUser = await (await getTenantPrisma()).employee.findUnique({ where: { empId: traineeId } });
        const trainer = await (await getTenantPrisma()).user.findUnique({ where: { id: formTrainerId } });
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

    const newDor = await (await getTenantPrisma()).formResponse.create({
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
        const traineeUser = await (await getTenantPrisma()).user.findUnique({ where: { empId: traineeId } });
        const trainer = await (await getTenantPrisma()).user.findUnique({ where: { id: formTrainerId } });

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

    await (await getTenantPrisma()).formResponse.update({
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
    if ((session?.user as any)?.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin Access Required");
    }

    await (await getTenantPrisma()).formResponse.delete({
        where: { id }
    });

    revalidatePath('/admin/forms/submissions');
    revalidatePath('/dashboard');
    revalidatePath('/employees');
}
