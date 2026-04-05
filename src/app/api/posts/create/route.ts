export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

const MIN_POST_COST = parseFloat(process.env.MIN_POST_COST || '0.1');

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content, usdcAmount, voiceUrl, voiceDuration } = await req.json();

    if (!content && !voiceUrl) {
      return NextResponse.json({ error: 'Post must have content or a voice message' }, { status: 400 });
    }

    if (usdcAmount < MIN_POST_COST) {
      return NextResponse.json({ error: 'Invalid post cost' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.usdcBalance < usdcAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const post = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { 
          usdcBalance: { decrement: usdcAmount },
          totalSpent: { increment: usdcAmount }
        }
      });

      const newPost = await tx.post.create({
        data: {
          content: content || 'Voice Message',
          authorId: user.id,
          currentOwnerId: user.id,
          usdcAmountLocked: usdcAmount,
          stealPrice: usdcAmount * 2,
          isBoosted: false,
          stolenCount: 0,
          voiceUrl,
          voiceDuration,
        }
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'POST_CREATED',
          amount: -usdcAmount,
          postId: newPost.id,
        }
      });

      return newPost;
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post create error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
