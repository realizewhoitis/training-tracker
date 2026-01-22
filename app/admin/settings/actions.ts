'use server';

import prisma from '@/lib/prisma';
import { saveFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
    const orgName = formData.get('orgName') as string;
    const logoFile = formData.get('logo') as File;

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
                logoPath: logoPath || undefined
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

    revalidatePath('/'); // Revalidate everything as header changes affect all pages
    revalidatePath('/admin/settings');
}

export async function getSettings() {
    const settings = await prisma.organizationSettings.findFirst();
    return settings || { orgName: 'Orbit 911', logoPath: null };
}
