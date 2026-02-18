'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createRole } from './actions';

export default function CreateRoleButton() {
    const [isCreating, setIsCreating] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;

        setIsPending(true);
        try {
            await createRole(roleName.toUpperCase().replace(/\s+/g, '_'));
            setRoleName('');
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create role:', error);
            // Ideally assume toast here but basic alert for now
            alert('Failed to create role. It may already exist.');
        } finally {
            setIsPending(false);
        }
    };

    if (isCreating) {
        return (
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="ROLE_NAME"
                    className="px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    autoFocus
                    disabled={isPending}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
                <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    disabled={isPending}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                >
                    <X size={16} />
                </button>
            </form>
        );
    }

    return (
        <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors"
        >
            <Plus size={16} />
            <span>Create New Role</span>
        </button>
    );
}
