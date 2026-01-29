'use client';

import { Filter } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function FilterButton() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const showDeparted = searchParams.get('showDeparted') === 'true';

    const toggleFilter = () => {
        const params = new URLSearchParams(searchParams);
        if (showDeparted) {
            params.delete('showDeparted');
        } else {
            params.set('showDeparted', 'true');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <button
            onClick={toggleFilter}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showDeparted
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
        >
            <Filter className="w-4 h-4" />
            <span>{showDeparted ? 'Showing All' : 'Active Only'}</span>
        </button>
    );
}
