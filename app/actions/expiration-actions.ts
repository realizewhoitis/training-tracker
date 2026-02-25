'use server';

import { getTenantPrisma } from '@/lib/prisma';
import { saveFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function updateExpirationDate(expirationId: number, newDate: string | null) {
    try {
        const dateValue = newDate ? new Date(newDate) : null;

        await (await getTenantPrisma()).expiration.update({
            where: { expirationID: expirationId },
            data: { Expiration: dateValue }
        });

        revalidatePath('/employees');
        return { success: true };
    } catch (error) {
        console.error('Failed to update expiration date:', error);
        return { success: false, error: 'Failed to update date' };
    }
}

export async function uploadCertificate(formData: FormData) {
    const expirationId = parseInt(formData.get('expirationId') as string);
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
        return { success: false, error: 'No file provided' };
    }

    try {
        // Save file to 'certificates' folder
        const relativePath = await saveFile(file, 'certificates');

        // Update database
        await (await getTenantPrisma()).expiration.update({
            where: { expirationID: expirationId },
            data: { documentPath: relativePath }
        });

        revalidatePath('/employees');
        return { success: true };
    } catch (error) {
        console.error('Upload failed:', error);
        return { success: false, error: 'Upload failed' };
    }
}
