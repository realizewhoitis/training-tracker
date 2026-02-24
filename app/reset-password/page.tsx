'use client';

import { useState } from 'react';
import { submitNewPassword } from './actions';
import { ShieldAlert, KeyRound, CheckCircle2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            setStatus('error');
            setErrorMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }

        setStatus('submitting');
        setErrorMessage('');

        const result = await submitNewPassword(password);

        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'An unexpected error occurred.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center space-y-6">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Password Updated!</h2>
                        <p className="text-sm text-gray-500">
                            Your new password has been saved securely. For security reasons, please log in again using your new credentials to access the platform.
                        </p>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Log In Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-50">
                    <ShieldAlert className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Mandatory Security Update
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    An administrator has flagged your account for a required password rotation. Please choose a new password before continuing.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-amber-500">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={status === 'submitting'}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    disabled={status === 'submitting'}
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-100">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                            >
                                {status === 'submitting' ? 'Updating...' : 'Save New Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                disabled={status === 'submitting'}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Log out instead
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
