'use server';

import prisma from '@/lib/prisma';
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
        // Convert to Base64 for database storage (Vercel compatible)
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = logoFile.type || 'image/png';
        logoPath = `data:${mimeType};base64,${base64}`;
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
    // Default to ALL modules enabled for backward compatibility if settings or modules field is missing
    const defaultModules = JSON.stringify(['INVENTORY', 'EIS', 'DOR', 'REPORTS']);

    if (!settings) {
        return { orgName: 'Orbit 911', logoPath: null, modules: defaultModules };
    }

    return {
        ...settings,
        modules: settings.modules || defaultModules
    };
}
