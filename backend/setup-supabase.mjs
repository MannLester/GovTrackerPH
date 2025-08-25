import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQLScript(scriptPath) {
    try {
        console.log(`📄 Running ${path.basename(scriptPath)}...`);
        const sql = fs.readFileSync(scriptPath, 'utf8');
        
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            throw error;
        }
        
        console.log(`✅ ${path.basename(scriptPath)} executed successfully!`);
    } catch (error) {
        console.error(`❌ Error running ${path.basename(scriptPath)}:`, error.message);
        throw error;
    }
}

async function setupDatabase() {
    console.log('🚀 Starting GovTracker PH Database Setup...\n');

    try {
        // Test connection
        console.log('🔌 Testing Supabase connection...');
        const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connection successful!\n');

        // For Supabase, we'll need to run scripts manually in the dashboard
        console.log('⚠️  For Supabase, you need to run the SQL scripts manually:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run these scripts in order:');
        console.log('   - database/01_create_tables.sql');
        console.log('   - database/02_indexes_triggers.sql');
        console.log('   - database/03_seed_data.sql');
        
        console.log('\n📁 Script locations:');
        const scripts = [
            path.join(__dirname, 'database', '01_create_tables.sql'),
            path.join(__dirname, 'database', '02_indexes_triggers.sql'),
            path.join(__dirname, 'database', '03_seed_data.sql')
        ];

        scripts.forEach((script, index) => {
            console.log(`   ${index + 1}. ${script}`);
        });

    } catch (error) {
        console.error('💥 Connection test failed:', error.message);
        console.log('\n📋 Manual Setup Instructions:');
        console.log('1. Open your Supabase dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Copy and run each SQL script from the database/ folder');
    }
}

// Run the setup
setupDatabase();

export { supabase };
