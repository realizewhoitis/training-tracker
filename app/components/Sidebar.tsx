import { getSettings } from '@/app/admin/settings/actions';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Users, BookOpen, FileText, Package, PenTool, Settings, ShieldCheck } from 'lucide-react';
import { auth } from '@/auth';

// ...

const Sidebar = async () => {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;
    const settings = await getSettings();

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-700">
                {settings.logoPath ? (
                    <div className="flex flex-col items-start">
                        <Image
                            src={`/api/files/${settings.logoPath}`}
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
            <nav className="flex-1 p-4 space-y-2">
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
                <Link
                    href="/inventory"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                >
                    <Package className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="font-medium">Inventory</span>
                </Link>
                <Link
                    href="/reports"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                >
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="font-medium">Reports</span>
                </Link>
                {(userRole === 'ADMIN' || userRole === 'TRAINER') && (
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Trainer Tools
                        </p>
                        <Link
                            href="/dor/new"
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                        >
                            <PenTool className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            <span className="font-medium">Write DOR</span>
                        </Link>
                        <Link
                            href="/admin/forms"
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                        >
                            <Settings className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            <span className="font-medium">Form Builder</span>
                        </Link>
                        {userRole === 'ADMIN' && (
                            <Link
                                href="/admin/users"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                            >
                                <Users className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                                <span className="font-medium text-purple-100">Manage Users</span>
                            </Link>
                        )}
                        {userRole === 'ADMIN' && (
                            <Link
                                href="/admin/settings"
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group"
                            >
                                <Settings className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                                <span className="font-medium text-orange-100">System Settings</span>
                            </Link>
                        )}
                    </div>
                )}

                <div className="pt-4 mt-auto">
                    <Link
                        href="/help"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 group text-slate-400 hover:text-white"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Help & Manual</span>
                    </Link>
                </div>
            </nav>
            <div className="p-4 border-t border-slate-700 text-xs text-gray-500">
                v1.0.0
            </div>
        </div>
    );
};

export default Sidebar;
