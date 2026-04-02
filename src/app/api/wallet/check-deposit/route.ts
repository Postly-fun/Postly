export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';
import { getUsdcBalance, getSolBalance, connection } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 1. Fetch current real-world on-chain balance
    const [currentOnChainBalance, currentSolBalance] = await Promise.all([
      getUsdcBalance(user.walletAddress),
      getSolBalance(user.walletAddress)
    ]);

    // 2. Calculate the difference since we last checked
    const depositDelta = currentOnChainBalance - user.lastOnChainBalance;

    // 3. Find latest signature if there's a deposit
    let latestTx = 'automated_sync';
    if (depositDelta > 0) {
      const owner = new PublicKey(user.walletAddress);
      const usdcMintAddress = process.env.USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const usdcMint = new PublicKey(usdcMintAddress);
      const ata = getAssociatedTokenAddressSync(usdcMint, owner);
      
      try {
        const signatures = await connection.getSignaturesForAddress(ata, { limit: 1 });
        latestTx = signatures[0]?.signature || 'automated_sync';
      } catch (e) {
        console.error("Sig fetch error:", e);
      }
    }

    // 4. Update the user's spending balance (only if deposit > 0) and always the on-chain checkpoint
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        lastOnChainBalance: currentOnChainBalance 
      };

      if (depositDelta > 0) {
        updateData.usdcBalance = { increment: depositDelta };
      }

      const u = await tx.user.update({
        where: { id: user.id },
        data: updateData
      });

      if (depositDelta > 0) {
        await tx.transaction.create({
          data: {
            userId: u.id,
            type: 'DEPOSIT',
            amount: depositDelta,
            txSignature: latestTx,
            note: `Mainnet Real Deposit confirmed via on-chain sync.`
          }
        });
      }
      return u;
    });

    return NextResponse.json({ 
      balance: updatedUser.usdcBalance,
      solBalance: currentSolBalance,
      deposited: Math.max(0, depositDelta),
      txSignature: latestTx,
      message: depositDelta > 0 ? 'Deposit found!' : 'No new deposits found.'
    });
  } catch (error) {
    console.error("Check deposit error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
