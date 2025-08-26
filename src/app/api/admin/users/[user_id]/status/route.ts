import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params
    const { status } = await request.json()

    if (!user_id || !status) {
      return NextResponse.json(
        { success: false, error: 'User ID and status are required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Updating user ${user_id} to status ${status}`)

    // Update user status in database
    // For now, we'll update the status_id directly since we don't have a dim_status lookup table set up
    const { data, error } = await supabase
      .from('dim_user')
      .update({ 
        status_id: status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error updating status:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully updated user ${user_id} to status ${status}`)

    return NextResponse.json({
      success: true,
      data: { user: data }
    })

  } catch (error) {
    console.error('❌ Error in status update API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
