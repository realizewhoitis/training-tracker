'use client';

import { useState } from 'react';
import { uploadEvidence } from './actions';
import { Upload, Lock, FileText, CheckCircle } from 'lucide-react';

type Evidence = {
    id: number;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    isLocked: boolean;
};

export function EvidenceLocker({ files, containerId, requirementId }: { files: Evidence[], containerId?: number, requirementId?: number }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData(e.currentTarget);
        if (containerId) formData.append('containerId', containerId.toString());
        if (requirementId) formData.append('requirementId', requirementId.toString());

        try {
            await uploadEvidence(formData);
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error(error);
            alert("Failed to upload evidence.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-indigo-600" />
                    Evidence Locker
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">IMMUTABLE</span>
            </div>

            <div className="p-5">
                <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1">
                        <input
                            type="file"
                            name="file"
                            required
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors border border-slate-200 rounded-lg cursor-pointer"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isUploading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 shrink-0"
                    >
                        {isUploading ? 'Uploading...' : <><Upload size={16} className="mr-2" /> Submit Proof</>}
                    </button>
                </form>

                <div className="space-y-3">
                    {files.length === 0 && (
                        <div className="text-slate-400 text-center py-6 border-2 border-dashed border-slate-100 rounded-lg">
                            <FileText className="mx-auto w-8 h-8 opacity-20 mb-2" />
                            <p>No compliance evidence has been uploaded.</p>
                        </div>
                    )}
                    {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                {file.isLocked ? <Lock size={16} className="text-emerald-600 shrink-0" /> : <FileText size={16} className="text-slate-400 shrink-0" />}
                                <div className="truncate">
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline truncate block">
                                        {file.fileName}
                                    </a>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Locked on {new Date(file.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <CheckCircle size={20} className="text-emerald-500 shrink-0 ml-4 hidden sm:block" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
