import fs from 'fs';
import path from 'path';

// Define the two configurations
const SQLITE_CONFIG = `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`;

const POSTGRES_CONFIG = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`;

const SCHEMA_PATH = path.join(process.cwd(), 'prisma', 'schema.prisma');

function main() {
    const mode = process.argv[2]; // 'local' or 'prod'

    if (!mode || (mode !== 'local' && mode !== 'prod')) {
        console.error('Usage: npx tsx scripts/switch-db-provider.ts [local|prod]');
        process.exit(1);
    }

    // Read the current schema
    let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    // Regex to find the datasource block
    // Matches "datasource db {" followed by anything until the closing "}"
    const datasourceRegex = /datasource\s+db\s+\{[\s\S]*?\}/;

    if (!datasourceRegex.test(schema)) {
        console.error('Error: Could not find "datasource db" block in schema.prisma');
        process.exit(1);
    }

    // Replace with the desired config
    const newConfig = mode === 'local' ? SQLITE_CONFIG : POSTGRES_CONFIG;
    const newSchema = schema.replace(datasourceRegex, newConfig);

    // Write back to file
    fs.writeFileSync(SCHEMA_PATH, newSchema);

    console.log(`✅ Switched database provider to: ${mode === 'local' ? 'SQLite (Local)' : 'PostgreSQL (Production)'}`);
}

main();
