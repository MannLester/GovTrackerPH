import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse the DATABASE_URL
const connectionString = process.env.DATABASE_URL;

async function runSQLScript(client, scriptPath) {
    try {
        console.log(`📄 Running ${path.basename(scriptPath)}...`);
        const sql = fs.readFileSync(scriptPath, 'utf8');
        await client.query(sql);
        console.log(`✅ ${path.basename(scriptPath)} executed successfully!`);
    } catch (error) {
        console.error(`❌ Error running ${path.basename(scriptPath)}:`, error.message);
        throw error;
    }
}

async function setupDatabase() {
    console.log('🚀 Starting GovTracker PH Database Setup...\n');
    
    const client = new Client({
        host: 'db.dxbxqqfspwhkapmgrylz.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'UcpZcZIc943etV5V',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Connect to database
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Database connection successful!\n');

        // Test query
        const result = await client.query('SELECT NOW()');
        console.log('📅 Database time:', result.rows[0].now);

        // Run scripts in order
        const scripts = [
            path.join(__dirname, 'database', '01_create_tables.sql'),
            path.join(__dirname, 'database', '02_indexes_triggers.sql'),
            path.join(__dirname, 'database', '03_seed_data.sql')
        ];

        for (const script of scripts) {
            await runSQLScript(client, script);
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
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed.');
    }
}

// Run the setup
setupDatabase();
