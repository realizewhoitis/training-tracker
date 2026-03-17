import { ShieldCheck, FileText, CheckCircle, Share2, FileSignature, UploadCloud } from 'lucide-react';

export default function ComplianceHelpPage() {
    return (
        <div className="space-y-8">
            <div className="border-b border-slate-200 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Chapter 7: Policies & Compliance</h1>
                <p className="text-slate-500 text-lg">Managing standard operating procedures, accreditations, and evidence.</p>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700">
                <p>
                    Orbit 911 isn't just a place to store digital signatures. The Policy Engine has been upgraded into a robust Compliance & Accreditation tracking tool. It is designed to automatically manage the entire lifecycle of an agency's standards and seamlessly map them to external mandates like CALEA or state boards.
                </p>

                <h2 className="text-2xl font-bold flex items-center text-slate-800 mt-10 mb-6">
                    <FileSignature className="mr-3 text-indigo-600" /> Automated Lifecycle Management
                </h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-4">
                        <p>When administrators draft a new SOP or policy, they can designate a specific <strong>Review Cycle</strong> (e.g., 12 months) and assign a <strong>Policy Owner</strong>.</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Automated Notifications:</strong> The system runs a secure background routine every midnight. It will automatically email the Policy Owner when a document reaches <strong>90, 60, and 30 days</strong> prior to its target review date.</li>
                            <li><strong>Dashboard Warnings:</strong> The Admin dashboard will visually flag legacy or non-compliant policies that are severely overdue.</li>
                            <li><strong>Side-by-Side Drafting:</strong> When drafting a new revision to an active policy, administrators can utilize the Side-by-Side Diff viewer to visually red-line exactly what text was added or removed before publishing.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-bold flex items-center text-slate-800 mt-10 mb-6">
                    <CheckCircle className="mr-3 text-indigo-600" /> The Accreditation Workbench
                </h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <p>Agencies subject to external auditing formats (like HIPAA, CALEA, etc.) can map their internal SOPs directly to those mandates.</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Standard Frameworks:</strong> Access the <code className="bg-slate-100 px-2 py-1 rounded text-purple-700">/admin/accreditation</code> panel to manually construct an external standard and load its associated requirements.</li>
                        <li><strong>Split-Screen Mapping:</strong> When editing a Policy, you can launch the <em>Mapping Workbench</em>. This split-screen interface lets you quickly review your drafted policy text on one side and bind it to specific accreditation clauses on the other.</li>
                        <li><strong>Gap Analysis:</strong> Navigate to the Gap Analysis dashboard to review a real-time scorecard. It breaks down every external requirement into "Covered vs. Uncovered," mapping out your final percentage towards full certification.</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold flex items-center text-slate-800 mt-10 mb-6">
                    <UploadCloud className="mr-3 text-indigo-600" /> Evidence Lockers & PDF Uploads
                </h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <p>To satisfy auditors, you can manage and permanently store tangible proof.</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Rich Text & PDFs:</strong> The Policy Editor utilizes a fully featured WYSIWYG editor. You can optionally upload a native <strong>PDF Core Document</strong>. When a PDF is present, Orbit 911 will embed it securely within a high-performance iframe at the top of the policy view.</li>
                        <li><strong>Note on Word Docs:</strong> Standard Word Documents (.doc, .docx) are not supported by native browser embedding. You must <em>Save As PDF</em> in Word before uploading.</li>
                        <li><strong>Evidence Locker:</strong> In addition to the core policy, administrators can upload discrete files (photos, scan fragments) to the Evidence Locker attached to any policy or standard requirement. These files are cryptographically locked in the database, tying the upload directly to your administrative identity for audit trails.</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold flex items-center text-slate-800 mt-10 mb-6">
                    <Share2 className="mr-3 text-indigo-600" /> Community Trust & Transparency
                </h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-4">
                        <p>Transparency is easily achievable without granting complex guest portal access.</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Public Toggle:</strong> Hit the <code className="bg-slate-100 px-2 py-1 rounded text-green-700">isPublic</code> switch on any policy container. Orbit 911 will mirror the current active HTML/PDF version of that policy to the unauthenticated edge route <code className="bg-slate-100 px-2 py-1 rounded text-blue-700">/community</code>.</li>
                            <li><strong>Auditor Personas:</strong> You can provision users with the <code className="bg-slate-100 px-2 py-1 rounded text-red-700">AUDITOR</code> role. They are granted expansive read-only visual access to the Accreditation interface, Gap Analysis, and Evidence Lockers, but their accounts possess zero mutation/write privileges.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-bold flex items-center text-slate-800 mt-10 mb-6">
                    <FileText className="mr-3 text-indigo-600" /> Policy Search & Discovery
                </h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <p>Finding the exact procedure you need during a critical incident is paramount. The system provides powerful discovery tools tailored for each role:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Employee Hub:</strong> General users navigate an instant text-search portal with smart category tabs. They can quickly toggle "Action Required" to find policies awaiting their mandatory digital signature.</li>
                        <li><strong>Admin Directory:</strong> Administrators have access to an enhanced data table allowing them to filter by Policy Owner, Category, and precise draft status.</li>
                        <li><strong>Public Search:</strong> The Community Transparency Portal mirrors this instant-search capability, ensuring residents can find specific directives without navigating complex nested folders.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
