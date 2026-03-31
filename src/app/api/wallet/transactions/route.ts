export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const txs = await prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        post: { select: { content: true } }
      }
    });

    return NextResponse.json({ transactions: txs });
  } catch (error) {
    console.error("Transactions error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
