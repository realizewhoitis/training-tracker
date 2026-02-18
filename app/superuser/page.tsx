
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ShieldCheck, Key, Settings, Plus, UserPlus } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function SuperuserPage() {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.role !== 'SUPERUSER') {
        redirect('/');
    }

    const settings = await prisma.organizationSettings.findFirst() || { orgName: 'Not Configured', modules: '[]' };
    const licenses = await prisma.issuedLicense.findMany({ orderBy: { issuedAt: 'desc' } });
    const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });

    // Actions
    async function generateLicense(formData: FormData) {
        'use server';
        const clientName = formData.get('clientName') as string;
        if (!clientName) return;

        const key = `ORBIT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        await prisma.issuedLicense.create({
            data: {
                key,
                clientName,
                isActive: true
            }
        });
        revalidatePath('/superuser');
    }

    async function toggleModule(formData: FormData) {
        'use server';
        const moduleName = formData.get('module') as string;
        const currentModules = JSON.parse(settings.modules || '[]');

        let newModules;
        if (currentModules.includes(moduleName)) {
            newModules = currentModules.filter((m: string) => m !== moduleName);
        } else {
            newModules = [...currentModules, moduleName];
        }

        await prisma.organizationSettings.update({
            where: { id: settings.id || 1 }, // Assuming ID 1 for singleton settings
            data: { modules: JSON.stringify(newModules) }
        });
        revalidatePath('/superuser');
    }

    const activeModules = JSON.parse(settings.modules || '[]');

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                        <ShieldCheck className="mr-3 text-red-600" /> Superuser Control
                    </h1>
                    <p className="text-slate-500">Manage Orbit 911 SaaS Instances</p>
                </div>
                <div className="text-sm bg-white px-4 py-2 rounded-lg border shadow-sm">
                    Logged in as <strong>{session?.user?.email}</strong>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* License Generation */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Key className="mr-2 text-indigo-500" /> License Management
                    </h2>

                    <form action={generateLicense} className="flex gap-2 mb-6">
                        <input
                            name="clientName"
                            placeholder="Client Name (e.g. Springfield PD)"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            required
                        />
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                            Issue Key
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Client</th>
                                    <th className="px-3 py-2">Key</th>
                                    <th className="px-3 py-2">Issued</th>
                                    <th className="px-3 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {licenses.map(l => (
                                    <tr key={l.id}>
                                        <td className="px-3 py-2 font-medium">{l.clientName}</td>
                                        <td className="px-3 py-2 font-mono text-xs select-all bg-slate-50 p-1 rounded border">{l.key}</td>
                                        <td className="px-3 py-2 text-slate-500">{l.issuedAt.toLocaleDateString()}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {l.isActive ? 'Active' : 'Revoked'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {licenses.length === 0 && (
                                    <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">No licenses issued.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Module & User Control */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <Settings className="mr-2 text-slate-500" /> Active Modules
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">Toggle features for this installation.</p>

                        <div className="space-y-3">
                            {['INVENTORY', 'EIS', 'DOR', 'REPORTS'].map((mod) => (
                                <form key={mod} action={toggleModule}>
                                    <input type="hidden" name="module" value={mod} />
                                    <button className="w-full flex justify-between items-center p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                                        <span className="font-medium text-slate-700">{mod} System</span>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${activeModules.includes(mod) ? 'bg-green-500' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${activeModules.includes(mod) ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </button>
                                </form>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <UserPlus className="mr-2 text-blue-500" /> Existing Admins
                        </h2>
                        <ul className="space-y-2">
                            {users.map(u => (
                                <li key={u.id} className="text-sm flex justify-between p-2 bg-slate-50 rounded">
                                    <span>{u.name}</span>
                                    <span className="text-slate-500">{u.email}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
