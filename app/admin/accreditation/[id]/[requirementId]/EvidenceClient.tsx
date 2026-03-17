'use client';
import { useFormStatus } from 'react-dom';
import { Trash2, AlertCircle } from 'lucide-react';

export function DeleteEvidenceButton({ isLocked }: { isLocked: boolean }) {
    const { pending } = useFormStatus();

    if (isLocked) {
        return (
            <button
                type="button"
                disabled
                title="Locked Evidence cannot be deleted"
                className="p-1.5 text-slate-300 cursor-not-allowed"
            >
                <Trash2 size={16} />
            </button>
        );
    }

    return (
        <button
            type="submit"
            disabled={pending}
            title="Delete Evidence"
            aria-label="Delete Evidence"
            onClick={(e) => {
                if (!window.confirm("Are you sure you want to permanently delete this evidence file?")) {
                    e.preventDefault();
                }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        >
            <Trash2 size={16} />
        </button>
    );
}

export function UploadEvidenceForm({ requirementId, action }: { requirementId: number, action: (formData: FormData) => Promise<void> }) {
    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="requirementId" value={requirementId} />

            <div>
                <label htmlFor="evidenceFile" className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between">
                    Select File
                    <span className="text-xs font-normal text-slate-500">(PDF, JPG, PNG)</span>
                </label>
                <input
                    id="evidenceFile"
                    name="evidenceFile"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    required
                    className="w-full text-sm text-slate-500 border border-slate-300 rounded-md cursor-pointer bg-slate-50 focus:outline-none file:mr-4 file:py-2.5 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2 text-amber-800 text-xs mt-4">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Files uploaded here contribute to the Audit Record and are <strong>permanently locked</strong> to ensure immutability.</p>
            </div>

            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-70 flex justify-center items-center"
        >
            {pending ? 'Uploading...' : 'Securely Upload Evidence'}
        </button>
    );
}
