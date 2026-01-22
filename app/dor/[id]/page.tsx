import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getDOR, signDOR } from '@/app/actions/dor-submission';
import ExportDORButton from '@/app/components/ExportDORButton';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle, Clock, Edit } from 'lucide-react';
import { getSettings } from '@/app/admin/settings/actions';

export default async function DORViewPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const dorId = parseInt(params.id);
    if (isNaN(dorId)) notFound();

    const dor: any = await getDOR(dorId);
    if (!dor) notFound();

    const isAdmin = session.user.role === 'ADMIN';
    const isTrainee = session.user.role === 'TRAINEE';
    const canSign = isTrainee && dor.traineeId === session.user.empId && !dor.traineeSignatureAt;

    const responseData = JSON.parse(dor.responseData);
    const settings = await getSettings();

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Daily Observation Report</h1>
                    <p className="text-slate-500">
                        {new Date(dor.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-medium text-slate-400 mt-1">
                        Trainee: {dor.trainee.empName} • Trainer: {dor.trainer.name}
                    </p>
                    <div className="mt-4 flex gap-2">
                        <ExportDORButton
                            dor={dor}
                            traineeName={dor.trainee.empName || 'Trainee'}
                            trainerName={dor.trainer.name}
                            brandingSettings={settings}
                        />
                        {isAdmin && (
                            <a
                                href={`/dor/${dor.id}/edit`}
                                className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors shadow-sm text-sm font-medium"
                            >
                                <Edit size={16} />
                                <span>Edit Report</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${dor.status === 'REVIEWED' ? 'bg-green-100 text-green-800' :
                        dor.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                        {dor.status}
                    </span>
                    {dor.traineeSignatureAt && (
                        <p className="text-xs text-green-600 mt-1 flex items-center justify-end">
                            <CheckCircle size={12} className="mr-1" />
                            Signed {new Date(dor.traineeSignatureAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                {dor.template.sections.map((section: any) => (
                    <div key={section.id} className="p-6 border-b border-slate-100 last:border-0">
                        <h3 className="font-bold text-lg text-slate-800 mb-4">{section.title}</h3>
                        <div className="space-y-4">
                            {section.fields.map((field: any) => {
                                const val = responseData[field.id.toString()];
                                return (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1">
                                            <p className="text-sm font-medium text-slate-600">{field.label}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            {field.type === 'RATING' ? (
                                                <span className={`inline-block px-3 py-1 rounded-md font-bold text-sm ${val === 'N.O.' ? 'bg-slate-100 text-slate-500' :
                                                    parseInt(val) >= 4 ? 'bg-green-50 text-green-700 border border-green-200' :
                                                        'bg-red-50 text-red-700 border border-red-200'
                                                    }`}>
                                                    {val}
                                                </span>
                                            ) : (
                                                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                                                    {val || <span className="text-slate-400 italic">No comments</span>}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {canSign && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-blue-900">Trainee Acknowledgement</h4>
                        <p className="text-sm text-blue-700">By signing, you acknowledge that you have reviewed this report with your Trainer.</p>
                    </div>
                    <form action={async () => {
                        'use server';
                        await signDOR(dor.id);
                    }}>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm flex items-center"
                        >
                            <Clock size={18} className="mr-2" />
                            Sign & Acknowledge
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
