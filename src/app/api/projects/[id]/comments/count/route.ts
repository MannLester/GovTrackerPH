import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`📍 Fetching comment count for project ID: ${id}`);

    // Direct COUNT query to dim_comment table for this project
    const { count, error } = await supabase
      .from('dim_comment')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    if (error) {
      console.error('❌ Error counting comments:', error);
      throw error;
    }

    console.log(`✅ Comment count for project ${id}: ${count}`);

    return NextResponse.json({
      count: count || 0
    });

  } catch (error) {
    console.error('❌ Error in comment count API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to count comments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
