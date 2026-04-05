import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { challengerPostId, challengedPostId } = await req.json();

    if (!challengerPostId || !challengedPostId) {
      return NextResponse.json({ error: 'Both post IDs are required' }, { status: 400 });
    }

    if (challengerPostId === challengedPostId) {
      return NextResponse.json({ error: 'A post cannot challenge itself' }, { status: 400 });
    }

    // Wrap in a transaction to ensure atomic checks and creation
    const match = await prisma.$transaction(async (tx) => {
      const challenger = await tx.post.findUnique({ where: { id: challengerPostId } });
      const challenged = await tx.post.findUnique({ where: { id: challengedPostId } });

      if (!challenger || !challenged) {
        throw new Error('One or both posts not found');
      }

      if (challenger.currentOwnerId !== session.userId) {
        throw new Error('You do not own the challenger post');
      }

      if (challenger.inVersusMatch || challenged.inVersusMatch) {
        throw new Error('One or both posts are already in a match');
      }

      const poolAmount = challenger.usdcAmountLocked + challenged.usdcAmountLocked;

      // Lock both posts from entering other matches
      await tx.post.update({ where: { id: challengerPostId }, data: { inVersusMatch: true } });
      await tx.post.update({ where: { id: challengedPostId }, data: { inVersusMatch: true } });

      // Create match (PENDING status)
      const newMatch = await tx.versusMatch.create({
        data: {
          post1Id: challengerPostId,
          post2Id: challengedPostId,
          status: 'PENDING',
          poolAmount,
        }
      });

      // Create a notification for the challenged owner
      if (challenged.currentOwnerId !== session.userId) {
        await tx.notification.create({
          data: {
            userId: challenged.currentOwnerId,
            type: 'VERSUS_CHALLENGE',
            message: `Your post was challenged to a Versus Match for a pool of ${poolAmount.toFixed(2)} USDC!`,
            postId: challengedPostId,
          }
        });
      }

      return newMatch;
    });

    return NextResponse.json({ match });
  } catch (error: any) {
    console.error("Versus challenge error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
