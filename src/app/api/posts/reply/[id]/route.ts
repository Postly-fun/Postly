export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

const REPLY_COST = parseFloat(process.env.REPLY_COST || '0.05');

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content } = await req.json();
    if (!content || content.length > 280) return NextResponse.json({ error: 'Invalid content' }, { status: 400 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || !post.isActive) return NextResponse.json({ error: 'Post not found or inactive' }, { status: 404 });

    const replier = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!replier || replier.usdcBalance < REPLY_COST) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: replier.id },
        data: { usdcBalance: { decrement: REPLY_COST }, totalSpent: { increment: REPLY_COST } }
      });

      if (post.currentOwnerId !== replier.id) {
         await tx.user.update({
           where: { id: post.currentOwnerId },
           data: { usdcBalance: { increment: REPLY_COST }, totalEarned: { increment: REPLY_COST } }
         });

         await tx.transaction.create({
           data: { userId: post.currentOwnerId, type: 'REPLY_EARNED', amount: REPLY_COST, postId: post.id }
         });

         await tx.notification.create({
            data: { userId: post.currentOwnerId, type: 'REPLY', message: `${replier.displayName} replied to your post - you earned ${REPLY_COST} USDC`, postId: post.id }
         });
      }

      const newReply = await tx.reply.create({
        data: {
          content,
          usdcCost: REPLY_COST,
          postId: post.id,
          authorId: replier.id,
        }
      });

      await tx.post.update({
         where: { id: post.id },
         data: { replyCount: { increment: 1 } }
      });

      await tx.transaction.create({
        data: { userId: replier.id, type: 'REPLY_PAID', amount: -REPLY_COST, postId: post.id }
      });

      return newReply;
    });

    return NextResponse.json({ reply: result });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
