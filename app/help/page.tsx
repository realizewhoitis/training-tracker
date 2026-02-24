import { BookOpen } from 'lucide-react';

export default function HelpIntroPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Orbit 911 User Manual</h1>
                    <p className="text-slate-500">Comprehensive documentation for all platform features</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700">
                <p className="text-lg leading-relaxed">
                    Welcome to the <strong>Orbit 911 Training Tracker</strong> documentation hub. This manual is designed to help you navigate and utilize the features of the platform effectively, whether you are a general employee viewing your schedule, a Training Officer logging a roster, or an Administrator configuring the system setup.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8 shadow-sm">
                    <h3 className="text-blue-800 font-bold mb-2 text-lg mt-0">How to use this manual</h3>
                    <p className="text-blue-700 m-0">
                        Use the sidebar navigation on the left to jump between chapters. Each chapter is focused on a specific core module of the application, broken down by Role-Based workflows. Look for the highlighted alert boxes for administrative settings and security warnings.
                    </p>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 border-b border-slate-100 pb-2">Platform Roles & Personas</h2>
                <ul className="space-y-4">
                    <li className="flex items-start">
                        <span className="font-bold min-w-[120px] text-slate-800">Trainee:</span>
                        <span>General users who can view their own profile, schedule, and training records.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold min-w-[120px] text-slate-800">Trainer (FTO):</span>
                        <span>Users who can generate Daily Observation Reports (DORs) and manage bulk training rosters.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold min-w-[120px] text-slate-800">Supervisor:</span>
                        <span>Mid-level management who can view team reports, assign shifts, and manage the general workforce.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold min-w-[120px] text-slate-800">Admin:</span>
                        <span>High-level administrators who can provision user accounts, manage the inventory catalog, and delete system records.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold min-w-[120px] text-slate-800">Superuser:</span>
                        <span>Root-level platform managers who configure database connections, licensing, branding, and automated email templates.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
