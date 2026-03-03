import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FilePenLine, ArrowLeft, Clock, ShieldAlert, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';
import { EditorActionButtons } from './EditorActionButtons';

export default async function VersionEditorPage({ params }: { params: Promise<{ id: string, versionId: string }> }) {
    const p = await params;
    const containerId = parseInt(p.id);
    const versionId = parseInt(p.versionId);

    if (isNaN(containerId) || isNaN(versionId)) return notFound();

    const version = await (await getTenantPrisma()).policyVersion.findUnique({
        where: { id: versionId },
        include: { container: true }
    });

    if (!version || version.containerId !== containerId) return notFound();

    const isDraft = version.status === 'DRAFT';

    const roleTemplates = await (await getTenantPrisma()).roleTemplate.findMany();
    const knownRoles = Object.keys(DEFAULT_ROLE_PERMISSIONS);
    const databaseRoles = roleTemplates.map(rt => rt.roleName);
    const availableRoles = Array.from(new Set([...knownRoles, ...databaseRoles])).sort();

    let parsedTargetRoles: string[] = [];
    try {
        if (version.targetRoles) {
            parsedTargetRoles = JSON.parse(version.targetRoles);
        }
    } catch { }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href={`/admin/policies/${containerId}`} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <FilePenLine className="mr-3 text-indigo-600 truncate" />
                    <span className="truncate">{isDraft ? 'Edit Draft' : 'View Scope'} - v{version.versionNumber}</span>
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 flex-shrink-0 ${isDraft ? 'bg-amber-100 text-amber-800' :
                    version.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                    {version.status}
                </span>
            </div>

            <form className="space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                <input type="hidden" name="versionId" value={version.id} />
                <input type="hidden" name="containerId" value={containerId} />

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Document Title</label>
                        <input name="title" type="text" defaultValue={version.title} disabled={!isDraft} required className="w-full rounded-lg border-slate-300 disabled:bg-slate-50 disabled:text-slate-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Document Content (HTML/Rich-Text)</label>
                        <textarea name="content" defaultValue={version.content} disabled={!isDraft} rows={12} className="w-full rounded-lg border-slate-300 font-mono text-sm disabled:bg-slate-50 disabled:text-slate-500"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                            <h3 className="font-semibold text-slate-800 flex items-center mb-2">
                                <ShieldAlert className="w-4 h-4 mr-2 text-indigo-600" />
                                Enforcement Settings
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center">
                                    Enforcement Level
                                </label>
                                <select name="enforcementLevel" defaultValue={version.enforcementLevel} disabled={!isDraft} className="w-full rounded-md border-slate-300 text-sm disabled:bg-slate-100 disabled:text-slate-500">
                                    <option value="1">Level 1 - Informational Only</option>
                                    <option value="2">Level 2 - Requires Signature (Passive)</option>
                                    <option value="3">Level 3 - Mandatory Gate (Blocks Application)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center">
                                    <Clock size={14} className="mr-1" /> Reading Timer (Seconds)
                                </label>
                                <input name="readingTimer" type="number" min="0" defaultValue={version.readingTimer} disabled={!isDraft} className="w-full rounded-md border-slate-300 text-sm disabled:bg-slate-100 disabled:text-slate-500" />
                                <p className="text-xs text-slate-400 mt-1">Time users must wait before signing.</p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-slate-800 flex items-center mb-2">
                                <CheckCircle className="w-4 h-4 mr-2 text-indigo-600" />
                                Target Roles
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">Leave all unchecked to target EVERYONE in the agency.</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {availableRoles.map(role => (
                                    <label key={role} className="flex items-center space-x-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            name="targetRoles"
                                            value={role}
                                            defaultChecked={parsedTargetRoles.includes(role)}
                                            disabled={!isDraft}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                        />
                                        <span>{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {isDraft && <EditorActionButtons versionNumber={version.versionNumber} versionId={version.id} containerId={containerId} />}
            </form>
        </div>
    );
}
