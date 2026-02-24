'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Users, GraduationCap, PackageOpen, FileSpreadsheet, ShieldCheck } from 'lucide-react';

const CHAPTERS = [
    { name: 'Introduction', path: '/help', icon: Book },
    { name: 'Chapter 1: Getting Started', path: '/help/getting-started', icon: ShieldCheck },
    { name: 'Chapter 2: Managing Employees', path: '/help/managing-employees', icon: Users },
    { name: 'Chapter 3: Training & Certification', path: '/help/training', icon: GraduationCap },
    { name: 'Chapter 4: Inventory Logistics', path: '/help/inventory', icon: PackageOpen },
    { name: 'Chapter 5: Forms & Reporting', path: '/help/forms', icon: FileSpreadsheet },
    { name: 'Chapter 6: Administration', path: '/help/administration', icon: ShieldCheck },
];

export default function HelpSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 border-r border-slate-200 bg-slate-50 min-h-full p-4 hidden md:block shrink-0">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">User Manual</h2>
            <nav className="space-y-1">
                {CHAPTERS.map((chapter) => {
                    const isActive = pathname === chapter.path;
                    const Icon = chapter.icon;
                    return (
                        <Link
                            key={chapter.path}
                            href={chapter.path}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{chapter.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
