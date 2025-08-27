import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/database/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params
    const { role } = await request.json()

    if (!user_id || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['citizen', 'personnel', 'admin', 'super-admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    console.log(`🔄 Updating user ${user_id} to role ${role}`)

    // Update user role in database
    const { data, error } = await supabase
      .from('dim_user')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error updating role:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully updated user ${user_id} to role ${role}`)

    return NextResponse.json({
      success: true,
      data: { user: data }
    })

  } catch (error) {
    console.error('❌ Error in role update API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
