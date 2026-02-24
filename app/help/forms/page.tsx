import { FileSpreadsheet, FileEdit, FileSearch, Download } from 'lucide-react';

export default function Chapter5Page() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <FileSpreadsheet size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chapter 5: Forms & Reporting</h1>
                    <p className="text-slate-500">The WYSIWYG Form Builder, evaluating Trainees, and PDF submission exports.</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                {/* Section 1 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <FileEdit className="w-5 h-5 mr-2 text-slate-400" />
                        The WYSIWYG Form Builder
                    </h2>
                    <p className="mt-4">
                        Administrators have full agency over the layout and grading structures of evaluations through the interactive <strong>Form Builder</strong> (`Admin &gt; Manage Forms`).
                    </p>
                    <p>
                        Instead of manipulating JSON blocks, Administrators can visually drag-and-drop structural elements to build custom observation reports that map directly to the agency's existing paperwork:
                    </p>

                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                        <li><strong>Creating Sections:</strong> Group conceptually related inputs together (e.g., 'Officer Safety' or 'Radio Communications'). You can drag sections up or down to reorder the final document.</li>
                        <li><strong>Input Categories:</strong> Within a Section, you can nest multiple Field Inputs. Available data types include precise Number Ratings, long-form Text Areas for narratives, or standard abbreviated Text fields.</li>
                        <li><strong>Publishing:</strong> Any modifications to the form schema are saved locally as drafts. When the new template is complete, the Administrator must explicitly click <strong>Publish Schema</strong>. This permanently writes the new template to Cloud Storage, immediately making it the default template for all new Field Training Officers.</li>
                    </ul>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-800 rounded-r-lg shadow-sm">
                        <strong>Architectural Note:</strong> Publishing a new Form Schema does <em>not</em> retroactively alter historical reports. Previous submissions will always display the exact questions that were asked on the day they were filed, ensuring compliance preservation.
                    </div>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The WYSIWYG Form Builder interface showing dragged sections]</span>
                    </div>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <FileSearch className="w-5 h-5 mr-2 text-slate-400" />
                        Daily Observation Reports (DORs)
                    </h2>
                    <p className="mt-4">
                        A DOR is the primary grading matrix filed by Field Training Officers (FTOs) to systematically evaluate probationary Trainees at the end of every active shift.
                    </p>

                    <div className="bg-indigo-50 border border-indigo-200 p-4 my-6 text-indigo-800 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-2">Creating an Evaluation:</h3>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                            <li>Navigate to the <strong>Reports</strong> tab in the main sidebar and click "Create DOR".</li>
                            <li>The evaluator must designate the target <strong>Trainee</strong> from the directory. The <strong>Evaluator</strong> field will automatically pin to the currently authenticated user.</li>
                            <li>Using the dynamically generated template, the Trainer will parse through the grid and assign standard numeric evaluations (typically scaling from 1 - 7).</li>
                            <li>If a specific metric was not applicable during a shift, evaluating officers should use the <strong>'N.O.'</strong> (Not Observed) designation.</li>
                            <li>Fill the Narrative sections carefully, as these long-form texts are vital for subsequent administrative overview.</li>
                            <li>Click Submit. The raw scores are immediately processed into the global averages mapped on the main Dashboard.</li>
                        </ol>
                    </div>

                    <p className="mt-4">
                        Upon submission, the evaluation enters a <strong>Pending Review</strong> state. The target Trainee will receive a notification prompting them to log into the portal, review the narrative, and digitally sign the document to acknowledge receipt of the grading.
                    </p>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <Download className="w-5 h-5 mr-2 text-slate-400" />
                        Exporting Submissions
                    </h2>
                    <p className="mt-4">
                        All historical Daily Observation Reports are searchable from the <strong>Reports</strong> directory. They can be filtered by specific Trainees, specific Instructors, or distinct date boundaries.
                    </p>
                    <p>
                        For physical filings or external legal requests, Administrators can click the Action Menu (three vertical dots) next to any completed submission and select <strong>Download PDF</strong>. The system will cleanly re-format the grid data into a printable, CJIS-compliant 8.5" x 11" document bearing the digital signatures of both involved parties.
                    </p>
                </section>

            </div>
        </div>
    );
}
