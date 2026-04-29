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
    <main className="min-h-screen bg-bg-dark text-foreground selection:bg-primary/20 bg-gradient-prism overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-light tracking-tighter serif">Prìsma</span>
            <span className="text-xs mt-1">(x)</span>
          </div>
          <div className="hidden md:flex items-center gap-12 text-[10px] font-mono uppercase tracking-[0.2em] opacity-40">
            <a href="https://twitter.com/PrismaXai" target="_blank" className="hover:opacity-100 transition-opacity">Twitter</a>
            <a href="https://discord.gg/GCzJjBND" target="_blank" className="hover:opacity-100 transition-opacity">Discord</a>
            <a href="https://www.prismax.ai/" target="_blank" className="hover:opacity-100 transition-opacity">Website</a>
          </div>
          <a href="https://app.prismax.ai/" target="_blank" className="px-6 py-2.5 rounded-lg bg-primary text-bg-dark text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,185,155,0.3)]">
            Operate Real Robots
          </a>
        </div>
      </nav>

      {/* Main Content Area - FULL SCREEN 3D */}
      <div className="flex-1 relative w-full h-full pt-24 flex flex-col items-center justify-center">
        {/* The Robot stays in the center background */}
        <div className="absolute inset-0 z-0">
          <RobotArm />
        </div>

        {/* Subtle overlay at the bottom */}
        <div className="relative z-10 mt-auto mb-32 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center"
          >
             <a 
                href="https://app.prismax.ai/" 
                target="_blank" 
                className="pointer-events-auto inline-block px-12 py-5 rounded-xl border border-primary/20 bg-bg-dark/40 backdrop-blur-xl text-primary font-light text-base hover:bg-primary hover:text-bg-dark transition-all tracking-tight"
              >
                TELEOPERATE NOW »
              </a>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-8 px-10 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center opacity-30">
          <div className="flex items-center gap-2">
            <span className="text-lg font-light serif tracking-tighter">Prìsma(x)</span>
            <span className="text-[8px] font-mono ml-4 tracking-widest">STABLE_REL_03</span>
          </div>
          <div className="flex gap-10 text-[9px] font-mono uppercase tracking-[0.2em] pointer-events-auto">
            <a href="https://twitter.com/PrismaXai" target="_blank" className="hover:text-primary transition-colors">Twitter</a>
            <a href="https://discord.gg/GCzJjBND" target="_blank" className="hover:text-primary transition-colors">Discord</a>
            <a href="https://www.prismax.ai/" target="_blank" className="hover:text-primary transition-colors">Website</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
