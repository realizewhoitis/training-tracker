import { PackageOpen, Repeat, Search, FileSpreadsheet } from 'lucide-react';

export default function Chapter4Page() {
    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <PackageOpen size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Chapter 4: Inventory Management</h1>
                    <p className="text-slate-500">Asset catalogs, assignment tracking, and historical chain of custody.</p>
                </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

                {/* Section 1 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">
                        <Search className="w-5 h-5 mr-2 text-slate-400" />
                        The Asset Catalog
                    </h2>
                    <p className="mt-4">
                        The <strong>Inventory</strong> tab acts as the centralized ledger for all physical hardware assigned to your agency (e.g., Radios, Vehicles, Firearms, Body Cameras). Administrators can manage the complete lifecycle of equipment from purchase to depreciation.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                        <li><strong>Filtering:</strong> Use the dropdown menu in the upper toolbar to instantly filter the catalog by physical status (Available, Assigned, Out of Service, Damaged).</li>
                        <li><strong>Live Search:</strong> Utilize the search bar to locate an asset strictly by its serial number or manufacturer identifier.</li>
                        <li><strong>Data Export:</strong> Click the <strong>Export CSV</strong> button to download a complete spreadsheet of the active repository for budget auditing.</li>
                    </ul>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <PackageOpen className="w-5 h-5 mr-2 text-slate-400" />
                        Creating & Updating Assets
                    </h2>
                    <p className="mt-4">
                        To inject new equipment into the tracking matrix, Administrators can click the <strong>"Add Asset"</strong> button in the top right corner.
                    </p>

                    <div className="bg-slate-50 border border-slate-300 p-4 rounded-lg my-6">
                        <h4 className="font-bold text-slate-800 mb-2">Required Fields:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li><strong>Name:</strong> A human-readable identifier (e.g., 'Motorola APX 6000').</li>
                            <li><strong>Category:</strong> The classification bucket (e.g., Electronics, Vehicles).</li>
                            <li><strong>Serial Number:</strong> The precise alphanumeric tracking code provided by the manufacturer.</li>
                            <li><strong>Condition:</strong> The physical state of the item (New, Good, Fair, Poor).</li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-amber-800 rounded-r-lg shadow-sm">
                        <strong>Early Intervention Warning:</strong> Tracking Asset condition is critical. If a piece of equipment is manually downgraded to <strong>POOR</strong> or <strong>DAMAGED</strong> while assigned to an employee, the system will instantly flag that employee in the Administrative <strong>EIS Matrix</strong> for review.
                    </div>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="flex items-center text-xl font-bold text-slate-800 border-b border-slate-100 pb-2 mt-8">
                        <Repeat className="w-5 h-5 mr-2 text-slate-400" />
                        Assignments & Chain of Custody
                    </h2>
                    <p className="mt-4">
                        Orbit 911 maintains an immutable Chain of Custody ledger for every distinct piece of inventory. To assign a piece of equipment to a staff member, click the <strong>"Assign"</strong> button located on any available asset row within the catalog.
                    </p>

                    <ol className="list-decimal pl-5 space-y-2 mt-4 text-slate-700">
                        <li>Selecting "Assign" will open the Assignment modal dialogue.</li>
                        <li>Select the target Employee from the searchable dropdown list.</li>
                        <li>The asset status will immediately shift to <strong>Assigned</strong>, and it will disappear from the "Available" filters.</li>
                    </ol>

                    <p className="mt-4">
                        Similarly, to reclaim the asset, click the <strong>"Return"</strong> button on the asset row. You will be prompted to verify the item's physical condition upon its return.
                    </p>

                    <p className="mt-6">
                        By navigating directly to the exact detail page for a single asset, Administrators can review a chronological ledger documenting exactly who possessed the equipment, what condition it was in when it was loaned out, and when it was returned.
                    </p>

                    <div className="my-6 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                        <span className="text-slate-400 text-sm font-mono">[📸 Insert Screenshot: The chronological Chain of Custody table for a single Radio tracker]</span>
                    </div>

                </section>

            </div>
        </div>
    );
}
