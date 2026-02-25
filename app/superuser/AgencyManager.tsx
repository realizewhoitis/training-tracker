'use client';

import { Building2, LogIn } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button disabled={pending} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {pending ? 'Saving...' : 'Create Agency'}
        </button>
    );
}

export default function AgencyManager({ agencies, activeOverride, createAgency, setOverride }: {
    agencies: any[],
    activeOverride: string | null,
    createAgency: (formData: FormData) => Promise<void>,
    setOverride: (id: string | null) => Promise<void>
}) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center justify-between">
                <span className="flex items-center"><Building2 className="mr-2 text-blue-500" /> Multi-Tenant Agency Management</span>
                {activeOverride && (
                    <button onClick={() => setOverride(null)} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors">
                        Clear Context Override
                    </button>
                )}
            </h2>

            <form action={createAgency} className="flex gap-2 mb-6">
                <input
                    name="name"
                    placeholder="New Agency Name (e.g. Austin PD)"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    required
                />
                <select name="timezone" className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700" required>
                    <option value="America/Chicago">Central Time (CST)</option>
                    <option value="America/New_York">Eastern Time (EST)</option>
                    <option value="America/Denver">Mountain Time (MST)</option>
                    <option value="America/Los_Angeles">Pacific Time (PST)</option>
                </select>
                <SubmitButton />
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Agency ID</th>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Timezone</th>
                            <th className="px-3 py-2 text-right">Support Console</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y relative">
                        {agencies.map(a => {
                            const isActive = activeOverride === a.id;
                            return (
                                <tr key={a.id} className={`transition-colors ${isActive ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : 'hover:bg-slate-50'}`}>
                                    <td className="px-3 py-3 font-mono text-xs text-slate-400">{a.id.substring(0, 8)}...</td>
                                    <td className="px-3 py-3 font-medium flex items-center gap-2 text-slate-800">
                                        {a.name}
                                        {isActive && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600 font-mono text-xs">{a.timezone}</td>
                                    <td className="px-3 py-3 text-right">
                                        {!isActive && (
                                            <button
                                                onClick={() => setOverride(a.id)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-end w-full"
                                            >
                                                <LogIn size={14} className="mr-1" /> Enter Container
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
