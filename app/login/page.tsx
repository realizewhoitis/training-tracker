
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);
    const [is2FA, setIs2FA] = useState(false);

    // Controlled inputs to preserve values across steps
    const [formData, setFormData] = useState({ email: '', password: '', code: '' });

    useEffect(() => {
        if (errorMessage === '2FA_REQUIRED') {
            setIs2FA(true);
        }
    }, [errorMessage]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Lock size={24} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Training Tracker</h1>

                <form action={dispatch} className="space-y-4">
                    {!is2FA && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInput}
                                    placeholder="user@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInput}
                                    placeholder="******"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </>
                    )}

                    {is2FA && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700" htmlFor="twoFactorCode">
                                Identity Verification Code
                            </label>
                            <input
                                className="mt-1 block w-full text-center tracking-widest px-3 py-2 bg-white border border-slate-300 rounded-md text-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                id="twoFactorCode"
                                type="text"
                                name="twoFactorCode"
                                placeholder="000000"
                                required={is2FA}
                                autoFocus
                            />
                            {/* Hidden inputs to resubmit credentials */}
                            <input type="hidden" name="email" value={formData.email} />
                            <input type="hidden" name="password" value={formData.password} />
                            <p className="text-xs text-slate-500 mt-3 text-center">
                                We sent a 6-digit code to your email.
                            </p>
                        </div>
                    )}

                    <LoginButton is2FA={is2FA} />

                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && errorMessage !== '2FA_REQUIRED' && (
                            <p className="text-sm text-red-500">{errorMessage}</p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

function LoginButton({ is2FA }: { is2FA: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? 'Verifying...' : is2FA ? 'Verify Code' : 'Log in'}
        </button>
    );
}
