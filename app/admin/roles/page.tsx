import { getTenantPrisma } from '@/lib/prisma';
import { ShieldCheck, Save, Info } from 'lucide-react';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, Permission, ALL_PERMISSIONS, PERMISSION_LABELS } from '@/lib/permissions';
import { updateRoleTemplate } from './actions';
import CreateRoleButton from './CreateRoleButton';

export default async function RoleManagerPage() {
    const roleTemplates = await (await getTenantPrisma()).roleTemplate.findMany();

    const knownRoles = ['SUPERVISOR', 'TRAINER', 'TRAINEE']; // Standard system roles (excluding ADMIN)
    const databaseRoles = roleTemplates.map(rt => rt.roleName);
    const rolesToManage = Array.from(new Set([...knownRoles, ...databaseRoles])).filter(r => r !== 'ADMIN');

    const getPermissionsForRole = (role: string): Permission[] => {
        const template = roleTemplates.find(rt => rt.roleName === role);
        if (template) {
            return JSON.parse(template.permissions) as Permission[];
        }
        return DEFAULT_ROLE_PERMISSIONS[role] || [];
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <ShieldCheck className="mr-3 text-indigo-600" />
                        Role Templates
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Define potential capabilities for different roles.
                    </p>
                </div>
                <CreateRoleButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {rolesToManage.map(role => {
                    const currentPermissions = getPermissionsForRole(role);

                    return (
                        <div key={role} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="font-bold text-lg text-gray-800">{role}</h2>
                                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {currentPermissions.length} Capabilities
                                </span>
                            </div>

                            <form action={updateRoleTemplate} className="p-6">
                                <input type="hidden" name="roleName" value={role} />

                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                                    {ALL_PERMISSIONS.map(perm => (
                                        <label key={perm} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    name="permissions"
                                                    value={perm}
                                                    defaultChecked={currentPermissions.includes(perm)}
                                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-900 block">{PERMISSION_LABELS[perm]?.label || perm}</span>
                                                <span className="text-xs text-gray-500">{PERMISSION_LABELS[perm]?.description}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save {role} Template
                                    </button>
                                </div>
                            </form>
                        </div>
                    );
                })}


                <div className="col-span-1 lg:col-span-2 bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-3">
                    <Info className="text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">About Role Templates</p>
                        <p>
                            Changes here define the <strong>default</strong> permissions for any user assigned this role.
                            You can override these defaults for specific users in the <a href="/admin/users" className="underline hover:text-blue-900">User Management</a> page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
