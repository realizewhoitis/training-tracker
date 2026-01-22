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

    // Check if user has ADMIN role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session.user as any).role !== 'ADMIN') {
        redirect('/'); // specific forbidden page would be better, but home for now
    }

    return (
        <div className="h-full">
            {children}
        </div>
    );
}
