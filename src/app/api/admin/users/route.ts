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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE u.user_id IS NOT NULL';
        const queryParams: unknown[] = [];
        let paramCount = 0;

        if (role) {
            paramCount++;
            whereClause += ` AND u.role = $${paramCount}`;
            queryParams.push(role);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        paramCount++;
        const limitParam = paramCount;
        paramCount++;
        const offsetParam = paramCount;
        queryParams.push(limit, offset);

        const usersQuery = `
            SELECT 
                u.*,
                s.status_name,
                COUNT(DISTINCT p.project_id) as projects_created,
                COUNT(DISTINCT c.comment_id) as comments_made,
                COUNT(DISTINCT pl.like_id) as projects_liked
            FROM dim_user u
            LEFT JOIN dim_status s ON u.status_id = s.status_id
            LEFT JOIN dim_project p ON u.user_id = p.created_by
            LEFT JOIN dim_comment c ON u.user_id = c.user_id AND c.is_deleted = FALSE
            LEFT JOIN fact_project_likes pl ON u.user_id = pl.user_id
            ${whereClause}
            GROUP BY u.user_id, s.status_name
            ORDER BY u.created_at DESC
            LIMIT $${limitParam} OFFSET $${offsetParam}
        `;

        const result = await query(usersQuery, queryParams);

        // Get total count
        const countQuery = `
            SELECT COUNT(*) 
            FROM dim_user u
            ${whereClause}
        `;
        const countResult = await query(countQuery, queryParams.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].count);

        return NextResponse.json({
            success: true,
            data: {
                users: result.rows,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
