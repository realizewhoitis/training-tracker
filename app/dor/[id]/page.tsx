import { auth } from '@/auth';
import { getDOR, signDOR, disputeDOR, approveDOR, remindTrainee } from '@/app/actions/dor-submission';
import ExportDORButton from '@/app/components/ExportDORButton';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle, Clock, Edit, AlertTriangle, ShieldCheck, Bell } from 'lucide-react';
import { getSettings } from '@/app/admin/settings/actions';
import Link from 'next/link';
import { PERMISSIONS } from '@/lib/permissions';

const STATUS_STYLES: Record<string, string> = {
    DRAFT:     'bg-slate-100 text-slate-700',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    SIGNED:    'bg-green-100 text-green-800',
    REVIEWED:  'bg-green-100 text-green-800', // legacy alias
    DISPUTED:  'bg-red-100 text-red-800',
    APPROVED:  'bg-emerald-100 text-emerald-800',
};

export default async function DORViewPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const dorId = parseInt(params.id);
    if (isNaN(dorId)) notFound();

    const dor: any = await getDOR(dorId);
    if (!dor) notFound();

    const sessionUser = session.user as any;
    const isAdmin = sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPERUSER';
    const canApprove = sessionUser.permissions?.includes(PERMISSIONS.APPROVE_DORS);
    const canRemind = ['ADMIN', 'SUPERUSER', 'SUPERVISOR'].includes(sessionUser.role);
    const reminderEligible = canRemind && dor.status === 'SUBMITTED' && !dor.traineeSignatureAt;
    const reminderCooldownActive = dor.lastReminderSentAt &&
        (Date.now() - new Date(dor.lastReminderSentAt).getTime()) / 1000 / 60 / 60 < 24;

    // Trainee can sign/dispute if they are the subject and the DOR is awaiting acknowledgement
    const pendingTraineeAction = dor.status === 'SUBMITTED' || dor.status === 'DRAFT';
    const isTraineeSubject = sessionUser.empId && dor.traineeId === sessionUser.empId;
    const canAcknowledge = isTraineeSubject && pendingTraineeAction && !dor.traineeSignatureAt;

    const responseData = JSON.parse(dor.responseData);
    const settings = await getSettings();

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Daily Observation Report</h1>
                    <p className="text-slate-500">
                        {new Date(dor.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-medium text-slate-400 mt-1">
                        Trainee: {dor.trainee.empName} &bull; Trainer: {dor.trainer.name}
                    </p>
                    <div className="mt-4 flex gap-2 flex-wrap">
                        <ExportDORButton dor={dor} traineeName={dor.trainee.empName || 'Trainee'} trainerName={dor.trainer.name} brandingSettings={settings} />
                        {isAdmin && (
                            <Link href={`/dor/${dor.id}/edit`} className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors shadow-sm text-sm font-medium">
                                <Edit size={16} />
                                <span>Edit Report</span>
                            </Link>
                        )}
                        {reminderEligible && (
                            <form action={remindTrainee}>
                                <input type="hidden" name="dorId" value={dor.id} />
                                <button
                                    type="submit"
                                    disabled={!!reminderCooldownActive}
                                    title={reminderCooldownActive ? 'Reminder already sent in the last 24 hours' : 'Send email reminder to trainee'}
                                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Bell size={16} />
                                    <span>{reminderCooldownActive ? 'Reminder Sent' : 'Remind Trainee'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="text-right space-y-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[dor.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {dor.status}
                    </span>
                    {dor.traineeSignatureAt && !dor.traineeDisputed && (
                        <p className="text-xs text-green-600 flex items-center justify-end">
                            <CheckCircle size={12} className="mr-1" />
                            Signed {new Date(dor.traineeSignatureAt).toLocaleDateString()}
                        </p>
                    )}
                    {dor.traineeDisputed && (
                        <p className="text-xs text-red-600 flex items-center justify-end">
                            <AlertTriangle size={12} className="mr-1" />
                            Disputed {new Date(dor.traineeSignatureAt).toLocaleDateString()}
                        </p>
                    )}
                    {dor.approvedAt && (
                        <p className="text-xs text-emerald-600 flex items-center justify-end">
                            <ShieldCheck size={12} className="mr-1" />
                            Approved {new Date(dor.approvedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Dispute notice */}
            {dor.traineeDisputed && dor.traineeDisputeNote && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
                    <h4 className="font-bold text-red-800 flex items-center mb-1">
                        <AlertTriangle size={16} className="mr-2" /> Trainee Dispute
                    </h4>
                    <p className="text-sm text-red-700">{dor.traineeDisputeNote}</p>
                </div>
            )}

            {/* Trainee comment (if signed with comment) */}
            {!dor.traineeDisputed && dor.traineeComment && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                    <h4 className="font-bold text-blue-800 flex items-center mb-1">
                        <CheckCircle size={16} className="mr-2" /> Trainee Comment
                    </h4>
                    <p className="text-sm text-blue-700">{dor.traineeComment}</p>
                </div>
            )}

            {/* Approval note */}
            {dor.approvalNotes && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
                    <h4 className="font-bold text-emerald-800 flex items-center mb-1">
                        <ShieldCheck size={16} className="mr-2" /> Approval Notes
                    </h4>
                    <p className="text-sm text-emerald-700">{dor.approvalNotes}</p>
                </div>
            )}

            {/* Field Responses */}
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
                                                        'bg-red-50 text-red-700 border border-red-200'}`}>
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

            {/* Trainee acknowledgement panel */}
            {canAcknowledge && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Sign */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <h4 className="font-bold text-green-900 flex items-center mb-2">
                            <CheckCircle size={16} className="mr-2" /> Sign & Acknowledge
                        </h4>
                        <p className="text-xs text-green-700 mb-3">By signing you confirm you have reviewed this report with your trainer.</p>
                        <form action={signDOR} className="space-y-3">
                            <input type="hidden" name="dorId" value={dor.id} />
                            <textarea
                                name="traineeComment"
                                placeholder="Add a comment (optional)…"
                                rows={3}
                                className="w-full text-sm border border-green-200 rounded-lg p-2 resize-none focus:ring-1 focus:ring-green-400 focus:outline-none bg-white"
                            />
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                                <Clock size={15} className="mr-2" /> Sign Report
                            </button>
                        </form>
                    </div>

                    {/* Dispute */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                        <h4 className="font-bold text-red-900 flex items-center mb-2">
                            <AlertTriangle size={16} className="mr-2" /> Dispute Report
                        </h4>
                        <p className="text-xs text-red-700 mb-3">Use this if you disagree with the contents. Your supervisor will be notified.</p>
                        <form action={disputeDOR} className="space-y-3">
                            <input type="hidden" name="dorId" value={dor.id} />
                            <textarea
                                name="disputeNote"
                                placeholder="Explain your dispute (required)…"
                                rows={3}
                                required
                                className="w-full text-sm border border-red-200 rounded-lg p-2 resize-none focus:ring-1 focus:ring-red-400 focus:outline-none bg-white"
                            />
                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                                <AlertTriangle size={15} className="mr-2" /> Submit Dispute
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Approval panel */}
            {canApprove && dor.status !== 'APPROVED' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <h4 className="font-bold text-emerald-900 flex items-center mb-2">
                        <ShieldCheck size={16} className="mr-2" /> Approve as Official Record
                    </h4>
                    {dor.traineeDisputed && (
                        <p className="text-xs text-red-600 mb-2 font-medium">⚠ This DOR has been disputed by the trainee — review before approving.</p>
                    )}
                    {!dor.traineeSignatureAt && (
                        <p className="text-xs text-amber-600 mb-2 font-medium">Note: trainee has not yet signed this report.</p>
                    )}
                    <form action={approveDOR} className="space-y-3 mt-3">
                        <input type="hidden" name="dorId" value={dor.id} />
                        <textarea
                            name="approvalNotes"
                            placeholder="Approval notes (optional)…"
                            rows={2}
                            className="w-full text-sm border border-emerald-200 rounded-lg p-2 resize-none focus:ring-1 focus:ring-emerald-400 focus:outline-none bg-white"
                        />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg text-sm flex items-center">
                            <ShieldCheck size={15} className="mr-2" /> Approve DOR
                        </button>
                    </form>
                </div>
            )}

            {dor.status === 'APPROVED' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-emerald-800">Official Record</p>
                        <p className="text-xs text-emerald-600">Approved {new Date(dor.approvedAt).toLocaleDateString()}{dor.approvalNotes ? ` — ${dor.approvalNotes}` : ''}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
