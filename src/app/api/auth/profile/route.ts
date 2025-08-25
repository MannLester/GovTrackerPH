import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
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
            data: auth.user
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        return NextResponse.json(
            { error: 'Failed to get profile' },
            { status: 500 }
        );
    }
}
