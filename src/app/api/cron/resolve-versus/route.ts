import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This endpoint could be secured with a CRON_SECRET token
export async function GET(req: Request) {
  try {
    const now = new Date();
    
    // Find expired active matches
    const expiredMatches = await prisma.versusMatch.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: now
        }
      },
      include: {
        post1: true,
        post2: true,
      }
    });

    if (expiredMatches.length === 0) {
      return NextResponse.json({ message: 'No matches to resolve' });
    }

    const resolvedIds = [];

    for (const match of expiredMatches) {
      await prisma.$transaction(async (tx) => {
        const p1Earnings = match.post1.totalEarnings;
        const p2Earnings = match.post2.totalEarnings;

        let winnerUserId: string = "";
        let winnerPostId: string = "";

        // Determine Winner based on totalEarnings
        if (p1Earnings > p2Earnings) {
          winnerUserId = match.post1.currentOwnerId;
          winnerPostId = match.post1Id;
        } else if (p2Earnings > p1Earnings) {
          winnerUserId = match.post2.currentOwnerId;
          winnerPostId = match.post2Id;
        } else {
          // Tiebreaker: random for now, or could split the pool
          // We will flip a coin to decide who won if it's an exact tie.
          const p1Wins = Math.random() > 0.5;
          winnerUserId = p1Wins ? match.post1.currentOwnerId : match.post2.currentOwnerId;
          winnerPostId = p1Wins ? match.post1Id : match.post2Id;
        }

        // Award pool to winner
        await tx.user.update({
          where: { id: winnerUserId },
          data: {
            usdcBalance: { increment: match.poolAmount },
            totalEarned: { increment: match.poolAmount }
          }
        });

        // Record the transaction
        await tx.transaction.create({
          data: {
            userId: winnerUserId,
            type: 'VERSUS_WIN_POOL',
            amount: match.poolAmount,
            note: `Won Versus match pool`,
            postId: winnerPostId,
          }
        });

        // Update match status
        await tx.versusMatch.update({
          where: { id: match.id },
          data: {
            status: 'COMPLETED',
            winnerId: winnerUserId,
          }
        });

        // Free up the posts
        await tx.post.update({ where: { id: match.post1Id }, data: { inVersusMatch: false } });
        await tx.post.update({ where: { id: match.post2Id }, data: { inVersusMatch: false } });

        // Notify both
        await tx.notification.create({
          data: {
            userId: match.post1.currentOwnerId,
            type: 'VERSUS_COMPLETED',
            message: winnerUserId === match.post1.currentOwnerId 
              ? `You WON the Versus match and earned ${match.poolAmount.toFixed(2)} USDC!` 
              : `You LOST the Versus match to a stronger post.`,
            postId: match.post1Id,
          }
        });

        if (match.post1.currentOwnerId !== match.post2.currentOwnerId) {
          await tx.notification.create({
            data: {
              userId: match.post2.currentOwnerId,
              type: 'VERSUS_COMPLETED',
              message: winnerUserId === match.post2.currentOwnerId 
                ? `You WON the Versus match and earned ${match.poolAmount.toFixed(2)} USDC!` 
                : `You LOST the Versus match to a stronger post.`,
              postId: match.post2Id,
            }
          });
        }
      });

      resolvedIds.push(match.id);
    }

    return NextResponse.json({ message: `Resolved ${resolvedIds.length} matches`, resolvedIds });
  } catch (error: any) {
    console.error("Cron resolve error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
