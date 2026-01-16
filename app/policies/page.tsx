
import prisma from '@/lib/prisma';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function PoliciesPage() {
    const policies = await prisma.policy.findMany({
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

        await prisma.policyAcknowledgment.create({
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
                {policies.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No policies found.</p>
                    </div>
                ) : policies.map((policy) => {
                    const isAcknowledged = policy.acknowledgments.some(ack => ack.employeeId === currentUserId);

                    return (
                        <div key={policy.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${isAcknowledged ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">{policy.title}</h3>
                                        <p className="text-sm text-slate-500">Version {policy.version} • Posted {policy.createdAt.toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    {isAcknowledged ? (
                                        <span className="flex items-center text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                                            <CheckCircle size={16} className="mr-1" />
                                            Acknowledged
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-amber-600 text-sm font-medium px-3 py-1 bg-amber-50 rounded-full">
                                            <AlertCircle size={16} className="mr-1" />
                                            Action Required
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg mb-4 text-slate-700 text-sm leading-relaxed border border-slate-100">
                                {policy.content}
                            </div>

                            {!isAcknowledged && (
                                <div className="flex justify-end">
                                    <form action={acknowledgePolicy}>
                                        <input type="hidden" name="policyId" value={policy.id} />
                                        <input type="hidden" name="userId" value={currentUserId} />
                                        <button
                                            type="submit"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                                        >
                                            <CheckCircle size={16} className="mr-2" />
                                            I have read and understand this policy
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
