const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (f === 'node_modules' || f === '.next' || f === '.git' || f === 'scripts') return;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDirs = [
    path.join(__dirname, '../app/admin'),
    path.join(__dirname, '../app/actions'),
    path.join(__dirname, '../app/inventory')
];

let fixedCount = 0;

targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    walkDir(dir, filePath => {
        if (!filePath.endsWith('actions.ts') && !filePath.endsWith('employee-actions.ts') && !filePath.endsWith('form-builder.ts') && !filePath.endsWith('log-training.ts') && !filePath.endsWith('expiration-actions.ts') && !filePath.endsWith('policies.ts')) return;

        let content = fs.readFileSync(filePath, 'utf8');

        // If line 1 is the import and line 2 is 'use server', swap them.
        const lines = content.split('\n');
        if (lines.length >= 2 && lines[0].includes('import { enforceWriteAccess }') && lines[1].includes('use server')) {
            const temp = lines[0];
            lines[0] = lines[1];
            lines[1] = temp;
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`Fixed formatting in ${filePath}`);
            fixedCount++;
        }
    });
});

console.log(`Done. ${fixedCount} files fixed.`);
