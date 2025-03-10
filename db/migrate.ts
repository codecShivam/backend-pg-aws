import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from '../db';

async function main() {
    console.log('Starting migration...');
     
    await migrate(db, {
        migrationsFolder: './db/migrations'
    })

    console.log('Migration completed successfully');

    await pool.end();
}

main().catch((err) => {
    console.error('Error during migration');
    console.error(err);
    process.exit(1);
});