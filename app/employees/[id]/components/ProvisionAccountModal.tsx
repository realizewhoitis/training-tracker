'use client';

import { useState } from 'react';
import { UserPlus, Mail, ShieldAlert, KeyRound, Check, X } from 'lucide-react';
import { provisionEmployeeAccount } from '../../../../app/admin/users/actions';

interface ProvisionAccountModalProps {
    empId: number;
    employeeName: string;
    availableRoles: string[];
    onClose: () => void;
}

export default function ProvisionAccountModal({ empId, employeeName, availableRoles, onClose }: ProvisionAccountModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('TRAINEE');
    const [sendEmail, setSendEmail] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await provisionEmployeeAccount(empId, employeeName, email, role, sendEmail);
            if (res.success) {
                onClose(); // Parent component will handle revalidation implicitly due to the server action
            } else {
                setError(res.error || 'Failed to provision account.');
                setIsSubmitting(false);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                    <h2 className="text-xl font-bold flex items-center text-slate-800">
                        <UserPlus size={20} className="mr-2 text-indigo-600" />
                        Provision User Account
                    </h2>
                    <button
                        title="Close"
                        aria-label="Close"
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <p className="text-sm text-slate-600 mb-4 bg-blue-50 text-blue-800 p-3 rounded-md border border-blue-100 flex items-start">
                        <KeyRound size={16} className="text-blue-600 mr-2 mt-0.5 shrink-0" />
                        <span>
                            This will generate a <strong>secure, random temporary password</strong> for {employeeName}. They will be forced to change it immediately upon their first successful login.
                        </span>
                    </p>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Account Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                                placeholder={`e.g., example@domain.com`}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">Initial System Role</label>
                        <select
                            id="role"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border text-slate-800"
                        >
                            {availableRoles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex items-start bg-slate-50 p-3 rounded-md border border-slate-200">
                        <div className="flex items-center h-5">
                            <input
                                id="sendWelcomeEmail"
                                type="checkbox"
                                checked={sendEmail}
                                onChange={(e) => setSendEmail(e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="sendWelcomeEmail" className="font-medium text-slate-700">Send "Welcome to Orbit" Email</label>
                            <p className="text-slate-500">Automatically dispatches the system 'Account Creation' email template containing their dashboard link and temporary private password.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md font-medium">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 items-center transition-colors"
                        >
                            {isSubmitting ? (
                                'Provisioning...'
                            ) : (
                                <>
                                    <Check size={16} className="mr-2" />
                                    Provision Account
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
