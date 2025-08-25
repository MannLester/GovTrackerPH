import { NextRequest, NextResponse } from 'next/server';
import { projectsRepository, testConnection } from '@/lib/database/config';

export async function GET(request: NextRequest) {
    try {
        console.log('📍 Projects API called');

        // Test database connection first
        const isConnected = await testConnection();
        if (!isConnected) {
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 503 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        
        const filters = {
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '10'),
            status: searchParams.get('status') || undefined,
            region: searchParams.get('region') || undefined,
            search: searchParams.get('search') || undefined,
            sort: searchParams.get('sort') || 'created_at',
            order: (searchParams.get('order') || 'DESC') as 'ASC' | 'DESC'
        };

        console.log('📍 Query params:', filters);

        // Fetch projects using the repository
        const result = await projectsRepository.getProjects(filters);

        console.log(`✅ API returning ${result.data.length} projects (${result.totalCount} total)`);

        return NextResponse.json({
            projects: result.data,
            totalCount: result.totalCount,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        });

    } catch (error) {
        console.error('❌ Error fetching projects:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });

        return NextResponse.json(
            { 
                error: 'Failed to fetch projects',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
