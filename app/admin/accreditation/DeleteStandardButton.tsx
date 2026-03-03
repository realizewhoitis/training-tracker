'use client';

import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function DeleteStandardButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Standard Framework"
            onClick={(e) => {
                if (!window.confirm('Are you deeply sure you want to delete this specific Accreditation Framework and ALL its underlying requirements and mappings unconditionally?')) {
                    e.preventDefault();
                }
            }}
        >
            <Trash2 size={18} />
        </button>
    );
}
