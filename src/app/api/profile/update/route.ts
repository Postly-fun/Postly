export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { displayName, bio, email, password, avatarUrl, xHandle, telegramHandle } = await req.json();

    const data: any = {};
    if (displayName) data.displayName = displayName;
    if (bio !== undefined) data.bio = bio;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (xHandle !== undefined) data.xHandle = xHandle;
    if (telegramHandle !== undefined) data.telegramHandle = telegramHandle;
    
    if (email) {
      // Check if email is already taken by another user
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== session.userId) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      data.email = email;
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        xHandle: true,
        telegramHandle: true,
        usdcBalance: true,
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile UPDATE error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
