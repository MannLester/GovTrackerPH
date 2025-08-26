import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                user: auth.user
            }
        });
    } catch (error) {
        console.error('Error verifying user:', error);
        return NextResponse.json(
            { error: 'Failed to verify user' },
            { status: 500 }
        );
    }
}
