export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'posts'; // 'posts', 'replies', 'owned'

    const user = await prisma.user.findUnique({ where: { username: params.username } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let content: any[] = [];
    if (tab === 'posts') {
      content = await prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } }, currentOwner: { select: { username: true, displayName: true, avatarUrl: true } } }
      });
    } else if (tab === 'owned') {
      content = await prisma.post.findMany({
        where: { currentOwnerId: user.id, authorId: { not: user.id } },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } }, currentOwner: { select: { username: true, displayName: true, avatarUrl: true } } }
      });
    } else if (tab === 'replies') {
      content = await prisma.reply.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { post: { include: { author: { select: { username: true, displayName: true, avatarUrl: true } } } }, author: { select: { username: true, displayName: true, avatarUrl: true } } }
      });
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
