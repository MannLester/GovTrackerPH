// Re-export the new modular approach
export { supabase, testConnection } from './client';
export { projectsRepository } from './repositories/projects';
export { usersRepository } from './repositories/users';
export { commentsRepository } from './repositories/comments';
export { adminRepository } from './repositories/admin';
export * from './types';

// Import supabase for internal use
import { supabase } from './client';

// Backward-compatible query function for legacy code
import { QueryResult } from 'pg';

export const query = async (text: string, params?: unknown[]): Promise<QueryResult> => {
    try {
        console.log('🔄 Executing legacy query via Supabase RPC...', { 
            query: text.substring(0, 100),
            paramCount: params?.length || 0
        });

        // Convert parameterized query to Supabase format
        let supabaseQuery = text;
        if (params && params.length > 0) {
            params.forEach((param, index) => {
                const placeholder = `$${index + 1}`;
                let value: string;
                
                if (param === null || param === undefined) {
                    value = 'NULL';
                } else if (typeof param === 'string') {
                    value = `'${param.replace(/'/g, "''")}'`;
                } else if (typeof param === 'boolean') {
                    value = param ? 'TRUE' : 'FALSE';
                } else {
                    value = String(param);
                }
                
                supabaseQuery = supabaseQuery.replace(new RegExp(`\\${placeholder}\\b`, 'g'), value);
            });
        }

        console.log('📝 Converted query:', supabaseQuery.substring(0, 200));

        // Execute via Supabase RPC
        const { data, error } = await supabase.rpc('execute_sql', {
            sql_query: supabaseQuery
        });

        if (error) {
            // If RPC doesn't exist, fall back to manual query construction
            console.warn('RPC not available, attempting manual query execution...');
            
            // For simple SELECT queries, try to convert to Supabase API calls
            if (supabaseQuery.trim().toUpperCase().startsWith('SELECT')) {
                return await handleSelectQuery(supabaseQuery);
            }
            
            throw error;
        }

        // Transform Supabase RPC result to match pg QueryResult interface
        const result: QueryResult = {
            rows: data || [],
            rowCount: data?.length || 0,
            command: supabaseQuery.trim().split(' ')[0].toUpperCase(),
            oid: 0,
            fields: []
        };

        console.log('✅ Legacy query executed successfully', { 
            rowCount: result.rowCount,
            command: result.command 
        });

        return result;

    } catch (error) {
        console.error('❌ Legacy query execution failed:', error);
        throw error;
    }
};

// Helper function to handle simple SELECT queries manually
async function handleSelectQuery(sqlQuery: string): Promise<QueryResult> {
    // Basic parsing for simple queries - this is a fallback
    const upperQuery = sqlQuery.toUpperCase();
    
    if (upperQuery.includes('FROM DIM_PROJECT')) {
        const { data, error } = await supabase.from('dim_project').select('*');
        if (error) throw error;
        
        return {
            rows: data || [],
            rowCount: data?.length || 0,
            command: 'SELECT',
            oid: 0,
            fields: []
        };
    }
    
    if (upperQuery.includes('FROM DIM_USER')) {
        const { data, error } = await supabase.from('dim_user').select('*');
        if (error) throw error;
        
        return {
            rows: data || [],
            rowCount: data?.length || 0,
            command: 'SELECT',
            oid: 0,
            fields: []
        };
    }

    // For complex queries, we need manual conversion
    throw new Error('Complex query requires manual migration to repository pattern. Query: ' + sqlQuery.substring(0, 100));
}
