
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTenantPrisma } from '@/lib/prisma';
import PolicyListClient from './PolicyListClient';
import { revalidatePath } from 'next/cache';

export default async function PoliciesPage() {
    const policies = await (await getTenantPrisma()).policy.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            acknowledgments: true
        }
    });

    // Mock current user ID for this "low effort" implementation
    // In a real app, this would come from the session
    const currentUserId = 1;

    async function acknowledgePolicy(formData: FormData) {
        'use server';
        const policyId = parseInt(formData.get('policyId') as string);
        const userId = parseInt(formData.get('userId') as string);

        await (await getTenantPrisma()).policyAcknowledgment.create({
            data: {
                policyId: policyId,
                employeeId: userId
            }
        });

        revalidatePath('/policies');
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Policies & Memos</h1>
                    <p className="text-slate-500">Read and acknowledge department policies</p>
                </div>
            </div>

            <div className="grid gap-6">
                <PolicyListClient
                    initialPolicies={policies}
                    currentUserId={currentUserId}
                    acknowledgePolicyAction={acknowledgePolicy}
                />
            </div>
        </div>
    );
}
