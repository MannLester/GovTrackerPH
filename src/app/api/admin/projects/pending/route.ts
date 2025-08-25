import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/config';
import { authenticateUser, requireAdmin } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
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

        const result = await query(`
            SELECT 
                p.*,
                s.status_name,
                l.region,
                l.city,
                u.first_name || ' ' || u.last_name as created_by_name
            FROM dim_project p
            LEFT JOIN dim_status s ON p.status_id = s.status_id
            LEFT JOIN dim_location l ON p.location_id = l.location_id
            LEFT JOIN dim_user u ON p.created_by = u.user_id
            WHERE s.status_name = 'Under Review'
            ORDER BY p.created_at ASC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching pending projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending projects' },
            { status: 500 }
        );
    }
}
