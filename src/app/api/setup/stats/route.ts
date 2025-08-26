import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/client';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
    try {
        console.log('🔧 Creating sample stats data...');
        
        const statsData = [
            {
                stats_id: uuidv4(),
                title: 'Total Projects',
                value: 1247,
                description: 'Across all regions',
                icon: 'building2'
            },
            {
                stats_id: uuidv4(),
                title: 'In Progress',
                value: 342,
                description: 'Currently being built',
                icon: 'clock'
            },
            {
                stats_id: uuidv4(),
                title: 'Completed',
                value: 905,
                description: 'Successfully finished',
                icon: 'check-circle'
            },
            {
                stats_id: uuidv4(),
                title: 'Provinces',
                value: 81,
                description: 'With active projects',
                icon: 'map-pin'
            }
        ];

        const { data, error } = await supabase
            .from('dim_stats')
            .insert(statsData)
            .select();

        if (error) {
            console.error('❌ Error creating stats:', error);
            throw error;
        }

        console.log('✅ Created stats successfully:', data);

        return NextResponse.json({
            success: true,
            message: 'Sample stats data created successfully',
            data: data
        });
    } catch (error) {
        console.error('❌ Error creating stats:', error);
        
        return NextResponse.json(
            { 
                error: 'Failed to create stats data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
