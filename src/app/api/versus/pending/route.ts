import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pendingMatches = await prisma.versusMatch.findMany({
      where: {
        status: 'PENDING',
        post2: {
          currentOwnerId: session.userId
        }
      },
      include: {
        post1: {
          include: {
            currentOwner: { select: { username: true, avatarUrl: true } }
          }
        },
        post2: true
      }
    });

    return NextResponse.json({ matches: pendingMatches });
  } catch (error) {
    console.error("Versus pending fetch error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
