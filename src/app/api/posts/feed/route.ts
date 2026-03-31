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
        author: { select: { username: true, displayName: true, avatarUrl: true } },
        currentOwner: { select: { username: true, displayName: true, avatarUrl: true } },
      }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
