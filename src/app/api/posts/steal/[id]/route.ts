export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || !post.isActive) return NextResponse.json({ error: 'Post not found or inactive' }, { status: 404 });

    if (post.currentOwnerId === session.userId) {
      return NextResponse.json({ error: 'Cannot steal your own post' }, { status: 400 });
    }

    const stealer = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!stealer || stealer.usdcBalance < post.stealPrice) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const stealCost = post.stealPrice;
    const newStealPrice = stealCost * 2;
    const oldOwnerId = post.currentOwnerId;

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: stealer.id },
        data: { 
          usdcBalance: { decrement: stealCost },
          totalSpent: { increment: stealCost }
        }
      });

      await tx.user.update({
        where: { id: oldOwnerId },
        data: { 
          usdcBalance: { increment: stealCost },
          totalEarned: { increment: stealCost }
        }
      });

      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: {
          currentOwnerId: stealer.id,
          usdcAmountLocked: stealCost,
          stealPrice: newStealPrice,
          stolenCount: { increment: 1 },
        }
      });

      await tx.stealHistory.create({
        data: {
          postId: post.id,
          stealerId: stealer.id,
          stolenFromId: oldOwnerId,
          amountPaid: stealCost,
        }
      });

      await tx.transaction.create({
        data: { userId: stealer.id, type: 'POST_STOLEN_PAID', amount: -stealCost, postId: post.id }
      });
      await tx.transaction.create({
        data: { userId: oldOwnerId, type: 'POST_STOLEN_EARNED', amount: stealCost, postId: post.id }
      });

      const stealerProfile = await tx.user.findUnique({ where: { id: stealer.id } });
      
      await tx.notification.create({
        data: {
          userId: oldOwnerId,
          type: 'STOLEN',
          message: `${stealerProfile?.displayName || 'Someone'} stole your post for ${stealCost} USDC!`,
          postId: post.id,
        }
      });

      return updatedPost;
    });

    return NextResponse.json({ post: result });

  } catch (error) {
    console.error("Steal error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
