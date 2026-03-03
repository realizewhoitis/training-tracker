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
    path.join(__dirname, '../app'),
    path.join(__dirname, '../lib'),
    path.join(__dirname, '../components')
];

let fixedCount = 0;

targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    walkDir(dir, filePath => {
        if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes("'use server'") || content.includes('"use server"')) {
            const firstLine = content.split('\n')[0].trim();
            if (firstLine.includes('use server')) {
                return;
            }

            let newContent = content.replace(/['"]use server['"];?\r?\n?/g, '');
            newContent = "'use server';\n" + newContent;
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Fixed ${filePath}`);
            fixedCount++;
        }
    });
});

console.log(`Done. ${fixedCount} files fixed.`);
