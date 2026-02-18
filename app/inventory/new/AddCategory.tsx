'use client';

import { Plus } from 'lucide-react';
import { createCategory } from '../actions';
import { useState } from 'react';

export default function AddCategory() {
    const [isCreating, setIsCreating] = useState(false);

    const handleAdd = async () => {
        const name = prompt("Enter new category name:");
        if (name) {
            setIsCreating(true);
            await createCategory(name);
            setIsCreating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleAdd}
            disabled={isCreating}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:bg-blue-50 rounded z-10"
            title="Add New Category"
        >
            <Plus size={18} />
        </button>
    );
}
