export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const boostCount = await prisma.transaction.count({
      where: { type: 'BOOST_PAID' }
    });

    // Formula: 5 * (2 ^ boostCount)
    const currentPrice = 5 * Math.pow(2, boostCount);

    return NextResponse.json({ 
      boostCount,
      currentPrice 
    });
  } catch (error) {
    console.error("Fetch boost price error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
