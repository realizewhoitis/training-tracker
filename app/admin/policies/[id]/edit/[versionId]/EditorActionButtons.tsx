'use client';

import { Save, Tag } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { saveDraftAction, publishDraftAction } from './actions';

export function EditorActionButtons({ versionNumber, versionId, containerId }: { versionNumber: string, versionId: number, containerId: number }) {
    const { pending } = useFormStatus();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200 mt-8">
            <a
                href={`/admin/policies/${containerId}/edit/${versionId}/mapping`}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors flex items-center justify-center border border-indigo-200"
            >
                <Tag size={18} className="mr-2" /> Mapping Workbench
            </a>
            <button
                formAction={saveDraftAction}
                disabled={pending}
                className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
            >
                <Save size={18} className="mr-2" /> Save Draft
            </button>
            <button
                formAction={publishDraftAction}
                disabled={pending}
                onClick={(e) => {
                    if (!window.confirm('Publishing this version will immediately archive the currently active version. Users will be required to sign this new version according to the Enforcement Level. Proceed?')) {
                        e.preventDefault();
                    }
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
                Publish Version {versionNumber}
            </button>
        </div>
    );
}
