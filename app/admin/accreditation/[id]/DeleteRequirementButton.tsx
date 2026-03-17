'use client';
import { useFormStatus } from 'react-dom';
import { Trash2 } from 'lucide-react';

export function DeleteRequirementButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            title="Delete Requirement"
            aria-label="Delete Requirement"
            onClick={(e) => {
                if (!window.confirm("Are you sure you want to delete this clause? Any policies mapped to it will lose their association.")) {
                    e.preventDefault();
                }
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
        >
            <Trash2 size={16} />
        </button>
    );
}
