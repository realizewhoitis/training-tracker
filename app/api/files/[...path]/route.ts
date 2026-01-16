
import { auth } from '@/auth';
import { getAbsolutePath } from '@/lib/storage';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import mime from 'mime';

export async function GET(
    req: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Reconstruct the file path from the catch-all param
    const relativePath = params.path.join('/');
    const fullPath = getAbsolutePath(relativePath);

    try {
        const fileBuffer = await fs.readFile(fullPath);
        const stats = await fs.stat(fullPath);

        // Determine content type based on extension
        const contentType = mime.getType(fullPath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': stats.size.toString(),
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('File not found', { status: 404 });
    }
}
