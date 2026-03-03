'use client';

import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function DeleteRequirementButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Requirement"
            onClick={(e) => {
                if (!window.confirm('Are you strictly sure you want to delete this clause and any associated compliance mapped policies?')) {
                    e.preventDefault();
                }
            }}
        >
            <Trash2 size={18} />
        </button>
    );
}
