import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params
    const { status } = await request.json()

    console.log(`🔄 Status update request for user ${user_id} with status: ${status}`)

    if (!user_id || !status) {
      console.error('❌ Missing required fields:', { user_id, status })
      return NextResponse.json(
        { success: false, error: 'User ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status values
    const validStatuses = ['Active', 'Banned', 'Suspended']
    if (!validStatuses.includes(status)) {
      console.error('❌ Invalid status value:', status)
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    console.log(`🔄 Updating user ${user_id} to status ${status}`)

    // First, find the status record in dim_status table to get the UUID
    const { data: statusRecord, error: statusError } = await supabase
      .from('dim_status')
      .select('status_id')
      .eq('status_name', status)
      .single()

    if (statusError) {
      console.error('❌ Error finding status record:', statusError)
      return NextResponse.json(
        { success: false, error: `Status '${status}' not found in database` },
        { status: 400 }
      )
    }

    if (!statusRecord) {
      console.error('❌ Status not found:', status)
      return NextResponse.json(
        { success: false, error: `Status '${status}' does not exist` },
        { status: 400 }
      )
    }

    console.log(`📝 Found status record:`, statusRecord)
    const statusId = statusRecord.status_id

    // Update user status with the UUID from dim_status
    const { data, error } = await supabase
      .from('dim_user')
      .update({ 
        status_id: statusId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error updating status:', error)
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('❌ No data returned from update operation')
      return NextResponse.json(
        { success: false, error: 'User not found or update failed' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully updated user ${user_id} to status ${status}`)
    console.log(`✅ Updated user data:`, data)

    return NextResponse.json({
      success: true,
      data: { 
        user: data,
        status_name: status // Include the status name for frontend update
      }
    })

  } catch (error) {
    console.error('❌ Error in status update API:', error)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
