export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const boostCount = await prisma.transaction.count({
      where: { type: 'BOOST_PAID' }
    });
    
    // Formula: 5 * (2 ^ count)
    const currentBoostCost = 5 * Math.pow(2, boostCount);

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || !post.isActive) return NextResponse.json({ error: 'Post not found or inactive' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.usdcBalance < currentBoostCost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { usdcBalance: { decrement: currentBoostCost }, totalSpent: { increment: currentBoostCost } }
      });

      const updatedPost = await tx.post.update({
        where: { id: post.id },
        data: { isBoosted: true, boostExpiry: expiryTime }
      });

      await tx.transaction.create({
        data: { userId: user.id, type: 'BOOST_PAID', amount: -currentBoostCost, postId: post.id }
      });

      return updatedPost;
    });

    return NextResponse.json({ post: result });
  } catch (error) {
    console.error("Boost error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
