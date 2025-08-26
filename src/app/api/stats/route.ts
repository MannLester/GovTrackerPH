import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';

export async function GET() {
    try {
        console.log('📊 Fetching stats from dim_stats table...');
        
        const { data, error } = await supabase
            .from('dim_stats')
            .select('stats_id, title, value, description, icon')
            .order('title', { ascending: true });

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        console.log('📊 Stats query result:', {
            rowCount: data?.length || 0,
            data: data
        });

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        
        return NextResponse.json(
            { 
                error: 'Failed to fetch statistics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
