'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Coins, Repeat2, MessageSquare, Rocket, Sparkles, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="landing-page min-h-screen bg-moving-purple text-gray-900 selection:bg-purple-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Postly Logo" className="h-10 w-auto object-contain" />
            <span className="nav-brand text-3xl font-bold text-purple-700 tracking-tight">Postly</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#how-it-works" className="hover:text-purple-600 transition-colors lowercase">how it works</Link>
            <Link href="#boost" className="text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 lowercase font-bold">
              <Rocket className="w-4 h-4" /> boost
            </Link>
            <Link href="#features" className="hover:text-purple-600 transition-colors lowercase">features</Link>
            <Link href="#faq" className="hover:text-purple-600 transition-colors lowercase">faq</Link>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-400">
              <a href="https://x.com/PostlyDotFun" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </a>
              <a href="https://t.me/+QoH-U7nS0JdiM2Nl" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.48.98-.74 3.82-1.66 6.37-2.75 7.63-3.27 3.63-1.51 4.38-1.77 4.87-1.77.11 0 .35.03.5.15.13.1.17.24.18.37l.01.29z"></path></svg>
              </a>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white geist-mono rounded-full px-6" onClick={() => setAuthModalOpen(true)}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-moving-purple -z-10" />
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl mb-4 text-gray-900"
          >
            Post. Boost. Earn.
            <br />
            <span className="text-purple-600">The Social Network with Real Stakes.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Every post costs USDC. Every reply earns you money. Every post can be stolen by anyone willing to pay double.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link href="/app">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:opacity-90 transition-opacity geist-mono text-white rounded-full shadow-lg shadow-purple-500/20"
              >
                Launch App <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-purple-200 text-purple-700 hover:bg-purple-50 geist-mono rounded-full">
                How It Works &darr;
              </Button>
            </Link>
          </motion.div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Built on Solana</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Powered by USDC</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> No wallet setup needed</span>
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-transparent">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">How Postly Works</h2>
            <p className="text-lg text-gray-600">Four simple steps to turn your words into assets.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Sign Up", desc: "Instant account creation. A Solana wallet is generated for you automatically behind the scenes." },
              { num: "02", title: "Deposit USDC", desc: "Send USDC on Solana to your unique address. No wallet extension like MetaMask needed." },
              { num: "03", title: "Post & Set Price", desc: "Write your post, set a locked USDC amount. Others can reply or steal it." },
              { num: "04", title: "Steal & Earn", desc: "Pay double to steal any post. The previous owner gets paid instantly in USDC." },
            ].map((step, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-purple-50/50 border border-purple-100/50 hover:bg-purple-50 transition-colors">
                <span className="step-number text-6xl text-purple-200 absolute -top-8 -left-2 opacity-50 pointer-events-none">{step.num}</span>
                <h3 className="text-2xl mt-4 mb-3 text-purple-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Boost Works */}
      <section id="boost" className="py-24 bg-white/50 border-y border-purple-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4 font-bold flex items-center justify-center gap-3">
              <Rocket className="w-10 h-10 text-purple-600" /> How Boosting Works
            </h2>
            <p className="text-xl text-gray-600">Give your voice the spotlight it deserves.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Priority Feed</h3>
              <p className="text-gray-600">Boosted posts are pinned to the top of the global feed, ensuring every active user sees your content first.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rocket Badge</h3>
              <p className="text-gray-600">Your post gains a premium 🚀 Rocket badge, signaling high-value content to potential stealers and commenters.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Hyper-Inflationary</h3>
              <p className="text-gray-600 text-base font-medium">Boost any post starting at <span className="text-purple-600 geist-mono font-bold">5.00 USDC</span>. After each boost, the platform-wide price **doubles**.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-transparent border-y border-purple-100/50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-gray-900">Everything is on the Line</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Wallet, title: "Custodial Wallets", desc: "Auto-generated Solana wallet. No seed phrases, no extensions." },
              { icon: Shield, title: "Pay-to-Post", desc: "Set any amount above the minimum. Back your words with real USDC." },
              { icon: Repeat2, title: "Post Stealing", desc: "Anyone can steal your post by paying 2× the locked price. You get paid immediately." },
              { icon: MessageSquare, title: "Paid Replies", desc: "Every reply costs a fixed USDC fee that goes directly to the current post owner." },
              { icon: Rocket, title: "Boost Posts", desc: "Pay a fixed fee to pin your post to the top with a 🚀 badge for 24 hours." },
              { icon: Coins, title: "Passive Earnings", desc: "Own popular posts and earn a stream of USDC every time someone replies." },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steal Deep Dive */}
      <section className="py-24 bg-transparent">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">The Steal Chain Explained</h2>
            <p className="text-lg text-gray-600">Watch the value double exponentially.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
            {[
              { name: "Alice", avatar: "A", price: "1.00 USDC" },
              { name: "Bob", avatar: "B", price: "2.00 USDC" },
              { name: "Carol", avatar: "C", price: "4.00 USDC" },
              { name: "Dave", avatar: "D", price: "8.00 USDC" },
            ].map((node, i, arr) => (
              <div key={i} className="flex items-center flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col items-center min-w-[140px]">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mb-2">
                    {node.avatar}
                  </div>
                  <p className="text-sm font-medium mb-1">{node.name}</p>
                  <p className="geist-mono text-purple-700">{node.price}</p>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="text-purple-300 w-6 h-6 rotate-90 md:rotate-0" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-900 border-b border-purple-100">
                  <th className="p-4 font-medium">Round</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Steal Price</th>
                  <th className="p-4 font-medium">Paid To</th>
                  <th className="p-4 font-medium text-right">New Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-4 text-gray-500 text-sm">1</td>
                  <td className="p-4">Alice posts</td>
                  <td className="p-4 text-gray-400">—</td>
                  <td className="p-4 text-gray-400">—</td>
                  <td className="p-4 text-right font-medium">Alice</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-500 text-sm">2</td>
                  <td className="p-4">Bob steals</td>
                  <td className="p-4 geist-mono text-purple-600">2.00 USDC</td>
                  <td className="p-4">Alice</td>
                  <td className="p-4 text-right font-medium">Bob</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-500 text-sm">3</td>
                  <td className="p-4">Carol steals</td>
                  <td className="p-4 geist-mono text-purple-600">4.00 USDC</td>
                  <td className="p-4">Bob</td>
                  <td className="p-4 text-right font-medium">Carol</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-500 text-sm">4</td>
                  <td className="p-4">Dave steals</td>
                  <td className="p-4 geist-mono text-purple-600">8.00 USDC</td>
                  <td className="p-4">Carol</td>
                  <td className="p-4 text-right font-medium">Dave</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Fee Table */}
      <section className="py-24 bg-transparent border-t border-purple-100/50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="p-5 font-semibold">Action</th>
                  <th className="p-5 font-semibold">Cost</th>
                  <th className="p-5 font-semibold">Who Receives It</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {[
                  { action: "Create Post", cost: "User-set (min 0.1 USDC)", recv: "Locked in post" },
                  { action: "Steal Post", cost: "2× locked amount", recv: "Current post owner" },
                  { action: "Reply to Post", cost: "0.50 USDC", recv: "Current post owner" },
                  { action: "Boost Post", cost: "Starts at 5.00 USDC (Doubles each time)", recv: "Platform treasury" },
                  { action: "Deposit", cost: "Free", recv: "—" },
                  { action: "Withdraw", cost: "~0.001 USDC", recv: "Solana network" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-5 font-medium">{row.action}</td>
                    <td className="p-5 geist-mono text-purple-600">{row.cost}</td>
                    <td className="p-5 text-gray-500">{row.recv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-transparent">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl text-gray-900 mb-4">Questions, Answered</h2>
          </div>
          {/* @ts-ignore */}
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Do I need a crypto wallet?", a: "No! When you sign up, an internal Solana wallet is automatically created for you. You only need to send USDC to it from any exchange or existing wallet to start." },
              { q: "What is USDC?", a: "USDC is a digital dollar, a stablecoin pegged 1:1 to the US Dollar. It's fast, cheap to move, and globally accessible." },
              { q: "Which blockchain?", a: "Postly is built exclusively on the Solana blockchain for lightning-fast speeds and ultra-low fees." },
              { q: "Is my USDC safe?", a: "Your private keys are AES-256 encrypted using environment secrets. However, as this is a custodial service, you should only keep funds you intend to use on the platform." },
              { q: "Can I withdraw anytime?", a: "Yes. You can withdraw your available USDC balance to any external Solana wallet at any time minus a tiny network fee (~$0.001)." },
              { q: "What happens when my post is stolen?", a: "You lose ownership of the post, but the stealer pays you double the amount that was locked in it. The USDC is instantly added to your available balance." },
              { q: "What's the minimum post cost?", a: "The minimum amount required to create a post is 0.1 USDC. There is no upper limit." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-xl instrument-serif text-left hover:text-purple-600 hover:no-underline py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-5xl md:text-6xl mb-6">Ready to Post with Stakes?</h2>
          <p className="text-xl text-purple-200 mb-10">Join Postly and turn your words into assets.</p>
          <Link href="/app">
            <Button size="lg" className="h-16 px-10 text-xl bg-white text-purple-700 hover:bg-gray-100 rounded-full geist-mono shadow-xl transition-all hover:scale-105">
              Launch App <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Postly Logo" className="h-10 w-auto object-contain" />
              <span className="geist-mono text-3xl font-bold text-gray-900">Postly</span>
            </div>
            <span className="text-gray-500 italic text-sm">Post. Boost. Earn.</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="https://x.com/PostlyDotFun" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 flex items-center gap-2">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
               X.com
            </a>
            <a href="https://t.me/+QoH-U7nS0JdiM2Nl" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 flex items-center gap-2">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0C5.344 0 0 5.344 0 11.944c0 6.6 5.344 11.944 11.944 11.944 6.6 0 11.944-5.344 11.944-11.944C23.888 5.344 18.544 0 11.944 0zm5.112 8.333l-1.722 8.111c-.13.578-.472.72-.958.452l-2.617-1.928-1.263 1.217c-.14.14-.257.257-.527.257l.188-2.66 4.842-4.375c.21-.186-.046-.29-.326-.104l-5.986 3.77-2.578-.805c-.56-.175-.572-.56.117-.83l10.07-3.884c.466-.17.872.107.74.777z"/></svg>
               Telegram
            </a>
          </div>
          <div className="flex flex-col items-center md:items-end text-sm text-gray-400">
            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold mb-2">Built on Solana</span>
            <span>© 2025 Postly. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
