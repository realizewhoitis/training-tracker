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
                    <li><strong>Expirations:</strong> Alerts for certifications expiring within 30 days.</li>
                </ul>
            </section>

            <section id="analytics" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <LayoutDashboard className="mr-3 text-purple-600" /> Performance Analytics
                </h2>
                <p className="text-gray-600 mb-6">
                    Visual insights into agency training progress and DOR scores.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                    <Image
                        src="/help-images/dashboard_analytics.png"
                        alt="Analytics Dashboard"
                        width={1200}
                        height={675}
                        className="w-full h-auto"
                    />
                    <div className="p-4 text-sm text-gray-500 italic bg-gray-100 border-t border-gray-200">
                        Figure 2: Radar charts and trend lines help identify areas for improvement.
                    </div>
                </div>
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

                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2">1</div>
                        How to Add a New Employee
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-2">
                        <li>Navigate to the <strong>Employees</strong> page via the sidebar.</li>
                        <li>Click the <strong>"Add Employee"</strong> button in the top right corner.</li>
                        <li>Enter the employee's <strong>Full Name</strong> (e.g., "Jane Doe").</li>
                        <li>Click <strong>"Create Employee"</strong>. They will immediately appear in the roster.</li>
                    </ol>
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
                        <p className="text-sm text-gray-600 mb-3">
                            Create new reports from the top navigation. Standardized templates ensure consistency.
                        </p>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Creating a DOR:</h4>
                        <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                            <li><strong>Select Trainee:</strong> Choose the employee you are evaluating.</li>
                            <li><strong>Select Trainer:</strong> Identify who is performing the evaluation (defaults to you).</li>
                            <li><strong>Rate Performance:</strong> Score all categories (1-7 scale). Use 'N.O.' for Not Observed.</li>
                            <li><strong>Narrative:</strong> Complete the "Most/Least Satisfactory" and "Incident" text areas.</li>
                            <li><strong>Submit:</strong> Click to save. The trainee will be notified to sign.</li>
                        </ul>
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

            {/* 6. Security & Licensing */}
            <section id="security" className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
                    <Settings className="mr-3 text-slate-600" /> Security & Settings (Admin)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Audit Logs</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            For CJIS compliance, critical system actions are logged in the <strong>Audit Log</strong> viewer (`Admin &gt; Audit Logs`).
                        </p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                            <li>Logins/Logouts</li>
                            <li>Creating/Deleting Users</li>
                            <li>Updating Settings</li>
                            <li>Critical Data Changes</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Licensing</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Orbit 911 requires a valid license key. Manage your license in `Admin &gt; Settings`.
                        </p>
                        <div className="p-3 bg-slate-100 rounded-md text-xs text-slate-600">
                            <strong>Note:</strong> If your license expires, the system will lock out all non-admin users until a new key is provided.
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs mr-2">2</div>
                        How to Create a System User (Trainer/Admin)
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-2">
                        <li>Go to <strong>Admin &gt; Users</strong> in the sidebar.</li>
                        <li>Locate the <strong>"Create New User"</strong> form at the top.</li>
                        <li>Fill in the <strong>Name</strong>, <strong>Email</strong>, and temporary <strong>Password</strong>.</li>
                        <li>Select the appropriate <strong>Role</strong> (e.g., 'Trainer' for FTOs).</li>
                        <li>Click <strong>"Add User"</strong>.</li>
                    </ol>
                    <p className="mt-3 text-xs text-gray-500 italic">
                        Note: This creates a login account. To track their training, ensure they also have an Employee Profile.
                    </p>
                </div>
            </section>

        </div>
    );
}
