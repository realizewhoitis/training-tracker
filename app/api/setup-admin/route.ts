
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const email = 'admin@example.com';
        const password = await bcrypt.hash('password123', 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN', // Ensure role is updated if exists
                password: password // Update password just in case
            },
            create: {
                email,
                name: 'System Admin',
                password,
                role: 'ADMIN',
            },
        });

        return NextResponse.json({
            success: true,
            message: "✅ Admin user created/updated successfully.",
            user: { email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Setup failed:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
