
import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

/**
 * Ensures the upload directory exists.
 */
async function ensureDir(folder: string) {
    const fullPath = path.join(UPLOAD_DIR, folder);
    try {
        await fs.access(fullPath);
    } catch {
        await fs.mkdir(fullPath, { recursive: true });
    }
    return fullPath;
}

/**
 * Saves a file to the local filesystem.
 * @param file The file object (from FormData)
 * @param folder The subfolder to save to (e.g., 'certificates')
 * @returns The relative path to the saved file
 */
export async function saveFile(file: File, folder: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fullFolderPath = await ensureDir(folder);
    const fullPath = path.join(fullFolderPath, filename);

    await fs.writeFile(fullPath, buffer);

    return path.join(folder, filename).replace(/\\/g, '/');
}

/**
 * Reads a file from the local filesystem.
 * @param relativePath The relative path returned by saveFile
 * @returns The file buffer
 */
export async function readFile(relativePath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOAD_DIR, relativePath);

    // Security check to prevent directory traversal
    if (!fullPath.startsWith(UPLOAD_DIR)) {
        throw new Error('Invalid file path');
    }

    return await fs.readFile(fullPath);
}

/**
 * Gets the absolute path for a file (for serving).
 */
export function getAbsolutePath(relativePath: string): string {
    return path.join(UPLOAD_DIR, relativePath);
}
