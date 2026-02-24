import { Users, ClipboardList, ShieldAlert, KeyRound } from 'lucide-react';

export default function Chapter2Page() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Users size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chapter 2: Managing Employees</h1>
                    <p className="text-slate-500">Navigating the directory, utilizing Bulk Actions, and provisioning administrative accounts.</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                {/* Section 1 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <ClipboardList className="w-5 h-5 mr-2 text-slate-400" />
                        The Employee Directory
                    </h2>
                    <p className="mt-4">
                        The primary <strong>Employees</strong> tab serves as the centralized roster for your entire agency. This table is highly interactive:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                        <li><strong>Sorting:</strong> Click on any column header (Name, ID, Role, Shift) to alphabetize or sequence the directory. Click again to reverse the order.</li>
                        <li><strong>Live Search:</strong> Utilize the search bar at the top to instantly filter employees by partial name or ID match.</li>
                        <li><strong>Exporting:</strong> Administrators can click the <strong>Export CSV</strong> button located in the toolbar to automatically generate a spreadsheet dump of the currently visible roster.</li>
                    </ul>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The full Employee Directory highlighting the Export CSV button]</span>
                    </div>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <ShieldAlert className="w-5 h-5 mr-2 text-slate-400" />
                        The Bulk Actions Toolbar
                    </h2>
                    <p className="mt-4">
                        Supervisors and Administrators are granted access to the dynamic <strong>Bulk Actions</strong> pipeline. By utilizing the checkboxes running down the left side of the directory table, you can select multiple employees simultaneously.
                    </p>
                    <p className="mt-4">
                        Once at least one employee is selected, the Bulk Actions toolbar will gracefully slide down over the table headers, allowing you to execute mass updates across the entire selected team in a single click:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-2">Assign Shift</h4>
                            <p className="text-sm">Quickly rotate teams by reassigning selected users to a new active shift (e.g., placing 5 users onto 'C Shift').</p>
                        </div>
                        <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-2">Change Role</h4>
                            <p className="text-sm">Batch promote employees by changing their internal system roles simultaneously.</p>
                        </div>
                        <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-2">Set Status</h4>
                            <p className="text-sm">Terminate or deactivate accounts collectively by flipping their status to 'Departed'.</p>
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <KeyRound className="w-5 h-5 mr-2 text-slate-400" />
                        Profiles vs. Provisions
                    </h2>
                    <p className="mt-4">
                        In Orbit 911, an <strong>Employee Profile</strong> is distinct from a <strong>User Login</strong>.
                        Every person in the system has an Employee Profile (used for tracking their training history, daily observation reports, and issued hardware). However, not every employee necessarily needs digital access to the software.
                    </p>

                    <div className="bg-indigo-50 border border-indigo-200 p-4 my-6 text-indigo-800 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-2">How to Provision a User Account</h3>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                            <li>Navigate to an employee's Profile page.</li>
                            <li>If they do not currently possess a digital login, the <strong>"Provision Account"</strong> button will be visible in the top right header.</li>
                            <li>Click the button, configure their initial role and email address, and define whether to automatically send them a welcome email.</li>
                            <li>Upon creation, the system will silently generate a high-entropy temporary password, which the user will be forced to change on their very first login.</li>
                        </ol>
                    </div>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The Provision Account Modal Dialog]</span>
                    </div>

                </section>

            </div>
        </div>
    );
}
