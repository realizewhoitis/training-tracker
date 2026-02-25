import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function getTenant() {
    const session = await auth();
    const user = session?.user as any;
    if (!user) return null;

    if (user.role === 'SUPERUSER') {
        const cookieStore = await cookies();
        const override = cookieStore.get('super_agency_override');
        if (override?.value) return override.value;
    }

    return user.agencyId as string | null;
}

export async function requireTenant() {
    const agencyId = await getTenant();
    if (!agencyId) {
        redirect('/login');
    }
    return agencyId;
}
