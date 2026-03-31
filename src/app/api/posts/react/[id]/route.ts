export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { emoji } = await req.json();
    if (!emoji) return NextResponse.json({ error: 'Missing emoji' }, { status: 400 });

    const postId = params.id;

    // Toggle logic: If reaction exists, remove it. Otherwise, add it.
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_postId_emoji: {
          userId: session.userId,
          postId,
          emoji,
        }
      }
    });

    if (existing) {
      await prisma.reaction.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ status: 'removed' });
    } else {
      await prisma.reaction.create({
        data: {
          userId: session.userId,
          postId,
          emoji,
        }
      });
      return NextResponse.json({ status: 'added' });
    }
  } catch (error) {
    console.error("Reaction error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
