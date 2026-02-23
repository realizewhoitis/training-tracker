import { getSettings } from '@/app/admin/settings/actions';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Users, BookOpen, UserPlus, Settings, ClipboardList, Package, FileText, Inbox, ShieldCheck, LogOut } from 'lucide-react';
import { auth, signOut } from '@/auth';

// ...

const Sidebar = async () => {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;
    const settings = await getSettings();
    const activeModules = JSON.parse(settings.modules || '[]');

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-700">
                {settings.logoPath ? (
                    <div className="flex flex-col items-start">
                        <Image
                            src={settings.logoPath?.startsWith('data:') ? settings.logoPath : `/api/files/${settings.logoPath}`}
                            alt={settings.orgName}
                            width={150}
                            height={50}
                            className="h-12 w-auto object-contain mb-2"
                        />
                        <h1 className="text-xl font-bold text-white">
                            {settings.orgName}
                        </h1>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        {settings.orgName}
                    </h1>
                )}

                <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">
                    Training in motion
                </p>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link
                    href="/"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                >
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                    href="/employees"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                >
                    <Users className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="font-medium">Employees</span>
                </Link>
                <Link
                    href="/training"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                >
                    <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="font-medium">Training</span>
                </Link>
                {activeModules.includes('INVENTORY') && (
                    <Link
                        href="/inventory"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                    >
                        <Package className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        <span className="font-medium">Inventory</span>
                    </Link>
                )}
                {activeModules.includes('REPORTS') && (
                    <Link
                        href="/reports"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                    >
                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        <span className="font-medium">Reports</span>
                    </Link>
                )}
                {(userRole === 'ADMIN' || userRole === 'TRAINER' || userRole === 'SUPERUSER') && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                        {activeModules.includes('DOR') && (
                            <>
                                <Link
                                    href="/dor/new"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                                >
                                    <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                    <span className="font-medium">Write DOR</span>
                                </Link>
                                <Link
                                    href="/admin/forms"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                                >
                                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                    <span className="font-medium">Form Builder</span>
                                </Link>
                                <Link
                                    href="/admin/forms/submissions"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                                >
                                    <Inbox className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                    <span className="font-medium">Form Inbox</span>
                                </Link>
                            </>
                        )}
                        {(userRole === 'ADMIN' || userRole === 'SUPERUSER') && (
                            <Link
                                href="/admin/users"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                            >
                                <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                <span className="font-medium">Manage Users</span>
                            </Link>
                        )}
                        {(userRole === 'ADMIN' || userRole === 'SUPERUSER') && (
                            <Link
                                href="/admin/settings"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                            >
                                <Settings className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                <span className="font-medium">System Settings</span>
                            </Link>
                        )}
                        {(userRole === 'ADMIN' || userRole === 'SUPERUSER') && (
                            <Link
                                href="/admin/roles"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                            >
                                <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                <span className="font-medium">Manage Roles</span>
                            </Link>
                        )}
                        {userRole === 'SUPERUSER' && (
                            <Link
                                href="/superuser"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-purple-900/50 transition-all duration-200 group border border-purple-800/50"
                            >
                                <ShieldCheck className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                                <span className="font-medium text-purple-200 group-hover:text-white">Superuser</span>
                            </Link>
                        )}
                    </div>
                )}

                <div className="pt-4 mt-auto space-y-2">
                    <Link
                        href="/help"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group text-slate-400 hover:text-white"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Help & Manual</span>
                    </Link>
                    <form action={async () => {
                        'use server';
                        await signOut({ redirectTo: '/login' });
                    }}>
                        <button type="submit" className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-900/30 transition-all duration-200 group text-red-400 hover:text-red-300">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </form>
                </div>
            </nav>
            <div className="p-4 border-t border-slate-700 text-xs text-gray-500">
                v1.0.0
            </div>
        </div>
    );
};

export default Sidebar;
