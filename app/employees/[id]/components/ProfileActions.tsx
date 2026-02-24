'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import ProvisionAccountModal from './ProvisionAccountModal';

interface ProfileActionsProps {
    employeeId: number;
    employeeName: string;
    availableRoles: string[];
}

export default function ProfileActions({ employeeId, employeeName, availableRoles }: ProfileActionsProps) {
    const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                title="Provision a User account for this employee"
            >
                <UserPlus size={16} className="mr-1" />
                Provision Account
            </button>

            {isProvisionModalOpen && (
                <ProvisionAccountModal
                    empId={employeeId}
                    employeeName={employeeName}
                    availableRoles={availableRoles}
                    onClose={() => setIsProvisionModalOpen(false)}
                />
            )}
        </>
    );
}
