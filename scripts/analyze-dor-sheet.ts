
import * as XLSX from 'xlsx';
import path from 'path';

function main() {
    const filePath = path.join(process.cwd(), 'data/Daily Observation Report.xlsx');
    console.log(`Reading: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Parse into structure (Debug Mode: Dump all strings)
    console.log("--- RAW STRING CONTENT ---");
    data.forEach((row: any, i) => {
        if (!row || row.length === 0) return;
        const firstCell = row[0];
        if (typeof firstCell === 'string') {
            console.log(`Row ${i}: ${firstCell.trim()}`);
        }
    });
}

main();
