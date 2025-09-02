import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';

export async function GET() {
  try {
    console.log('📍 Count API called - fetching total projects from dim_project');
    
    // Direct COUNT query to dim_project table
    const { count, error } = await supabase
      .from('dim_project')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error counting projects:', error);
      throw error;
    }

    console.log(`✅ Total projects count: ${count}`);

    return NextResponse.json({
      count: count || 0
    });

  } catch (error) {
    console.error('❌ Error in count API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to count projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
