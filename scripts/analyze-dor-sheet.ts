
import ExcelJS from 'exceljs';
import path from 'path';

async function main() {
    const filePath = path.join(process.cwd(), 'data/Daily Observation Report.xlsx');
    console.log(`Reading: ${filePath}`);

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
    } catch (error) {
        console.error("Error reading file:", error);
        return;
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        console.error("No worksheet found");
        return;
    }

    console.log(`Sheet Name: ${worksheet.name}`);
    console.log("--- RAW STRING CONTENT ---");

    worksheet.eachRow((row, rowNumber) => {
        // ExcelJS rows are 1-indexed
        const firstCell = row.getCell(1);
        if (firstCell && firstCell.value) {
            const val = firstCell.value.toString();
            console.log(`Row ${rowNumber - 1}: ${val.trim()}`);
        }
    });
}

main();
