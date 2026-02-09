import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Shield, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, Permission } from '@/lib/permissions';
import { updateUserPermissions } from './actions';

export default async function UserPermissionsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const userId = parseInt(params.id);
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) notFound();

    // Fetch Role Template to know what the defaults are
    const roleTemplate = await prisma.roleTemplate.findUnique({
        where: { roleName: user.role }
    });

    let rolePermissions: Permission[] = [];
    if (roleTemplate) {
        rolePermissions = JSON.parse(roleTemplate.permissions);
    } else {
        rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    }

    const customPermissions = user.customPermissions ? JSON.parse(user.customPermissions) as Permission[] : null;
    const isUsingDefaults = customPermissions === null;

    // If using defaults, active is rolePermissions. If custom, active is customPermissions.
    const effectivePermissions = isUsingDefaults ? rolePermissions : customPermissions;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-6">
                <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                        <Shield className="mr-3 text-indigo-600" />
                        Permissions: {user.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Role: <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{user.role}</span>
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Capability Configuration</h2>
                </div>

                <form action={updateUserPermissions} className="p-6 space-y-8">
                    <input type="hidden" name="userId" value={user.id} />

                    <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="useDefaults"
                                    defaultChecked={isUsingDefaults}
                                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                // Triggering a submit/toggle here requires JS, ensuring form submission handles logic
                                />
                                <span className="font-medium text-blue-900">Inherit Defaults from {user.role} Role</span>
                            </label>
                            <p className="text-sm text-blue-700 mt-1 pl-8">
                                If checked, this user will automatically receive any updates made to the {user.role} role template. Uncheck to customize specific capabilities.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ALL_PERMISSIONS.map(perm => {
                            const isInherited = rolePermissions.includes(perm);
                            const isChecked = effectivePermissions.includes(perm);

                            return (
                                <label key={perm} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${isChecked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="permissions"
                                        value={perm}
                                        defaultChecked={isChecked}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700 font-mono">{perm}</span>
                                    {isUsingDefaults && isInherited && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-auto">Role Default</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save Permissions
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
