'use client';

import { useState } from 'react';
import { FileText, Upload, Pencil, Check, X, Loader2 } from 'lucide-react';
import { updateExpirationDate, uploadCertificate } from '@/app/actions/expiration-actions';

interface ExpirationRowProps {
    expiration: any; // Using any for simplicity with the complex Prisma include, or define a type
}

export default function ExpirationRow({ expiration }: ExpirationRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [dateValue, setDateValue] = useState(
        expiration.Expiration ? new Date(expiration.Expiration).toISOString().split('T')[0] : ''
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await updateExpirationDate(expiration.expirationID, dateValue || null);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleUpload = async (formData: FormData) => {
        setIsUploading(true);
        await uploadCertificate(formData);
        setIsUploading(false);
    };

    const isExpired = expiration.Expiration && new Date(expiration.Expiration) < new Date();

    return (
        <tr className="group hover:bg-slate-50 transition-colors">
            <td className="py-2 text-slate-800 font-medium">{expiration.certificate.certificateName}</td>
            <td className="py-2">
                {isEditing ? (
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className={isExpired ? 'text-red-500 font-bold' : 'text-slate-600'}>
                            {expiration.Expiration ? new Date(expiration.Expiration).toLocaleDateString() : 'N/A'}
                        </span>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit Date"
                        >
                            <Pencil size={12} />
                        </button>
                    </div>
                )}
            </td>
            <td className="py-2 text-right">
                {expiration.documentPath ? (
                    <a
                        href={`/api/files/${expiration.documentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-end items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                        <FileText size={16} className="mr-1" />
                        View
                    </a>
                ) : (
                    <form action={handleUpload} className="flex justify-end items-center space-x-2">
                        <input type="hidden" name="expirationId" value={expiration.expirationID.toString()} />
                        <div className="relative">
                            <input
                                type="file"
                                name="file"
                                id={`file-${expiration.expirationID}`}
                                className="hidden"
                                onChange={(e) => e.target.form?.requestSubmit()}
                                disabled={isUploading}
                            />
                            <label
                                htmlFor={`file-${expiration.expirationID}`}
                                className={`cursor-pointer text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 flex items-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <Loader2 size={12} className="mr-1 animate-spin" />
                                ) : (
                                    <Upload size={12} className="mr-1" />
                                )}
                                {isUploading ? 'Uploading...' : 'Choose'}
                            </label>
                        </div>
                    </form>
                )}
            </td>
        </tr>
    );
}
