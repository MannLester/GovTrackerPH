import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { authenticateUser, requireAdmin } from '@/lib/auth/config';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        if (!requireAdmin(auth.user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { role } = body;

        const validRoles = ['citizen', 'admin', 'personnel', 'super-admin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        const result = await query(`
            UPDATE dim_user 
            SET role = $1, updated_at = NOW()
            WHERE user_id = $2
            RETURNING *
        `, [role, id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}
