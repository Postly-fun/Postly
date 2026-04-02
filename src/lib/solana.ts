import { Keypair, PublicKey, Connection, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, getAccount, createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import crypto from 'crypto';

const MASTER_KEY = process.env.WALLET_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
export const connection = new Connection(RPC_URL, 'confirmed');

export async function getUsdcBalance(walletAddress: string): Promise<number> {
  try {
    const usdcMintAddress = process.env.USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const usdcMint = new PublicKey(usdcMintAddress);
    const owner = new PublicKey(walletAddress);
    const ata = getAssociatedTokenAddressSync(usdcMint, owner);
    const account = await getAccount(connection, ata);
    // USDC has 6 decimals on Mainnet
    return Number(account.amount) / 1_000_000;
  } catch (err) {
    // If account doesn't exist, balance is 0
    return 0;
  }
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  try {
    const owner = new PublicKey(walletAddress);
    const balance = await connection.getBalance(owner);
    return balance / 1_000_000_000; // SOL has 9 decimals
  } catch (err) {
    return 0;
  }
}

export async function transferUsdc(fromKeypair: Keypair, toAddress: string, amount: number): Promise<string> {
  const usdcMintAddress = process.env.USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  const usdcMint = new PublicKey(usdcMintAddress);
  const destOwner = new PublicKey(toAddress);
  const sourceOwner = fromKeypair.publicKey;

  const sourceAta = getAssociatedTokenAddressSync(usdcMint, sourceOwner);
  const destAta = getAssociatedTokenAddressSync(usdcMint, destOwner);

  const transaction = new Transaction();

  // Check if destination ATA exists
  try {
    await getAccount(connection, destAta);
  } catch (err: any) {
    // If ATA doesn't exist, add creation instruction
    if (err.name === 'TokenAccountNotFoundError' || err.name === 'TokenInvalidAccountOwnerError') {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sourceOwner,
          destAta,
          destOwner,
          usdcMint
        )
      );
    } else {
      throw err;
    }
  }

  // Add transfer instruction
  // 1,000,000 = 1 USDC
  const amountRaw = Math.floor(amount * 1_000_000);
  transaction.add(
    createTransferCheckedInstruction(
      sourceAta,
      usdcMint,
      destAta,
      sourceOwner,
      amountRaw,
      6
    )
  );

  return await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
}

export function generateWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toString(),
    privateKey: keypair.secretKey
  };
}

export function encryptPrivateKey(privateKeyBytes: Uint8Array): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(MASTER_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(privateKeyBytes), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptPrivateKey(stored: string): Uint8Array {
  const [ivHex, authTagHex, encryptedHex] = stored.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(MASTER_KEY, 'hex'), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    const pubKey = new PublicKey(address);
    return PublicKey.isOnCurve(pubKey.toBytes());
  } catch (err) {
    return false;
  }
}

