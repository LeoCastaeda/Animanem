/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GameState, SceneId } from '../types.ts';
import { Map, Zap, Scroll, Ghost, Sword } from 'lucide-react';

interface ExplorationSceneProps {
  gameState: GameState;
  onCombatTrigger: () => void;
  onSceneComplete: (nextScene: SceneId) => void;
}

export default function ExplorationScene({ gameState, onCombatTrigger, onSceneComplete }: ExplorationSceneProps) {
  const [progress, setProgress] = useState(0);

  const sceneConfig = {
    'beach': {
      bg: 'radial-gradient(circle at 50% 100%, #1a365d 0%, #000 70%)',
      title: 'Playa de los Lamentos',
      desc: 'Arena negra y restos de naufragio. Sientes ojos observándote desde las sombras.',
      monsterSpawnRate: 0.1,
      next: 'forest' as SceneId
    },
    'forest': {
      bg: 'radial-gradient(circle at 50% 100%, #1c4532 0%, #000 70%)',
      title: 'Bosque de las Almas',
      desc: 'Árboles colosales que susurran secretos prohibidos. La magia aquí es densa.',
      monsterSpawnRate: 0.2,
      next: 'ruins' as SceneId
    },
    'ruins': {
      bg: 'radial-gradient(circle at 50% 100%, #4a2c2c 0%, #000 70%)',
      title: 'Ruinas de Aethel',
      desc: 'Piedras antiguas impregnadas de sangre y gloria. Alguna vez fue un reino próspero.',
      monsterSpawnRate: 0.3,
      next: 'city' as SceneId
    },
    'city': {
      bg: 'radial-gradient(circle at 50% 100%, #2d3748 0%, #000 70%)',
      title: 'Ciudadela de Neón',
      desc: 'Luces mágicas parpadean sobre las calles desiertas. El aire huele a ozono y miedo.',
      monsterSpawnRate: 0.25,
      next: 'final-boss' as SceneId
    },
    'final-boss': {
      bg: 'radial-gradient(circle at 50% 100%, #44337a 0%, #000 70%)',
      title: 'El Núcleo del Caos',
      desc: 'La ciudad se retuerce... las realidades se fusionan. El Coloso despierta.',
      monsterSpawnRate: 1.0, // Force combat
      next: 'ending' as SceneId
    },
    'intro': { bg: '', title: '', desc: '', monsterSpawnRate: 0, next: 'beach' as SceneId },
    'ending': { bg: '', title: '', desc: '', monsterSpawnRate: 0, next: 'intro' as SceneId }
  };

  const current = sceneConfig[gameState.currentScene] || sceneConfig['beach'];

  // Aquí puedes definir una URL de video diferente por escena si quieres
  // const videoUrl = `/videos/${gameState.currentScene}.mp4`;

  const explore = () => {
    if (progress >= 100) return;
    
    const nextProgress = progress + 10;
    setProgress(nextProgress);
    
    // Si hay combate, lo manejamos después del render via useEffect o asegurando que no sea síncrono durante el render si fuera el caso
    // En este caso, simplemente marcamos si debe haber combate
    if (Math.random() < current.monsterSpawnRate) {
      setTimeout(onCombatTrigger, 100);
    }
  };

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => onSceneComplete(current.next), 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, onSceneComplete, current.next]);

  return (
    <motion.div 
      className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* VIDEO BACKGROUND LOOP - Descomentar cuando tengas el archivo en /public */}
      {/* 
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={`/videos/${gameState.currentScene}.mp4`} type="video/mp4" />
      </video> 
      */}

      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div 
          className="absolute inset-0 transition-colors duration-1000 bg-black/40" 
          style={{ backgroundImage: `linear-gradient(to bottom, transparent, black), ${current.bg}` }} 
        />
        {/* Magic Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-[1px]"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0
            }}
            animate={{ 
              y: [null, "-20%"],
              opacity: [0, 0.8, 0],
              scale: [1, 2, 1]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
        <div className="absolute top-[20%] left-[15%] w-32 h-64 bg-white/5 border border-white/10 skew-x-12 backdrop-blur-sm animate-pulse"></div>
        <div className="absolute top-[40%] right-[20%] w-48 h-32 bg-white/5 border border-white/10 -skew-y-6 backdrop-blur-sm"></div>
      </div>

      <div className="z-10 text-center px-6">
        <div className="mb-6 px-8 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full inline-flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_indigo]"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300">Exploración Activa</span>
        </div>

        <motion.h2 
          className="text-6xl md:text-8xl font-black mb-2 tracking-tighter italic text-white drop-shadow-2xl"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          {current.title}
        </motion.h2>
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-8" />
        
        <motion.p 
          className="text-indigo-200/60 max-w-lg mx-auto mb-12 text-sm md:text-base leading-relaxed font-medium"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {current.desc}
        </motion.p>

        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-400">Progreso de la Zona</div>
            <div className="w-72 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 p-[2px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(129,140,248,0.5)] rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button 
            onClick={explore}
            disabled={progress >= 100}
            className="group relative px-16 py-5 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl text-white font-black italic uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl"
          >
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
            <span className="relative z-10 flex items-center gap-3">
              <Sword className="w-5 h-5 text-indigo-400" />
              Avanzar
            </span>
          </button>
        </div>
      </div>

      {/* Right Rail Simulation */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-6">
        <div className="w-14 h-14 rounded-xl frosted-glass flex flex-col items-center justify-center group border-l-4 border-l-teal-500">
          <div className="text-[8px] font-bold text-white/50 mb-1">PET</div>
          <div className="w-6 h-6 rounded-full bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.6)]"></div>
        </div>
        <div className="w-14 h-14 rounded-xl frosted-glass flex flex-col items-center justify-center border-l-4 border-l-indigo-500">
          <div className="text-[8px] font-bold text-white/50 mb-1">ALLY</div>
          <div className="w-6 h-6 rounded-full bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.6)]"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
      `}} />
    </motion.div>
  );
}
