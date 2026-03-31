export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id, isActive: true },
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true } },
        currentOwner: { select: { username: true, displayName: true, avatarUrl: true } },
        replies: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { username: true, displayName: true, avatarUrl: true } },
          }
        },
        stealHistory: {
          orderBy: { timestamp: 'desc' },
          include: {
            stealer: { select: { username: true, displayName: true, avatarUrl: true } },
            stolenFrom: { select: { username: true, displayName: true, avatarUrl: true } },
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Fetch post error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
