'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';
import { auth } from '@/auth';

export async function saveEmailTemplate(formData: FormData) {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.role !== 'SUPERUSER') {
        throw new Error('Unauthorized');
    }

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const variables = formData.get('variables') as string;

    if (!name || !subject || !body || !variables) {
        throw new Error('Missing required fields');
    }

    if (id && id !== 'new') {
        // Update existing
        await prisma.emailTemplate.update({
            where: { id: parseInt(id) },
            data: { subject, body, variables }
        });

        await logAudit({
            userId: session?.user?.id ? parseInt(session.user.id) : undefined,
            action: 'UPDATE',
            resource: 'EmailTemplate',
            details: `Updated template: ${name}`,
            severity: 'WARN'
        });
    } else {
        // Create new
        await prisma.emailTemplate.create({
            data: { name, subject, body, variables }
        });

        await logAudit({
            userId: session?.user?.id ? parseInt(session.user.id) : undefined,
            action: 'CREATE',
            resource: 'EmailTemplate',
            details: `Created template: ${name}`,
            severity: 'WARN'
        });
    }

    revalidatePath('/superuser');
}
