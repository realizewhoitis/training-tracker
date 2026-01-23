'use server';

import prisma from '@/lib/prisma';
import { saveFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { logAudit } from '@/lib/audit';

export async function updateSettings(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : undefined;

    const orgName = formData.get('orgName') as string;
    const logoFile = formData.get('logo') as File;
    const licenseKey = formData.get('licenseKey') as string;

    // Find existing settings or create first one
    const existing = await prisma.organizationSettings.findFirst();

    let logoPath = existing?.logoPath;

    if (logoFile && logoFile.size > 0) {
        // Save to 'branding' folder
        logoPath = await saveFile(logoFile, 'branding');
    }

    if (existing) {
        await prisma.organizationSettings.update({
            where: { id: existing.id },
            data: {
                orgName,
                logoPath: logoPath || undefined,
                licenseKey
            }
        });
    } else {
        await prisma.organizationSettings.create({
            data: {
                orgName: orgName || 'Orbit 911 Center',
                logoPath
            }
        });
    }

    await logAudit({
        userId,
        action: 'UPDATE_SETTINGS',
        resource: 'OrganizationSettings',
        details: `Updated organization settings (Name: ${orgName}, License Update: ${!!licenseKey})`,
        severity: 'WARN'
    });

    revalidatePath('/'); // Revalidate everything as header changes affect all pages
    revalidatePath('/admin/settings');
}

export async function getSettings() {
    const settings = await prisma.organizationSettings.findFirst();
    return settings || { orgName: 'Orbit 911', logoPath: null };
}
