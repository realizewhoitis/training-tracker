'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR hydration errors
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg border border-slate-200 flex flex-col justify-center items-center text-slate-400">Loading Editor...</div>
});

interface RichTextEditorProps {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
    name?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']                                         // remove formatting button
    ]
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align'
];

export default function RichTextEditor({ value, defaultValue, onChange, placeholder, readOnly = false, className = '', name }: RichTextEditorProps) {
    const [mounted, setMounted] = useState(false);
    const [internalValue, setInternalValue] = useState(value || defaultValue || '');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (newVal: string) => {
        setInternalValue(newVal);
        if (onChange) onChange(newVal);
    };

    if (!mounted) {
        return <div className={`h-64 w-full bg-slate-100 animate-pulse rounded-lg border border-slate-200 ${className}`}></div>;
    }

    return (
        <div className={`rich-text-container ${className}`}>
            {name && <input type="hidden" name={name} value={internalValue} />}
            <ReactQuill
                theme="snow"
                value={value !== undefined ? value : internalValue}
                onChange={handleChange}
                modules={readOnly ? { toolbar: false } : modules}
                formats={formats}
                readOnly={readOnly}
                placeholder={placeholder || "Start typing..."}
                style={{ height: 'auto', minHeight: '200px' }}
            />
            {/* Inject a tiny style block to ensure the editor looks decent natively */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .rich-text-container .ql-container {
                    font-family: inherit;
                    font-size: 1rem;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    min-height: 200px;
                }
                .rich-text-container .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: #f8fafc;
                }
                .rich-text-container .ql-editor {
                    min-height: 200px;
                }
            `}} />
        </div>
    );
}
