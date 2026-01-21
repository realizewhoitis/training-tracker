import Link from 'next/link';
import { Home, Users, BookOpen, FileText, Package, PenTool, Settings } from 'lucide-react';

import { auth } from '@/auth';

const Sidebar = async () => {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    911 Training
                </h1>
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
                {(userRole === 'ADMIN' || userRole === 'FTO') && (
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            FTO Tools
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
                    </div>
                )}
            </nav>
            <div className="p-4 border-t border-slate-700 text-xs text-gray-500">
                v1.0.0
            </div>
        </div>
    );
};

export default Sidebar;
