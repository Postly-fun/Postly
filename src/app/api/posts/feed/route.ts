export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'for-you'; // 'for-you', 'trending', 'most-stolen'

    let orderBy: any = [{ isBoosted: 'desc' }, { createdAt: 'desc' }];
    
    if (tab === 'trending' || tab === 'most-stolen') {
      orderBy = [{ stolenCount: 'desc' }, { createdAt: 'desc' }];
    }

    const posts = await prisma.post.findMany({
      where: { isActive: true },
      orderBy,
      take: 50,
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true, xHandle: true } },
        currentOwner: { select: { username: true, displayName: true, avatarUrl: true } },
        _count: {
          select: { reactions: true }
        }
      }
    });

    const postsWithReactions = await Promise.all(posts.map(async (post) => {
      const reactionGroups = await prisma.reaction.groupBy({
        by: ['emoji'],
        where: { postId: post.id },
        _count: true
      });

      return {
        ...post,
        reactions: reactionGroups.map(group => ({
          emoji: group.emoji,
          count: group._count
        }))
      };
    }));

    return NextResponse.json({ posts: postsWithReactions });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
