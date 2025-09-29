import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { feedback, userId } = await request.json();
    if (!feedback || typeof feedback !== 'string' || feedback.length < 3) {
      return NextResponse.json({ error: 'Invalid feedback.' }, { status: 400 });
    }
    const saved = await prisma.feedback.create({
      data: {
        feedback,
        userId: userId || null,
      },
    });
    return NextResponse.json({ success: true, feedback: saved });
  } catch {
    return NextResponse.json({ error: 'Failed to save feedback.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ feedbacks });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch feedbacks.' }, { status: 500 });
  }
}
