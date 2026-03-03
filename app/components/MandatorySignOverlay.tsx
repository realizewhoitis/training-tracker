'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { signPolicyAction } from '@/app/actions/policies';
import { useFormStatus } from 'react-dom';

function SignButton({ timeLeft }: { timeLeft: number }) {
    const { pending } = useFormStatus();
    const disabled = timeLeft > 0 || pending;

    return (
        <button
            type="submit"
            disabled={disabled}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center shadow-md hover:shadow-lg active:scale-95"
        >
            <CheckCircle size={20} className="mr-2" />
            {pending ? 'Signing...' : 'Digitally Sign Document'}
        </button>
    );
}

export default function MandatorySignOverlay({ version, employeeId }: any) {
    const [timeLeft, setTimeLeft] = useState(version.readingTimer || 0);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(l => l - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft]);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-10">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]">
                <div className="bg-red-600 p-6 flex-shrink-0 rounded-t-2xl shadow-sm z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <ShieldAlert className="mr-3" size={28} />
                        Mandatory Policy Acknowledgment
                    </h2>
                    <p className="text-red-100 mt-2 text-sm">You must read and digitally sign this document before accessing the application.</p>
                </div>

                <div className="p-6 md:p-8 flex-grow overflow-y-auto bg-slate-50">
                    <div className="bg-white p-8 rounded-xl ring-1 ring-slate-200 shadow-sm max-w-none prose prose-sm md:prose-base m-auto min-h-full">
                        <h1 className="text-slate-900 mb-6 pb-4 border-b border-slate-200">{version.container?.title} - v{version.versionNumber}</h1>
                        <div dangerouslySetInnerHTML={{ __html: version.content }} />
                    </div>
                </div>

                <div className="p-6 flex-shrink-0 bg-white rounded-b-2xl border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
                    <div className="text-sm font-medium">
                        {timeLeft > 0 ? (
                            <span className="flex items-center text-amber-600">
                                <span className="animate-pulse mr-2 w-2 h-2 bg-amber-600 rounded-full"></span>
                                Please read the document. You can sign in {timeLeft} seconds.
                            </span>
                        ) : (
                            <span className="text-green-600 flex items-center">
                                <CheckCircle size={16} className="mr-1.5" />
                                You may now sign the document.
                            </span>
                        )}
                    </div>

                    <form action={signPolicyAction}>
                        <input type="hidden" name="versionId" value={version.id} />
                        <input type="hidden" name="employeeId" value={employeeId} />
                        <SignButton timeLeft={timeLeft} />
                    </form>
                </div>
            </div>
        </div>
    );
}
