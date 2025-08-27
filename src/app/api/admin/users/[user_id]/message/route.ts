import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params
    const { message } = await request.json()

    if (!user_id || !message) {
      return NextResponse.json(
        { success: false, error: 'User ID and message are required' },
        { status: 400 }
      )
    }

    // Mock success response for testing
    console.log(`Would send message to user ${user_id}: ${message}`)
    
    return NextResponse.json({
      success: true,
      data: { 
        message: 'Message sent successfully',
        messageId: `temp_${Date.now()}`
      }
    })

  } catch (error) {
    console.error('Error in message API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
