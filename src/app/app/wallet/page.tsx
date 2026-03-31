'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, RefreshCw, ArrowUpRight, ArrowDownLeft, Wallet, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { formatDistanceToNow } from 'date-fns';

export default function WalletPage() {
  const { user, setUser } = useStore();
  const queryClient = useQueryClient();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isExportLoading, setIsExportLoading] = useState(false);

  const { data: txData, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/transactions');
      return res.json();
    }
  });

  const checkDepositMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/wallet/check-deposit', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.deposited > 0) {
        toast.success(`Deposit confirmed! ${data.deposited} USDC added to your balance.`);
      } else {
        toast.info(data.message || 'No new deposits found.');
      }
      if (user) setUser({ ...user, usdcBalance: data.balance });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const fetchPrivateKey = async () => {
    setIsExportLoading(true);
    try {
      const res = await fetch('/api/wallet/export');
      const data = await res.json();
      if (data.privateKey) {
        setPrivateKey(data.privateKey);
      } else {
        toast.error(data.error || 'Failed to export private key');
      }
    } catch (err) {
      toast.error('Failed to export private key');
    } finally {
      setIsExportLoading(false);
    }
  };

  const copyPrivateKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
      toast.success('Private key copied! Do NOT share this with anyone.');
    }
  };

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast.success('Address copied to clipboard');
    }
  };

  if (!user) return null;

  return (
    <div className="w-full flex-1 md:border-r border-purple-100/30 min-h-screen bg-transparent pb-20">
      <div className="sticky top-0 bg-white/40 backdrop-blur-md z-10 border-b border-purple-100/30 flex items-center h-[52px] px-4">
        <h1 className="text-xl font-bold font-sans">Wallet Dashboard</h1>
      </div>

      <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl m-4 shadow-xl shadow-purple-500/20">
        <div className="flex items-center gap-2 mb-8 opacity-80">
          <Wallet className="w-5 h-5" />
          <span className="font-medium text-purple-100">Custodial USDC Balance</span>
        </div>
        
        <h2 className="text-5xl geist-mono font-bold mb-2">{user.usdcBalance.toFixed(2)}</h2>
        <p className="text-purple-200 mb-8">≈ ${(user.usdcBalance).toFixed(2)} USD</p>

        <div className="flex gap-4">
          <Button 
            onClick={() => setDepositModalOpen(true)}
            className="flex-1 bg-white text-purple-700 hover:bg-gray-100 rounded-full py-6 font-bold text-lg shadow-lg shadow-white/10"
          >
            <ArrowDownLeft className="mr-2" /> Deposit
          </Button>
          <Button 
            onClick={() => setExportModalOpen(true)}
            className="flex-1 border-white/30 hover:bg-white/10 text-white hover:text-white rounded-full py-6 font-bold text-lg"
          >
            <ArrowUpRight className="mr-2" /> Export Key
          </Button>
        </div>
      </div>


      {/* Deposit Flow Block */}
      <div className="m-4 p-8 border border-purple-100/30 rounded-2xl bg-white/40 backdrop-blur-sm flex flex-col items-center">
         <h3 className="font-bold text-xl mb-2 text-gray-900">Your Deposit Address</h3>
         <p className="text-sm text-gray-500 text-center mb-8 max-w-sm">Send ONLY USDC on the Solana network to this address. Using any other token or network will result in permanent loss.</p>
         
         <div className="bg-white p-5 rounded-2xl border border-purple-100/50 mb-8 w-52 h-52 flex items-center justify-center shadow-inner">
             <QRCode value={user.walletAddress} size={180} />
         </div>

         <div className="w-full relative group max-w-md">
           <input 
             readOnly
             value={user.walletAddress}
             className="w-full geist-mono text-center text-sm p-4 rounded-xl bg-purple-50/50 text-purple-900 border border-purple-100 focus:outline-none cursor-pointer hover:bg-purple-50 transition-colors"
             onClick={copyAddress}
           />
           <button onClick={copyAddress} className="absolute right-3 top-3.5 text-purple-400 p-1 hover:bg-purple-100 hover:text-purple-600 rounded transition-colors">
             <Copy className="w-4 h-4" />
           </button>
         </div>

         <Button 
            onClick={() => checkDepositMutation.mutate()} 
            disabled={checkDepositMutation.isPending}
            className="w-full mt-8 bg-purple-600 text-white hover:bg-purple-700 rounded-xl h-12 shadow-lg shadow-purple-500/20"
         >
            <RefreshCw className={`w-4 h-4 mr-2 ${checkDepositMutation.isPending ? 'animate-spin' : ''}`} /> 
            {checkDepositMutation.isPending ? 'Checking network...' : 'Check for Deposits'}
         </Button>
      </div>

      <div className="m-4">
         <h3 className="font-bold text-lg mb-4 text-gray-900 px-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-purple-500" />
            Transaction History
         </h3>
         {isLoading ? (
            <div className="text-gray-500 text-center py-8 bg-white/40 rounded-2xl border border-purple-100/30">
               <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-20" />
               Loading history...
            </div>
         ) : txData?.transactions?.length === 0 ? (
            <div className="text-gray-500 text-center py-8 border border-purple-100/30 rounded-2xl bg-white/40">No transactions found yet.</div>
         ) : (
            <div className="flex flex-col gap-2">
               {txData?.transactions?.map((tx: any) => {
                 const isPositive = tx.amount > 0;
                 return (
                   <div key={tx.id} className="flex justify-between items-center p-4 bg-white/60 backdrop-blur-sm border border-purple-100/30 rounded-2xl hover:bg-white transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 capitalize text-sm">{tx.type.replace(/_/g, ' ').toLowerCase()}</span>
                          <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(tx.createdAt))} ago</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                        <span className={`geist-mono font-bold ${isPositive ? 'text-green-600' : 'text-gray-900'}`}>
                          {isPositive ? '+' : ''}{tx.amount.toFixed(2)} USDC
                        </span>
                        {tx.txSignature && (
                          <a 
                            href={`https://solscan.io/tx/${tx.txSignature}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-purple-400 hover:text-purple-600 flex items-center gap-1"
                          >
                            TX <ExternalLink className="w-2 h-2" />
                          </a>
                        )}
                     </div>
                   </div>
                 );
               })}
            </div>
         )}
      </div>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={(open) => {
        setExportModalOpen(open);
        if (!open) setPrivateKey(null);
      }}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-red-600">
               <ArrowUpRight className="w-6 h-6" />
               Export Private Key
            </DialogTitle>
            <DialogDescription className="text-gray-500 pt-2 text-base font-medium">
               This will expose your Postly wallet's private key. You can use it to import your funds into apps like Phantom or Solflare.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8">
            {!privateKey ? (
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center gap-4">
                <p className="text-sm text-red-700 font-bold text-center">
                  WARNING: Never share your private key with anyone! Anyone who has your private key can steal your funds.
                </p>
                <Button 
                  onClick={fetchPrivateKey}
                  disabled={isExportLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-14 font-bold text-lg shadow-xl shadow-red-500/20"
                >
                  {isExportLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Reveal Private Key'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative group">
                  <textarea 
                    readOnly
                    value={privateKey}
                    className="w-full geist-mono text-sm p-4 h-24 rounded-2xl bg-gray-50 text-gray-900 border-2 border-gray-100 focus:outline-none cursor-pointer hover:bg-gray-100 transition-all font-medium break-all resize-none"
                    onClick={copyPrivateKey}
                  />
                  <button onClick={copyPrivateKey} className="absolute right-3 bottom-3 text-purple-500 p-2 bg-white shadow-sm border border-purple-50 rounded-lg hover:bg-purple-50 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center italic">
                  Copy and import this key into Phantom or Solflare as a "Secret Key" or "Private Key".
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="w-full border-2 border-purple-100 text-purple-600 hover:bg-purple-50 rounded-2xl h-14 font-bold text-lg"
              onClick={() => setExportModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-purple-900">
              <ArrowDownLeft className="w-6 h-6 text-purple-600" />
              Deposit USDC
            </DialogTitle>
            <DialogDescription className="text-gray-500 pt-2 text-base">
              Send ONLY USDC on the Solana network to the address below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-8">
             <div className="bg-white p-6 rounded-3xl border-2 border-purple-50 shadow-inner mb-8">
                <QRCode value={user.walletAddress} size={200} />
             </div>

             <div className="w-full relative group">
                <input 
                  readOnly
                  value={user.walletAddress}
                  className="w-full geist-mono text-center text-sm p-4 h-14 rounded-2xl bg-purple-50 text-purple-900 border-2 border-purple-100 focus:outline-none cursor-pointer hover:bg-purple-100 transition-all font-medium"
                  onClick={copyAddress}
                />
                <button onClick={copyAddress} className="absolute right-4 top-4 text-purple-500 p-1 hover:bg-purple-200 rounded-lg transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
             </div>
             <p className="mt-4 text-xs text-purple-400 font-medium text-center">
                Your deposit will be automatically detected after confirmation. 
                Use the "Check for Deposits" button if it doesn't appear.
             </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="w-full border-2 border-purple-100 text-purple-600 hover:bg-purple-50 rounded-2xl h-14 font-bold text-lg"
              onClick={() => setDepositModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
