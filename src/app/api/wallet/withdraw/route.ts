export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';
import { decryptPrivateKey, transferUsdc, isValidSolanaAddress } from '@/lib/solana';
import { Keypair } from '@solana/web3.js';

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { toAddress, amount } = await req.json();

    if (!toAddress || !isValidSolanaAddress(toAddress)) {
      return NextResponse.json({ error: 'Invalid destination address' }, { status: 400 });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.usdcBalance < withdrawAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 1. Decrypt private key
    const privateKeyBytes = decryptPrivateKey(user.encryptedPrivateKey);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);

    // 2. Perform on-chain transfer
    // Note: This will fail if the user doesn't have enough SOL for gas
    let signature;
    try {
      signature = await transferUsdc(keypair, toAddress, withdrawAmount);
    } catch (err: any) {
      console.error("Withdrawal transfer error:", err);
      // Commonly: insufficient SOL for fees
      if (err.message?.includes('0x1')) {
        return NextResponse.json({ error: 'Insufficient SOL in wallet for transaction fees (gas).' }, { status: 400 });
      }
      return NextResponse.json({ error: `Blockchain error: ${err.message}` }, { status: 500 });
    }

    // 3. Update database
    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: { 
          usdcBalance: { decrement: withdrawAmount },
          lastOnChainBalance: { decrement: withdrawAmount } // Keep checkpoint accurate
        }
      });

      await tx.transaction.create({
        data: {
          userId: u.id,
          type: 'WITHDRAWAL',
          amount: -withdrawAmount,
          txSignature: signature,
          note: `Withdrawal to ${toAddress}`
        }
      });
      return u;
    });

    return NextResponse.json({ 
      success: true, 
      signature, 
      balance: updatedUser.usdcBalance 
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
