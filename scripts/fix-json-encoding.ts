
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data/utils');
const files = [
    'Employee.json',
    'Training.json',
    'Certificate.json',
    'Attendance.json',
    'CertificateTrainingExclusion.json',
    'Expiration.json'
];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check for BOM
        if (content.charCodeAt(0) === 0xFEFF) {
            console.log(`Fixing BOM in ${file}`);
            const cleanContent = content.slice(1); // Remove first char
            fs.writeFileSync(filePath, cleanContent);
        } else {
            console.log(`${file} is clean.`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});
