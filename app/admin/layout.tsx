import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
        redirect('/login');
    }

    // Check if user has ADMIN or SUPERUSER role (or TRAINER for specific sub-routes, handled by page)
    // We allow TRAINER here to access /admin/forms etc, but individual pages might block them.
    // Ideally, we'd check permissions, but for now:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any).role;
    const allowedRoles = ['ADMIN', 'SUPERUSER', 'TRAINER'];

    if (!allowedRoles.includes(userRole)) {
        redirect('/');
    }

    return (
        <div className="h-full">
            {children}
        </div>
    );
}
