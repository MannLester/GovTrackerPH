import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';

export async function GET(request: NextRequest) {
    try {
        console.log('👥 Fetching users from database...');
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        // Build the query with status join
        let query = supabase
            .from('dim_user')
            .select(`
                user_id,
                first_name,
                last_name,
                email,
                username,
                profile_picture,
                role,
                is_active,
                status_id,
                created_at,
                updated_at,
                dim_status!inner(
                    status_name
                )
            `)
            .order('created_at', { ascending: false });

        // Add filters
        if (role) {
            query = query.eq('role', role);
        }

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Add pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: users, error, count } = await query;

        if (error) {
            console.error('❌ Database error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch users from database' },
                { status: 500 }
            );
        }

        console.log(`✅ Successfully fetched ${users?.length || 0} users from database`);

        return NextResponse.json({
            success: true,
            data: {
                users: users || [],
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil((count || 0) / limit),
                    totalCount: count || 0,
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
