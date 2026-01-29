'use client';

import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [term, setTerm] = useState(searchParams.get('query')?.toString() || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (term) {
                params.set('query', term);
            } else {
                params.delete('query');
            }

            // Only update if changes prevent loops
            if (params.toString() !== searchParams.toString()) {
                replace(`${pathname}?${params.toString()}`);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [term, replace, pathname, searchParams]);

    return (
        <div className="relative flex-1 md:flex-initial">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                placeholder={placeholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
        </div>
    );
}
