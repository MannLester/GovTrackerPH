import { NextRequest, NextResponse } from 'next/server';
import { projectsRepository } from '@/lib/database/config';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`📍 Fetching project details for ID: ${id}`);

        // Use the repository to get the project
        const project = await projectsRepository.getProjectById(id);

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        console.log(`✅ Successfully fetched project: ${project.title}`);

        return NextResponse.json({
            project: project
        });

    } catch (error) {
        console.error('❌ Error fetching project:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch project',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
