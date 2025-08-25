import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/config';

export async function GET() {
    try {
        console.log('📍 Testing Supabase table structure...');

        // First, let's see what tables exist
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (tablesError) {
            console.error('Error fetching tables:', tablesError);
        } else {
            console.log('📋 Available tables:', tables?.map(t => t.table_name));
        }

        // Let's try to fetch from dim_project without joins first
        const { data: projects, error: projectsError } = await supabase
            .from('dim_project')
            .select('*')
            .limit(1);

        if (projectsError) {
            console.error('Error fetching from dim_project:', projectsError);
            return NextResponse.json({ 
                error: 'Error fetching from dim_project', 
                details: projectsError.message 
            }, { status: 500 });
        }

        console.log('📊 Sample project structure:', projects?.[0]);

        // Let's also check if other dimension tables exist
        const tableChecks = ['dim_status', 'dim_location', 'dim_contractor'];
        const tableResults: Record<string, { error?: string; exists?: boolean; sample?: unknown }> = {};

        for (const tableName of tableChecks) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                    
                if (error) {
                    tableResults[tableName] = { error: error.message };
                } else {
                    tableResults[tableName] = { exists: true, sample: data?.[0] };
                }
            } catch {
                tableResults[tableName] = { error: 'Table check failed' };
            }
        }

        return NextResponse.json({
            message: 'Database structure check complete',
            availableTables: tables?.map(t => t.table_name) || [],
            sampleProject: projects?.[0] || null,
            dimensionTables: tableResults
        });

    } catch (error) {
        console.error('❌ Error checking database structure:', error);
        return NextResponse.json(
            { 
                error: 'Failed to check database structure',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
