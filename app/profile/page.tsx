import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import MFA_Setup from './MFA_Setup';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) redirect('/login');

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500">Manage your account settings and security</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        Security Settings
                    </h2>
                </div>

                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Two-Factor Authentication (2FA)</h3>
                            <p className="text-sm text-slate-500 max-w-lg mb-4">
                                Add an extra layer of security to your account. You will need to enter a code from your authenticator app each time you log in.
                            </p>

                            {user.twoFactorEnabled ? (
                                <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-lg inline-block">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">2FA is currently ENABLED</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">2FA is NOT enabled</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <MFA_Setup isEnabled={user.twoFactorEnabled} />
                    </div>
                </div>
            </div>
        </div>
    );
}
