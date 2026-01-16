
'use client';

import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    label?: string;
    accept?: string;
    currentFile?: string | null;
}

export default function FileUpload({ onFileSelect, label = "Upload Document", accept = ".pdf,.jpg,.jpeg,.png", currentFile }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleFiles = (file: File) => {
        setSelectedFile(file);
        onFileSelect(file);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label}
            </label>

            {/* Current File Display */}
            {currentFile && !selectedFile && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-blue-700">
                        <FileText size={18} />
                        <span className="text-sm font-medium truncate max-w-xs">{currentFile}</span>
                    </div>
                    <div className="text-xs text-blue-500 uppercase font-semibold">Current</div>
                </div>
            )}

            {/* Upload Area */}
            <div
                className={`relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
          ${selectedFile ? 'border-green-500 bg-green-50' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircle size={32} className="mb-2" />
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-green-500 mt-1">Ready to upload</p>
                        <button
                            onClick={clearFile}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-200"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-500">
                        <Upload size={24} className="mb-2" />
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                )}
            </div>
        </div>
    );
}
