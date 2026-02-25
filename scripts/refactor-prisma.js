const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const appDir = path.join(__dirname, '../app');
const libDir = path.join(__dirname, '../lib');

function processFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if it imports prisma
    if (!content.includes('import prisma from')) return;

    // 1. Replace the import statement
    content = content.replace(
        /import\s+prisma\s+from\s+['"]@\/lib\/prisma['"];?/,
        "import { getTenantPrisma } from '@/lib/prisma';"
    );
    // Also handle relative imports if any
    content = content.replace(
        /import\s+prisma\s+from\s+['"]\.\.\/.*?lib\/prisma['"];?/,
        "import { getTenantPrisma } from '@/lib/prisma';"
    );

    // 2. We don't want to replace string literals or console.logs that have 'prisma.'
    // A simplified approach: replace `prisma.` with `(await getTenantPrisma()).` globally, 
    // EXCEPT when it's preceded by `import ` or `const `, which we handled.
    // To be safe, look for `prisma.[a-zA-Z]+\.` or similar.
    // Examples: 
    // await prisma.user.findMany -> await (await getTenantPrisma()).user.findMany
    // We can just replace `prisma.` with `(await getTenantPrisma()).`
    const updatedContent = content.replace(/\bprisma\./g, "(await getTenantPrisma()).");

    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        console.log('Modified:', filePath);
    }
}

walkDir(appDir, processFile);
walkDir(libDir, processFile);
console.log('Refactor complete.');
