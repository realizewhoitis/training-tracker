
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
    // SECURITY: Only run if no superuser exists
    const existingSuperuser = await prisma.user.findFirst({
        where: { role: 'SUPERUSER' }
    });

    if (existingSuperuser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white p-8 rounded-xl shadow-sm border text-center max-w-md">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Setup Already Complete</h1>
                    <p className="text-slate-600 mb-6">
                        A Superuser account already exists. For security reasons, setup cannot be run again.
                    </p>
                    <a href="/" className="text-indigo-600 hover:underline">
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    // 1. Create Superuser
    const email = 'superuser@orbit911.com';
    const password = await bcrypt.hash('orbit!super', 10);

    await prisma.user.create({
        data: {
            email,
            name: 'System Superuser',
            password,
            role: 'SUPERUSER',
        },
    });

    // 2. Create Default License
    await prisma.issuedLicense.create({
        data: {
            key: 'ORBIT-SYSTEM-DEFAULT-KEY',
            clientName: 'System Default',
            isActive: true
        }
    });

    // 3. Update Settings
    const settings = await prisma.organizationSettings.findFirst();
    if (settings) {
        await prisma.organizationSettings.update({
            where: { id: settings.id },
            data: { licenseKey: 'ORBIT-SYSTEM-DEFAULT-KEY' }
        });
    } else {
        await prisma.organizationSettings.create({
            data: {
                orgName: 'Orbit 911 Center',
                licenseKey: 'ORBIT-SYSTEM-DEFAULT-KEY',
                modules: JSON.stringify(['INVENTORY', 'EIS', 'DOR', 'REPORTS'])
            }
        });
    }

    // 4. Redirect to Superuser Dashboard
    redirect('/superuser');
}
