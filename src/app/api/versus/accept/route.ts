import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { matchId } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    const match = await prisma.$transaction(async (tx) => {
      const match = await tx.versusMatch.findUnique({
        where: { id: matchId },
        include: { post1: true, post2: true }
      });

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.status !== 'PENDING') {
        throw new Error('Match is not pending');
      }

      if (match.post2.currentOwnerId !== session.userId) {
        throw new Error('You do not own the challenged post');
      }

      // Start 24h timer
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const updatedMatch = await tx.versusMatch.update({
        where: { id: matchId },
        data: {
          status: 'ACTIVE',
          expiresAt,
        }
      });

      // Notification to challenger
      await tx.notification.create({
        data: {
          userId: match.post1.currentOwnerId,
          type: 'VERSUS_ACCEPTED',
          message: `Your Versus Challenge was accepted! The 24-hour battle has begun.`,
          postId: match.post1Id,
        }
      });

      return updatedMatch;
    });

    return NextResponse.json({ match });
  } catch (error: any) {
    console.error("Versus accept error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
