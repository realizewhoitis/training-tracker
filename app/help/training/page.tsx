import { GraduationCap, ClipboardCheck, UploadCloud, FileSpreadsheet } from 'lucide-react';

export default function Chapter3Page() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <GraduationCap size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chapter 3: Training & Certification</h1>
                    <p className="text-slate-500">Virtual Sign-In Rosters, Topic Management, and Bulk Logging.</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                {/* Section 1 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <FileSpreadsheet className="w-5 h-5 mr-2 text-slate-400" />
                        The Training Directory
                    </h2>
                    <p className="mt-4">
                        The <strong>Training</strong> tab in the main sidebar is the centralized repository for all agency-wide training events. The interactive table displays every historically logged session, outlining the training topic, date, assigned instructor, and the number of attendees.
                    </p>
                    <p>
                        Supervisors and Administrators can click the <strong>Export CSV</strong> button atop the table to instantly generate a local spreadsheet of all past training curriculums for audit compliance.
                    </p>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <ClipboardCheck className="w-5 h-5 mr-2 text-slate-400" />
                        The Virtual Sign-In Roster
                    </h2>
                    <p className="mt-4">
                        Instead of manually typing observation records for 50 different employees, Trainers and Field Training Officers (FTOs) should utilize the <strong>Virtual Roster</strong> to rapidly certify an entire room of attendees.
                    </p>

                    <div className="bg-indigo-50 border border-indigo-200 p-4 my-6 text-indigo-800 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-2">Executing a Batch Roster Sign-In:</h3>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                            <li>Navigate to the top of the Training directory and click the <strong>"Virtual Roster"</strong> button.</li>
                            <li>Configure the parameters for the classroom session: Date, Hours issued, and the Training Topic.</li>
                            <li><strong>Dynamic Events:</strong> If the Training Topic does not exist in the dropdown, simply select <strong>"Create New Event"</strong> to dynamically forge a new curriculum path into the database on the fly.</li>
                            <li>Scroll down to the interactive employee grid. This grid is intelligently sectioned by active <strong>Shifts</strong>.</li>
                            <li>Use the mass-select "All" checkboxes in the section headers to quickly highlight entire squads, or check off individual names manually.</li>
                            <li>Click the final submit button to atomically log the completed hours into the permanent profiles of every highlighted employee.</li>
                        </ol>
                    </div>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The Virtual Roster screen showing shift-based checkboxes]</span>
                    </div>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <UploadCloud className="w-5 h-5 mr-2 text-slate-400" />
                        Historical CSV Imports
                    </h2>
                    <p className="mt-4">
                        If your agency is migrating off a legacy system (like physical filing cabinets or Excel spreadsheets) into Orbit 911, Administrators can utilize the <strong>Bulk CSV Importer</strong> to automatically inject thousands of historical records into the system.
                    </p>

                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                        <li>Navigate to the top of the Training directory and click the <strong>"Bulk Log"</strong> button.</li>
                        <li>Prepare an Excel file featuring 4 exact columns: <code>employeeId, trainingId, date, hours</code>.</li>
                        <li>Copy the raw data cells from Excel and press the <strong>Paste from Clipboard</strong> panel to upload.</li>
                        <li>The system will automatically validate the schema and flag any invalid Employee IDs before firmly writing the history to the profiles.</li>
                    </ul>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-800 rounded-r-lg shadow-sm">
                        <strong>Warning:</strong> The CSV Importer is a highly destructive administrative tool. Because it bypasses the standard single-entry validation pipelines for the sake of speed, uploading an improperly formatted datasheet will corrupt the training totals for the assigned employees. Proceed with intense caution.
                    </div>
                </section>

            </div>
        </div>
    );
}
