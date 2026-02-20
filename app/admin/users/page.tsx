import prisma from '@/lib/prisma';
import { User, Shield, Trash2, Key, RefreshCw, Lock, Unlock } from 'lucide-react';
import { createUser, deleteUser, resetPassword, toggleTwoFactor } from './actions';
import UserRoleSelect from './UserRoleSelect';
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';
import { auth } from '@/auth';

export default async function UserManagementPage() {
    const session = await auth();
    // @ts-ignore
    const currentUserRole = session?.user?.role;

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    });

    const roleTemplates = await prisma.roleTemplate.findMany();
    const knownRoles = Object.keys(DEFAULT_ROLE_PERMISSIONS);
    const databaseRoles = roleTemplates.map(rt => rt.roleName);
    // Combine and ensure unique. Keep ADMIN.
    let availableRoles = Array.from(new Set([...knownRoles, ...databaseRoles])).sort();

    // Non-superusers cannot create or assign the SUPERUSER role
    if (currentUserRole !== 'SUPERUSER') {
        availableRoles = availableRoles.filter(role => role !== 'SUPERUSER');
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center">
                        <User className="mr-3 text-indigo-600" />
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage system access, create Trainer accounts, and reset passwords.
                    </p>
                </div>
            </div>

            {/* Add User Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-indigo-500" />
                    Create New User
                </h3>
                <form action={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                        <input name="name" type="text" placeholder="John Doe" required className="w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input name="email" type="email" placeholder="john@example.com" required className="w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <select name="role" className="w-full rounded-md border-gray-300 text-sm" aria-label="Select user role">
                            {availableRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                        <input name="password" type="password" placeholder="******" required minLength={6} className="w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
                            Add User
                        </button>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(user.role === 'SUPERUSER' && currentUserRole !== 'SUPERUSER') ? (
                                        <span className="text-xs font-bold px-2 py-1 rounded-full border border-purple-800/50 bg-purple-100 text-purple-800 cursor-not-allowed opacity-75">
                                            {user.role}
                                        </span>
                                    ) : (
                                        <UserRoleSelect userId={user.id} currentRole={user.role} availableRoles={availableRoles} />
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <form action={async () => {
                                        'use server';
                                        await toggleTwoFactor(user.id, !user.twoFactorEnabled);
                                    }}>
                                        <button
                                            type="submit"
                                            disabled={user.role === 'SUPERUSER' && currentUserRole !== 'SUPERUSER'}
                                            className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium transition-colors ${user.twoFactorEnabled
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            title={user.twoFactorEnabled ? 'Click to Disable 2FA' : 'Click to Enable 2FA'}
                                        >
                                            {user.twoFactorEnabled ? (
                                                <><Lock size={12} className="mr-1" /> Enabled</>
                                            ) : (
                                                <><Unlock size={12} className="mr-1" /> Disabled</>
                                            )}
                                        </button>
                                    </form>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-3">
                                        {(user.role === 'SUPERVISOR' || user.role === 'TRAINER') && (
                                            <a href={`/admin/users/${user.id}/permissions`} className="text-indigo-600 hover:text-indigo-900" title="Custom Permissions">
                                                <Shield size={16} />
                                            </a>
                                        )}

                                        {/* Action Buttons (Hidden if current user is not a superuser but target is) */}
                                        {!(user.role === 'SUPERUSER' && currentUserRole !== 'SUPERUSER') && (
                                            <>
                                                <form action={resetPassword} className="flex items-center gap-2">
                                                    <input type="hidden" name="userId" value={user.id} />
                                                    <input name="newPassword" type="password" placeholder="New Pass" className="w-24 text-xs border border-gray-300 rounded px-2 py-1" required minLength={6} />
                                                    <button type="submit" className="text-amber-600 hover:text-amber-900" title="Reset Password">
                                                        <RefreshCw size={16} />
                                                    </button>
                                                </form>

                                                <form action={async () => {
                                                    'use server';
                                                    await deleteUser(user.id);
                                                }}>
                                                    <button type="submit" className="text-red-600 hover:text-red-900" title="Delete User">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
