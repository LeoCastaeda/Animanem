/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { ArrowDown, Skull, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface UndergroundSceneProps {
  gameState: GameState;
  onCombatTrigger: () => void;
  onExit: () => void;
  onStateUpdate: (updates: Partial<GameState>) => void;
}

export default function UndergroundScene({ gameState, onCombatTrigger, onExit, onStateUpdate }: UndergroundSceneProps) {
  const [currentFloor, setCurrentFloor] = useState(gameState.undergroundProgress || 1);
  const [floorCleared, setFloorCleared] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const getDifficultyMultiplier = (floor: number) => {
    return 1 + (floor * 0.2); // +20% dificultad por piso
  };

  const generateFloorEncounters = (floor: number) => {
    const baseMonsters = [
      'shadow-1', 'shadow-2', 'ghoul-1', 'ghoul-2', 
      'beast-1', 'beast-2', 'guardian-1', 'guardian-2',
      'wraith', 'golem', 'spirit', 'ice-giant', 'demon', 'dark-knight', 'titan'
    ];
    
    const monstersPerFloor = Math.min(3 + Math.floor(floor / 2), 8);
    const encounters: string[] = [];
    
    for (let i = 0; i < monstersPerFloor; i++) {
      const randomMonster = baseMonsters[Math.floor(Math.random() * baseMonsters.length)];
      encounters.push(randomMonster);
    }
    
    // Boss cada 5 pisos
    if (floor % 5 === 0) {
      encounters.push('colossus');
    }
    
    return encounters;
  };

  const generateFloorRewards = (floor: number) => {
    const rewards: string[] = [];
    
    // Objetos base
    rewards.push('potion', 'potion');
    
    // Recompensas extra según piso
    if (floor % 2 === 0) {
      rewards.push('elixir');
    }
    if (floor % 3 === 0) {
      rewards.push('crystal');
    }
    if (floor % 5 === 0) {
      rewards.push('shield', 'elixir', 'crystal');
    }
    
    return rewards;
  };

  const handleDescend = () => {
    soundManager.playEvent();
    const nextFloor = currentFloor + 1;
    setCurrentFloor(nextFloor);
    setFloorCleared(false);
    
    const encounters = generateFloorEncounters(nextFloor);
    onStateUpdate({
      undergroundProgress: nextFloor,
      plannedEncounters: {
        ...gameState.plannedEncounters,
        underground: encounters
      },
      currentEncounterId: 0
    });
  };

  const handleStartFloor = () => {
    soundManager.playClick();
    const encounters = generateFloorEncounters(currentFloor);
    onStateUpdate({
      currentScene: 'underground',
      plannedEncounters: {
        ...gameState.plannedEncounters,
        underground: encounters
      },
      currentEncounterId: 0
    });
    onCombatTrigger();
  };

  const handleClaimRewards = () => {
    soundManager.playEvent();
    const rewards = generateFloorRewards(currentFloor);
    onStateUpdate({
      inventory: [...gameState.inventory, ...rewards]
    });
    setShowRewards(false);
    setFloorCleared(true);
  };

  const difficultyColor = currentFloor <= 3 ? 'text-green-400' : currentFloor <= 7 ? 'text-yellow-400' : currentFloor <= 15 ? 'text-orange-400' : 'text-red-400';
  const difficultyLabel = currentFloor <= 3 ? 'FÁCIL' : currentFloor <= 7 ? 'MEDIO' : currentFloor <= 15 ? 'DIFÍCIL' : 'EXTREMO';

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black opacity-80" />
      <div className="absolute inset-0 bg-[url('/images/underground-bg.png')] bg-cover bg-center opacity-20" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 50,
              opacity: 0.5
            }}
            animate={{
              y: -50,
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-3xl w-full bg-slate-950/80 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(168,85,247,0.3)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block mb-4"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-indigo-800 rounded-full flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              ⚔️
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-3">
            Subterráneos
          </h1>
          <p className="text-sm text-purple-300 uppercase tracking-[0.3em] font-bold mb-6">
            Mazmorras Infinitas del Caos
          </p>

          {/* Floor Counter */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/40 border border-purple-500/30 rounded-full">
            <ArrowDown className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-black text-white">Piso {currentFloor}</span>
            <span className={`text-xs font-bold ${difficultyColor} px-2 py-1 bg-black/40 rounded uppercase`}>
              {difficultyLabel}
            </span>
          </div>
        </div>

        {/* Floor Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-black/40 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <Skull className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Enemigos</span>
            </div>
            <p className="text-2xl font-black text-white">
              {Math.min(3 + Math.floor(currentFloor / 2), 8)}
            </p>
            {currentFloor % 5 === 0 && (
              <p className="text-xs text-yellow-400 font-bold mt-1">+ BOSS FINAL</p>
            )}
          </div>

          <div className="bg-black/40 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Dificultad</span>
            </div>
            <p className="text-2xl font-black text-white">
              +{Math.round(getDifficultyMultiplier(currentFloor) * 100 - 100)}%
            </p>
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 text-indigo-300 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase font-bold">Recompensas del Piso</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {generateFloorRewards(currentFloor).map((reward, idx) => (
              <div key={idx} className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded text-xs font-bold text-purple-300">
                {reward === 'potion' && '🧪 Poción'}
                {reward === 'elixir' && '⚗️ Elixir'}
                {reward === 'crystal' && '💎 Cristal'}
                {reward === 'shield' && '🛡️ Escudo'}
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-8">
          <p className="text-xs text-red-300 text-center font-bold">
            ⚠️ Los Subterráneos son infinitos. Si mueres, perderás el progreso del piso actual pero conservarás tus recompensas previas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-black text-white uppercase tracking-wider transition-all border border-gray-500 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Salir
          </motion.button>
          
          {floorCleared ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDescend}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400 flex items-center justify-center gap-2"
            >
              <ArrowDown className="w-5 h-5" />
              Descender (Piso {currentFloor + 1})
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartFloor}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400 flex items-center justify-center gap-2"
            >
              <Skull className="w-5 h-5" />
              Comenzar Piso {currentFloor}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
