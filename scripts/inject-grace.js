const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDirs = [
    path.join(__dirname, '../app/admin'),
    path.join(__dirname, '../app/actions'),
    path.join(__dirname, '../app/inventory')
];

let injectedCount = 0;

targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    walkDir(dir, filePath => {
        if (!filePath.endsWith('actions.ts') && !filePath.endsWith('employee-actions.ts') && !filePath.endsWith('form-builder.ts') && !filePath.endsWith('log-training.ts') && !filePath.endsWith('expiration-actions.ts') && !filePath.endsWith('policies.ts')) return;

        let content = fs.readFileSync(filePath, 'utf8');

        // Skip files that shouldn't be governed here (like settings maybe? actually settings should be read/writeable? Wait, settings should be read-only too except for License Key!).
        // Let's inject into all. But we need the import:
        if (!content.includes('enforceWriteAccess')) {
            const importStatement = "import { enforceWriteAccess } from '@/lib/licenseAccess';\n";
            content = importStatement + content;

            // Find all instances of "export async function XYZ("
            const regex = /export\s+async\s+function\s+\w+\s*\([^)]*\)\s*(?::\s*[^\{]+)?\s*\{/g;
            content = content.replace(regex, match => {
                // If it's a GET or safe function, we can skip, but mostly these are mutations.
                if (match.includes('getSettings') || match.includes('getUser') || match.includes('getTemplate') || match.includes('authenticate')) {
                    return match;
                }
                return match + "\n    await enforceWriteAccess();";
            });

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Injected into ${filePath}`);
            injectedCount++;
        }
    });
});

console.log(`Done. ${injectedCount} files updated.`);
