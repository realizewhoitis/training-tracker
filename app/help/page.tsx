import {
    BookOpen,
    LayoutDashboard,
    Users,
    FileText,
    Box,
    ShieldAlert,
    Settings
} from 'lucide-react';
import Image from 'next/image';

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
            <header className="border-b border-gray-200 pb-8">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Orbit 911 User Manual</h1>
                <p className="text-xl text-gray-600">
                    Complete guide to the Orbit 911 Training System.
                </p>
            </header>

            {/* 1. Dashboard */}
            <section id="dashboard" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <LayoutDashboard className="mr-3 text-indigo-600" /> Dashboard Overview
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    The main dashboard provides a high-level view of agency performance. It differentiates between
                    <strong> Admin</strong> and <strong> Trainee</strong> views.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                    <Image
                        src="/help-images/main_dashboard.png"
                        alt="Main Dashboard View"
                        width={1200}
                        height={675}
                        className="w-full h-auto"
                    />
                    <div className="p-4 text-sm text-gray-500 italic bg-gray-100 border-t border-gray-200">
                        Figure 1: The main dashboard showing pending reports, analytics, and quick status.
                    </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Pending DORs:</strong> Trainees see reports waiting for their signature here.</li>
                    <li><strong>Analytics:</strong> Graphs showing daily performance trends and category breakdowns.</li>
                    <li><strong>Expirations:</strong> Alerts for certifications expiring within 30 days.</li>
                </ul>
            </section>

            {/* 2. Employee Management */}
            <section id="employees" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <Users className="mr-3 text-blue-600" /> Employee Profiles
                </h2>
                <p className="text-gray-600 mb-4">
                    The Employee Detail view is the central hub for an employee's data. It aggregates training hours,
                    inventory assignments (`Radio 123`, `Headset 45`), and DOR performance trends.
                </p>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Key Features:</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li>• <strong>Training Log:</strong> Complete history of attended training.</li>
                        <li>• <strong>Certificates:</strong> Upload and view scanned documents.</li>
                        <li>• <strong>Assets:</strong> See currently assigned equipment.</li>
                        <li>• <strong>EIS Flags:</strong> (Admin Only) Active risk alerts.</li>
                    </ul>
                </div>
            </section>

            {/* 3. Daily Observation Reports (DORs) */}
            <section id="dors" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <FileText className="mr-3 text-green-600" /> Daily Observation Reports (DOR)
                </h2>
                <p className="text-gray-600 mb-6">
                    Trainers use this system to grade trainees. Reports follow a standardized
                    1-7 scale across multiple categories (Safety, Knowledge, Performance).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">For Trainers</h3>
                        <p className="text-sm text-gray-600">
                            Create new reports from the top navigation. Standardized templates ensure consistency.
                            You can save drafts or submit for review.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">For Trainees</h3>
                        <p className="text-sm text-gray-600">
                            Log in to review submitted reports. You must digitally sign each report to acknowledge it.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. Inventory Management */}
            <section id="inventory" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <Box className="mr-3 text-amber-600" /> Inventory & Asset Tracking
                </h2>
                <p className="text-gray-600 mb-6">
                    Manage high-value assets like Radios, Vehicles, and Firearms. Track who has what item and its current condition.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                    <Image
                        src="/help-images/inventory_dashboard.png"
                        alt="Inventory Dashboard"
                        width={1200}
                        height={675}
                        className="w-full h-auto"
                    />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                    <Image
                        src="/help-images/asset_history.png"
                        alt="Asset History Log"
                        width={1200}
                        height={675}
                        className="w-full h-auto"
                    />
                    <div className="p-4 text-sm text-gray-500 italic bg-gray-100 border-t border-gray-200">
                        Figure 2: Viewing the complete chain of custody for an asset.
                    </div>
                </div>
            </section>

            {/* 5. EIS */}
            <section id="eis" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <ShieldAlert className="mr-3 text-red-600" /> Early Intervention System (EIS)
                </h2>
                <p className="text-gray-600 mb-4">
                    <strong>(Admin Only)</strong> The EIS automatically scans data for potential risks.
                </p>
                <div className="space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="bg-white p-2 rounded-full shadow-sm text-red-600 font-bold">1</div>
                        <div>
                            <h4 className="font-semibold text-red-900">Performance Flags</h4>
                            <p className="text-sm text-red-800">Triggered if a trainee&apos;s average DOR score drops below 2.5 over the last 7 days.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="bg-white p-2 rounded-full shadow-sm text-amber-600 font-bold">2</div>
                        <div>
                            <h4 className="font-semibold text-amber-900">Asset Flags</h4>
                            <p className="text-sm text-amber-800">Triggered if an assigned asset is marked as POOR or DAMAGED.</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-sm text-gray-500">
                        Visit <code>Admin &gt; EIS System</code> to review, resolve, or dismiss these flags.
                    </p>
                </div>
            </section>

        </div>
    );
}
