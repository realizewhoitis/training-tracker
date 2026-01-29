import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

try {
    let content = fs.readFileSync(schemaPath, 'utf8');

    // Check if we are on Vercel (or just force it for now since we want Postgres everywhere)
    if (content.includes('provider = "sqlite"')) {
        console.log('Detected SQLite in schema.prisma. Switching to PostgreSQL for deployment...');
        content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
        fs.writeFileSync(schemaPath, content);
        console.log('Successfully updated schema.prisma to PostgreSQL.');
    } else {
        console.log('schema.prisma is already configured for PostgreSQL (or another provider).');
    }
} catch (error) {
    console.error('Failed to update schema.prisma:', error);
    // Don't exit with error to avoid breaking local installs if file missing
}
