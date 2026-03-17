import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function EmployeesLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if ((session?.user as any)?.role === 'AUDITOR') {
        redirect('/admin/accreditation');
    }
    return <>{children}</>;
}
