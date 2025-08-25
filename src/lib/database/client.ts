import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create the Supabase client with proper configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test the connection
export const testConnection = async (): Promise<boolean> => {
    try {
        const { error } = await supabase.from('dim_project').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('🔴 Supabase connection test failed:', error.message);
            return false;
        }
        
        console.log('🟢 Supabase connection successful');
        return true;
    } catch (error) {
        console.error('🔴 Supabase connection test error:', error);
        return false;
    }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown, operation: string) => {
    const supabaseError = error as { message?: string; details?: string; hint?: string; code?: string };
    
    console.error(`❌ Supabase ${operation} error:`, {
        message: supabaseError?.message || 'Unknown error',
        details: supabaseError?.details || 'No details available',
        hint: supabaseError?.hint || 'No hint available',
        code: supabaseError?.code || 'No error code'
    });
    
    // Return a standardized error format
    return {
        success: false,
        error: supabaseError?.message || 'Database operation failed',
        code: supabaseError?.code || 'UNKNOWN_ERROR'
    };
};
