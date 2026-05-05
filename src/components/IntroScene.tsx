/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, Wind, Zap, Waves } from 'lucide-react';

export default function IntroScene({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const narrative = [
    { text: "En un mar en calma, el barco navegaba hacia lo desconocido...", icon: <Ship className="w-12 h-12 text-blue-300" /> },
    { text: "Pero de repente, el cielo se tiñó de sangre y las olas rugieron.", icon: <Waves className="w-12 h-12 text-blue-600" /> },
    { text: "¡Una tormenta de origen mágico golpeó con furia ciega!", icon: <Zap className="w-12 h-12 text-yellow-400" /> },
    { text: "El barco se partió... y la oscuridad lo consumió todo.", icon: <Wind className="w-12 h-12 text-gray-500" /> },
    { text: "Despiertas en una playa extraña... AnimaneM te espera.", icon: null }
  ];

  useEffect(() => {
    if (step >= narrative.length) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setStep(s => s + 1), 3500);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {step < narrative.length && (
          <motion.div
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-8"
          >
            {narrative[step].icon && (
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                  filter: ['drop-shadow(0 0 0px transparent)', 'drop-shadow(0 0 20px rgba(99,102,241,0.5))', 'drop-shadow(0 0 0px transparent)']
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl frosted-glass flex items-center justify-center border-white/30 shadow-2xl"
              >
                {narrative[step].icon}
              </motion.div>
            )}
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-white/90 max-w-4xl leading-tight drop-shadow-2xl">
              {narrative[step].text}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-16 flex gap-3">
        {narrative.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-700 ${i === step ? 'bg-indigo-500 w-12 shadow-[0_0_10px_indigo]' : 'bg-white/10 w-4'}`} 
          />
        ))}
      </div>
    </motion.div>
  );
}
