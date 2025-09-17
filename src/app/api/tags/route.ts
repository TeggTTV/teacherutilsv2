import { NextRequest, NextResponse } from 'next/server';
import { getTagsWithUsage } from '@/lib/tagUsage';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const tags = await getTagsWithUsage(limit);

        return NextResponse.json({
            success: true,
            tags
        });
    } catch (error) {
        console.error('Error fetching tags with usage:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch tags',
                success: false
            },
            { status: 500 }
        );
    }
}