import { NextRequest, NextResponse } from 'next/server';
import { CommentsRepository } from '@/lib/database/repositories/comments';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: 'Project ID is required' },
                { status: 400 }
            );
        }

        console.log(`📍 Fetching comments for project: ${projectId}`);

        const commentsRepository = new CommentsRepository();
        const result = await commentsRepository.getComments({
            project_id: projectId,
            page,
            limit,
            sort: 'created_at',
            order: 'DESC'
        });

        console.log(`✅ Successfully fetched ${result.data.length} comments`);

        return NextResponse.json({
            success: true,
            data: {
                comments: result.data,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages
                }
            }
        });

    } catch (error) {
        console.error('❌ Error in GET /api/comments:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch comments'
            },
            { status: 500 }
        );
    }
}

/*
export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateUser(request);
        
        if (auth.error || !auth.user) {
            return NextResponse.json(
                { success: false, error: auth.error || 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { projectId, content, parent_comment_id } = body;

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: 'Project ID is required' },
                { status: 400 }
            );
        }

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Comment content is required' },
                { status: 400 }
            );
        }

        console.log(`📍 Creating comment for project: ${projectId}`);

        const commentsRepository = new CommentsRepository();
        const newComment = await commentsRepository.createComment(
            projectId,
            auth.user.user_id,
            content.trim(),
            parent_comment_id || undefined
        );

        console.log(`✅ Successfully created comment: ${newComment.comment_id}`);

        return NextResponse.json({
            success: true,
            data: newComment
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Error in POST /api/comments:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to create comment'
            },
            { status: 500 }
        );
    }
}
*/
