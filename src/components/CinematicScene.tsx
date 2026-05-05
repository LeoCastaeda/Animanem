/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Trophy, Star, Sparkles } from 'lucide-react';

export default function CinematicScene({ type, onComplete }: { type: 'ending', onComplete: () => void }) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-8 text-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mb-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
      >
        <Trophy className="w-24 h-24 text-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]" />
      </motion.div>

      <motion.h1 
        className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        VICTORIA EN ANIMANEM
      </motion.h1>

      <motion.div 
        className="max-w-2xl text-gray-400 space-y-4 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>El Coloso del Caos ha caído. Las ciudades se separan y la paz regresa al reino mágico.</p>
        <p>Tu valentía y el sacrificio (y posterior resurrección) de tu amigo serán recordados por la eternidad.</p>
        <p>Has conquistado las playas oscuras, los bosques mágicos y las ruinas antiguas.</p>
      </motion.div>

      <div className="flex gap-4 mb-12">
        <Sparkles className="text-blue-400 animate-pulse" />
        <Star className="text-yellow-400 animate-bounce" />
        <Sparkles className="text-purple-400 animate-pulse" />
      </div>

      <button 
        onClick={onComplete}
        className="px-8 py-3 border border-white/20 hover:bg-white/10 transition-colors uppercase tracking-[0.2em] text-xs"
      >
        Jugar de Nuevo
      </button>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 10 
            }}
            animate={{ 
              y: -10,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 5 + 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
