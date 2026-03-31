export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';
import { decryptPrivateKey } from '@/lib/solana';
import bs58 from 'bs58';

export async function GET(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { encryptedPrivateKey: true }
    });

    if (!user || !user.encryptedPrivateKey) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const privateKeyBytes = decryptPrivateKey(user.encryptedPrivateKey);
    const privateKeyBase58 = bs58.encode(Buffer.from(privateKeyBytes));

    return NextResponse.json({ privateKey: privateKeyBase58 });
  } catch (error) {
    console.error("Wallet EXPORT error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
