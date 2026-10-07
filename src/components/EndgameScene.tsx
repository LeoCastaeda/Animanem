/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { Trophy, Swords, Target, ArrowLeft, Infinity } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface EndgameSceneProps {
  gameState: GameState;
  onSelectMode: (mode: 'arena' | 'survival' | 'boss-rush') => void;
  onExit: () => void;
}

export default function EndgameScene({ gameState, onSelectMode, onExit }: EndgameSceneProps) {
  const [selectedMode, setSelectedMode] = useState<'arena' | 'survival' | 'boss-rush' | null>(null);

  const modes = [
    {
      id: 'arena' as const,
      name: 'Arena Infinita',
      icon: '⚔️',
      description: 'Enfrenta oleadas interminables de enemigos. La dificultad aumenta progresivamente.',
      color: 'from-red-600 to-orange-600',
      unlocked: gameState.campaignCompleted,
    },
    {
      id: 'survival' as const,
      name: 'Supervivencia',
      icon: '🛡️',
      description: 'Sobrevive el mayor tiempo posible. Sin curaciones entre combates.',
      color: 'from-blue-600 to-cyan-600',
      unlocked: gameState.campaignCompleted && gameState.monstersDefeated >= 50,
    },
    {
      id: 'boss-rush' as const,
      name: 'Carrera de Jefes',
      icon: '👑',
      description: 'Enfrenta todos los jefes del juego en secuencia. Modo definitivo.',
      color: 'from-purple-600 to-pink-600',
      unlocked: gameState.campaignCompleted && gameState.monstersDefeated >= 100,
    },
  ];

  const handleModeClick = (modeId: 'arena' | 'survival' | 'boss-rush', unlocked: boolean) => {
    if (!unlocked) {
      soundManager.playClick();
      return;
    }
    soundManager.playClick();
    setSelectedMode(modeId);
  };

  const handleConfirm = () => {
    if (!selectedMode) return;
    soundManager.playEvent();
    onSelectMode(selectedMode);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/30 to-black opacity-80" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity as unknown as number,
            ease: 'linear'
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-5xl w-full bg-slate-950/80 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(99,102,241,0.3)]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block mb-4"
          >
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 rounded-full flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(245,158,11,0.6)] border-4 border-yellow-300/30">
              <Trophy className="w-16 h-16 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-3">
            Modo Endgame
          </h1>
          <p className="text-sm text-amber-300 uppercase tracking-[0.3em] font-bold mb-4">
            Desafíos Infinitos
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
            <Infinity className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-300">
              Nivel Endgame: {gameState.endgameLevel}
            </span>
          </div>
        </div>

        {/* Player Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-black/40 border border-indigo-500/30 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-indigo-400 uppercase font-bold mb-1">Nivel</p>
            <p className="text-2xl font-black text-white">{gameState.player.level}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-red-400 uppercase font-bold mb-1">Derrotados</p>
            <p className="text-2xl font-black text-white">{gameState.monstersDefeated}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-purple-400 uppercase font-bold mb-1">Subterráneos</p>
            <p className="text-2xl font-black text-white">Piso {gameState.undergroundProgress}</p>
          </div>
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {modes.map((mode, index) => {
            const isSelected = selectedMode === mode.id;
            const isLocked = !mode.unlocked;

            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={isLocked ? {} : { scale: 1.05 }}
                whileTap={isLocked ? {} : { scale: 0.95 }}
                onClick={() => handleModeClick(mode.id, mode.unlocked)}
                className={`
                  relative cursor-pointer rounded-2xl p-6 border-2 transition-all
                  ${isSelected 
                    ? `border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] bg-gradient-to-br ${mode.color}` 
                    : isLocked
                      ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                      : 'border-indigo-500/30 bg-slate-800/50 hover:border-indigo-400/60'
                  }
                `}
              >
                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 backdrop-blur-sm rounded-2xl">
                    <div className="text-4xl mb-2">🔒</div>
                    <p className="text-xs text-gray-400 font-bold text-center px-2">
                      {mode.id === 'survival' && 'Derrota 50+ enemigos'}
                      {mode.id === 'boss-rush' && 'Derrota 100+ enemigos'}
                    </p>
                  </div>
                )}

                {/* Icon */}
                <div className="text-6xl mb-4 text-center">
                  {mode.icon}
                </div>

                {/* Name */}
                <h3 className={`text-center font-black text-xl mb-3 ${isSelected ? 'text-white' : 'text-indigo-200'}`}>
                  {mode.name}
                </h3>

                {/* Description */}
                <p className={`text-center text-xs ${isSelected ? 'text-white/90' : 'text-indigo-300/80'}`}>
                  {mode.description}
                </p>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-2xl">✓</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 mb-8">
          <p className="text-xs text-amber-300 text-center font-bold">
            💡 El Modo Endgame no afecta tu progreso de campaña. Puedes jugar libremente sin perder tu partida principal.
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
            Volver
          </motion.button>
          
          <motion.button
            whileHover={selectedMode ? { scale: 1.05 } : {}}
            whileTap={selectedMode ? { scale: 0.95 } : {}}
            onClick={handleConfirm}
            disabled={!selectedMode}
            className={`
              flex-1 px-6 py-4 rounded-xl font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2
              ${selectedMode
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] border-yellow-400 cursor-pointer'
                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
              }
            `}
          >
            <Swords className="w-5 h-5" />
            Comenzar Desafío
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
