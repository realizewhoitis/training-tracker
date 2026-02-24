import { ShieldCheck, Database, Key, Settings, Users, Mail } from 'lucide-react';

export default function Chapter6Page() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chapter 6: Administration & Setup</h1>
                    <p className="text-slate-500">Managing roles, agency branding, databases, and Superuser SaaS settings.</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-12 text-slate-700">

                {/* Section 1 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <Users className="w-5 h-5 mr-2 text-slate-400" />
                        Role Management
                    </h2>
                    <p className="mt-4">
                        Orbit 911 handles permissions dynamically rather than through hard-coded tiers. Administrators can visit the <strong>Manage Roles</strong> page to construct and modify completely custom capability templates for their agency personnel (e.g., 'Dispatch Supervisor' vs. 'Field Sergeant').
                    </p>

                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                        <li><strong>Creating a Template:</strong> Click the <strong>Create Role</strong> upper-right button to form an entirely new archetype. Select the precise boolean toggles that apply to their clearance (such as <code>MANAGE_USERS</code> or <code>VIEW_REPORTS</code>).</li>
                        <li><strong>Modifying Existing Templates:</strong> Adjusting the global permissions of a previously saved Role will retroactively strip or grant those capabilities to every existing user holding that role assignment.</li>
                        <li><strong>Custom Overrides:</strong> If a specific employee requires anomalous permissions (e.g., an FTO requiring temporary <code>MANAGE_FORMS</code> access), navigate directly to that employee's user profile on the <strong>Users</strong> page and click 'Edit Capabilities' to apply a JSON override string.</li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <Settings className="w-5 h-5 mr-2 text-slate-400" />
                        Agency Branding
                    </h2>
                    <p className="mt-4">
                        To personalize the platform to your organization, Administrators may navigate to the <strong>Settings</strong> portal. Here you can dictate the exact text string displayed internally as the Agency Name, and upload an external publicly hosted <code>.png</code> or <code>.svg</code> URL to brand the sidebar logo matrix.
                    </p>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <Key className="w-5 h-5 mr-2 text-slate-400" />
                        The Root Superuser Dashboard
                    </h2>
                    <p className="mt-4">
                        The <strong>Superuser Dashboard</strong> (`/superuser`) is a severely restricted development routing hub specifically designed to administer the foundational aspects of the platform infrastructure. Users require the absolute highest level of clearance (<code>MANAGE_SAAS</code>) to access it.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="border border-slate-200 p-6 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                                <Key className="w-4 h-4 mr-2 text-slate-500" /> License Generation
                            </h4>
                            <p className="text-sm">
                                As Orbit 911 requires an active verification license to legally operate commercially, this section allows root managers to rapidly conjure cryptographically secure, payload-driven License Keys determining platform module toggles (like toggling off Inventory) and absolute seat-limits.
                            </p>
                        </div>
                        <div className="border border-slate-200 p-6 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                                <Database className="w-4 h-4 mr-2 text-slate-500" /> Database Maintenance
                            </h4>
                            <p className="text-sm">
                                If an external dataset was roughly imported to the core Prisma matrix resulting in mismatched PostgreSQL auto-increment Primary Key collisions, executing the <strong>Sync Auto-Increment Sequences</strong> button will fire an atomic re-alignment against the core schema.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 4 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <Mail className="w-5 h-5 mr-2 text-slate-400" />
                        Automated Email Templates
                    </h2>
                    <p className="mt-4">
                        To streamline the workflow of provisioning hundreds of new employee acccounts, Superusers can draft explicit <strong>Automated Email Templates</strong> from inside the `/superuser` dashboard.
                    </p>
                    <p className="mt-4">
                        These HTML or plaintext templates utilize the <code>resend</code> network stack. You can actively compose dynamic variables into your greeting body (e.g., encapsulating <code>{`{{name}}`}</code> or <code>{`{{password}}`}</code>). When a new employee account is provisioned dynamically via the Employee Roster, the background handler intercepts these variable codes and directly substitutes the newly generated temporary password to them via automated email dispatch.
                    </p>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-800 rounded-r-lg shadow-sm">
                        <strong>Architectural Warning:</strong> Orbit 911 relies directly upon <code>resend</code> to authenticate network dispatches. Testing with free developer tokens restricts delivery exclusively to the email address registered inside the <code>resend.dev</code> dashboard. Production delivery demands you actively possess, verify, and tether an authorized custom URL domain.
                    </div>
                </section>

            </div>
        </div>
    );
}
