'use client';

import { useState, useMemo } from 'react';
import { Mail, Save, AlertCircle } from 'lucide-react';
import { saveEmailTemplate } from './actions';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    variables: string;
}

export default function EmailTemplateEditor({
    templates
}: {
    templates: EmailTemplate[];
}) {
    const [selectedId, setSelectedId] = useState<number | 'new'>(templates.length > 0 ? templates[0].id : 'new');
    const [isSaving, setIsSaving] = useState(false);

    const selectedTemplate = selectedId === 'new'
        ? null
        : templates.find(t => t.id === selectedId);

    // Form State
    const [name, setName] = useState(selectedTemplate?.name || '');
    const [subject, setSubject] = useState(selectedTemplate?.subject || '');
    const [body, setBody] = useState(selectedTemplate?.body || '');
    const [variables, setVariables] = useState(selectedTemplate?.variables || '[]');

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value === 'new' ? 'new' : parseInt(e.target.value);
        setSelectedId(val);

        const temp = val === 'new' ? null : templates.find(t => t.id === val);
        setName(temp?.name || '');
        setSubject(temp?.subject || '');
        setBody(temp?.body || '');
        setVariables(temp?.variables || '[]');
    };

    const parsedVariables = useMemo(() => {
        try {
            return JSON.parse(variables) as string[];
        } catch {
            return [];
        }
    }, [variables]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Mail className="mr-2 text-blue-500" /> Automated Emails
            </h2>
            <p className="text-sm text-slate-500 mb-6">Configure the subject and body for automated system emails.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Template</label>
                    <select
                        className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        value={selectedId}
                        onChange={handleSelectChange}
                        aria-label="Select Email Template"
                    >
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        <option value="new" className="font-bold text-blue-600">➕ Create New Template</option>
                    </select>
                </div>

                <form action={async (formData) => {
                    setIsSaving(true);
                    await saveEmailTemplate(formData);
                    setIsSaving(false);
                }} className="space-y-4 pt-4 border-t">
                    <input type="hidden" name="id" value={selectedId} />
                    <input type="hidden" name="variables" value={variables} />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Internal Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-slate-300 rounded-lg text-sm p-2 border"
                            placeholder="e.g. Account Creation"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Subject Row</label>
                        <input
                            type="text"
                            name="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border-slate-300 rounded-lg text-sm p-2 border"
                            placeholder="Welcome to Orbit 911!"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-slate-700">Email Body (HTML/Text)</label>
                            {parsedVariables.length > 0 && (
                                <span className="text-xs text-slate-500">
                                    Available Variables: {parsedVariables.map((v: string) => <code key={v} className="bg-slate-100 px-1 mx-0.5 rounded text-indigo-600">{v}</code>)}
                                </span>
                            )}
                        </div>
                        <textarea
                            name="body"
                            rows={6}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full border-slate-300 rounded-lg text-sm font-mono bg-slate-50 p-3 border"
                            placeholder="<p>Hello {{name}}, here is your password: {{password}}</p>"
                            required
                        />
                    </div>

                    {selectedId === 'new' && (
                        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800 flex items-start border border-amber-200">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <p>To safely use variables like <code className="font-bold">{'{{name}}'}</code>, you must ensure the backend code providing this email is passing that exact variable name in its payload configuration.</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
