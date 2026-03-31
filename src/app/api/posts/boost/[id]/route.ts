export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

const BOOST_COST = parseFloat(process.env.BOOST_COST || '0.25');

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || !post.isActive) return NextResponse.json({ error: 'Post not found or inactive' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.usdcBalance < BOOST_COST) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { usdcBalance: { decrement: BOOST_COST }, totalSpent: { increment: BOOST_COST } }
      });

      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: { isBoosted: true, boostExpiry: expiryTime }
      });

      await tx.transaction.create({
        data: { userId: user.id, type: 'BOOST_PAID', amount: -BOOST_COST, postId: post.id }
      });

      // Notice: Treasury account handling logic goes here for true mainnet handling. 
      // In this demo, the float is just decremented.

      return updatedPost;
    });

    return NextResponse.json({ post: result });
  } catch (error) {
    console.error("Boost error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
