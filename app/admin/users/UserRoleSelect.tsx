'use client';

import { updateUserRole } from './actions';
import { useTransition } from 'react';

interface UserRoleSelectProps {
    userId: number;
    currentRole: string;
    availableRoles: string[];
}

export default function UserRoleSelect({ userId, currentRole, availableRoles }: UserRoleSelectProps) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        startTransition(async () => {
            await updateUserRole(userId, newRole);
        });
    };

    return (
        <select
            value={currentRole}
            onChange={handleChange}
            disabled={isPending}
            className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${currentRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                currentRole === 'FTO' ? 'bg-blue-100 text-blue-800' :
                    currentRole === 'TRAINER' ? 'bg-teal-100 text-teal-800' :
                        currentRole === 'SUPERVISOR' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                }`}
        >
            {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
            ))}
        </select>
    );
}
