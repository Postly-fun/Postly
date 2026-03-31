export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateWallet, encryptPrivateKey } from '@/lib/solana';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, username, displayName, password, xHandle, telegramHandle } = await req.json();

    if (!email || !username || !password || !displayName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const wallet = generateWallet();
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        passwordHash,
        walletAddress: wallet.publicKey,
        encryptedPrivateKey,
        xHandle,
        telegramHandle,
        usdcBalance: 0, 
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        walletAddress: true,
        usdcBalance: true,
        xHandle: true,
        telegramHandle: true,
      }
    });

    const token = signToken({ userId: user.id, username: user.username });
    await setAuthCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
