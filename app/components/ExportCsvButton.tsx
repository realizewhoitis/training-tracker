'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportCsvButtonProps {
    data: any[];
    filename: string;
    label?: string;
    headers?: string[];
}

export default function ExportCsvButton({ data, filename, label = "Export CSV", headers }: ExportCsvButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        try {
            if (!data || data.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Determine headers from keys of the first object if not provided
            const headerRow = headers || Object.keys(data[0]);

            // Format rows
            const csvRows = [];
            csvRows.push(headerRow.join(',')); // Add Header Row

            // Add Data Rows
            for (const row of data) {
                const values = headerRow.map(header => {
                    const val = row[header];
                    // Escape quotes and wrap in quotes to handle commas within data
                    const escaped = ('' + (val !== null && val !== undefined ? val : '')).replace(/"/g, '""');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            }

            // Create Blob and Download
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Export failed", error);
            alert("An error occurred while generating the CSV file.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            title="Download table data as CSV spreadsheet"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
            <Download size={16} className={`${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Generating...' : label}
        </button>
    );
}
