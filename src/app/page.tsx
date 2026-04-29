'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

const RobotArm = dynamic(() => import('@/components/RobotArm').then(mod => mod.RobotArm), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary opacity-40 animate-pulse">
          Initializing Neural Link...
        </span>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a1614] text-[#f5ebe0] selection:bg-[#d4b99b]/20 overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#1a1614]/90 backdrop-blur-xl border-b border-[#d4b99b]/10">
        <div className="w-full px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-light tracking-tighter serif text-[#d4b99b]">Prìsma</span>
            <span className="text-xs mt-1 text-[#d4b99b] opacity-60">(x)</span>
          </div>
          <div className="hidden md:flex items-center gap-12 text-[10px] font-mono uppercase tracking-[0.2em]">
            <a href="https://twitter.com/PrismaXai" target="_blank" className="text-[#f5ebe0]/60 hover:text-[#d4b99b] transition-colors">Twitter</a>
            <a href="https://discord.gg/GCzJjBND" target="_blank" className="text-[#f5ebe0]/60 hover:text-[#d4b99b] transition-colors">Discord</a>
            <a href="https://www.prismax.ai/" target="_blank" className="text-[#f5ebe0]/60 hover:text-[#d4b99b] transition-colors">Website</a>
          </div>
          <a href="https://app.prismax.ai/" target="_blank" className="px-6 py-2.5 rounded-lg bg-[#d4b99b] text-[#1a1614] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,185,155,0.3)]">
            Operate Real Robots
          </a>
        </div>
      </nav>

      {/* Main Content Area - FULL SCREEN 3D */}
      <div className="relative w-full h-screen bg-[#1a1614]">
        {/* The Robot stays in the center background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#1a1614]">
              <div className="w-12 h-12 border-2 border-[#d4b99b]/20 border-t-[#d4b99b] rounded-full animate-spin" />
            </div>
          }>
            <RobotArm />
          </Suspense>
        </div>

        {/* Subtle overlay at the bottom */}
        <div className="absolute bottom-32 left-0 w-full z-10 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
             <a 
                href="https://app.prismax.ai/" 
                target="_blank" 
                className="pointer-events-auto inline-block px-12 py-5 rounded-xl border border-primary/20 bg-bg-dark/40 backdrop-blur-xl text-primary font-light text-base hover:bg-primary hover:text-bg-dark transition-all tracking-tight shadow-[0_0_40px_rgba(0,0,0,0.5)]"
              >
                TELEOPERATE NOW »
              </a>
          </motion.div>
        </div>

        {/* Creator Label in bottom right */}
        <div className="absolute bottom-10 right-10 z-50 pointer-events-auto select-none opacity-40 hover:opacity-100 transition-opacity">
          <a 
            href="https://twitter.com/OG_Cryptooo" 
            target="_blank" 
            className="flex flex-col items-end gap-1"
          >
            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#d4b99b]">Created by</span>
            <span className="text-xs font-mono font-bold text-[#f5ebe0] uppercase tracking-widest">@OG_Cryptooo</span>
            <span className="text-[7px] font-mono text-[#d4b99b]/50 uppercase tracking-tighter">DM for improvements & feedback</span>
          </a>
        </div>
      </div>
    </main>
  );
}
