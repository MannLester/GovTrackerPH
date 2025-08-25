import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runSQLScript(scriptPath) {
    try {
        console.log(`📄 Running ${scriptPath}...`);
        const sql = fs.readFileSync(scriptPath, 'utf8');
        await pool.query(sql);
        console.log(`✅ ${scriptPath} executed successfully!`);
    } catch (error) {
        console.error(`❌ Error running ${scriptPath}:`, error.message);
        throw error;
    }
}

async function setupDatabase() {
    console.log('🚀 Starting GovTracker PH Database Setup...\n');

    try {
        // Test connection
        console.log('🔌 Testing database connection...');
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful!\n');

        // Run scripts in order
        const scripts = [
            path.join(__dirname, 'database', '01_create_tables.sql'),
            path.join(__dirname, 'database', '02_indexes_triggers.sql'),
            path.join(__dirname, 'database', '03_seed_data.sql')
        ];

        for (const script of scripts) {
            await runSQLScript(script);
        }

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📊 Sample data created:');
        console.log('   • 8 status types');
        console.log('   • 8 Philippine locations');
        console.log('   • 5 sample contractors');
        console.log('   • 4 test users (admin, personnel, citizens)');
        console.log('   • 4 sample projects');
        console.log('   • Sample comments, likes, and milestones');
        
        console.log('\n🔐 Default login credentials (password: password123):');
        console.log('   • Super Admin: admin@govtracker.ph');
        console.log('   • Admin: juan.delacruz@gov.ph');
        console.log('   • Personnel: maria.santos@gov.ph');
        console.log('   • Citizen: citizen@email.com');

    } catch (error) {
        console.error('💥 Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('\n🔌 Database connection closed.');
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
    setupDatabase();
}

export { setupDatabase, pool };
