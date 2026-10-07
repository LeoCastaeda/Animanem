/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroId, GameState } from '../types';
import { HEROES, getHeroById } from '../data/heroes';
import { Zap, Shield, Heart, Wrench, ChevronRight, Lock } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CharacterSelectionProps {
  gameState: GameState;
  onSelect: (heroId: HeroId) => void;
  onCancel?: () => void;
}

export default function CharacterSelection({ gameState, onSelect, onCancel }: CharacterSelectionProps) {
  const [selectedHero, setSelectedHero] = useState<HeroId>(gameState.player.selectedHero);
  const [hoveredHero, setHoveredHero] = useState<HeroId | null>(null);

  const handleSelect = (heroId: HeroId) => {
    if (!gameState.unlockedHeroes.includes(heroId)) {
      soundManager.playClick();
      return;
    }
    soundManager.playClick();
    setSelectedHero(heroId);
  };

  const handleConfirm = () => {
    soundManager.playEvent();
    onSelect(selectedHero);
  };

  const getHeroIcon = (heroId: HeroId) => {
    switch (heroId) {
      case 'hero': return '🦅';
      case 'zaigo': return '⚡';
      case 'wiku': return '❄️';
      case 'scrap': return '🔧';
      default: return '❓';
    }
  };

  const getHeroColor = (heroId: HeroId) => {
    switch (heroId) {
      case 'hero': return 'from-purple-500 to-indigo-600';
      case 'zaigo': return 'from-yellow-400 to-amber-500';
      case 'wiku': return 'from-blue-400 to-cyan-500';
      case 'scrap': return 'from-gray-400 to-slate-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const hero = getHeroById(selectedHero);
  const isLocked = (heroId: HeroId) => !gameState.unlockedHeroes.includes(heroId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-full max-w-6xl bg-gradient-to-br from-slate-900/95 to-indigo-950/95 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(99,102,241,0.3)] overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent mb-2"
          >
            Selección de Héroe
          </motion.h1>
          <p className="text-xs md:text-sm text-indigo-300 uppercase tracking-[0.3em] font-bold">
            Elige tu campeón para el próximo combate
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['hero', 'zaigo', 'wiku', 'scrap'] as HeroId[]).map((heroId, index) => {
            const heroData = getHeroById(heroId);
            const locked = isLocked(heroId);
            const isSelected = selectedHero === heroId;
            const isHovered = hoveredHero === heroId;

            return (
              <motion.div
                key={heroId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: locked ? 1 : 1.05 }}
                whileTap={{ scale: locked ? 1 : 0.95 }}
                onClick={() => handleSelect(heroId)}
                onMouseEnter={() => setHoveredHero(heroId)}
                onMouseLeave={() => setHoveredHero(null)}
                className={`
                  relative cursor-pointer rounded-2xl p-4 border-2 transition-all
                  ${isSelected 
                    ? `border-white shadow-[0_0_30px_rgba(255,255,255,0.5)] bg-gradient-to-br ${getHeroColor(heroId)}` 
                    : locked
                      ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                      : 'border-indigo-500/30 bg-slate-800/50 hover:border-indigo-400/60'
                  }
                `}
              >
                {/* Lock Icon */}
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 rounded-2xl">
                    <Lock className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Icon */}
                <div className="text-5xl md:text-6xl mb-3 text-center">
                  {getHeroIcon(heroId)}
                </div>

                {/* Name */}
                <h3 className={`text-center font-black text-lg md:text-xl mb-1 ${isSelected ? 'text-white' : 'text-indigo-200'}`}>
                  {heroData.displayName}
                </h3>

                {/* Stats Preview */}
                <div className="text-center text-xs space-y-1">
                  <div className={`flex items-center justify-center gap-1 ${isSelected ? 'text-white/90' : 'text-indigo-300/80'}`}>
                    <Heart className="w-3 h-3" /> {heroData.baseHp} HP
                  </div>
                  <div className={`flex items-center justify-center gap-1 ${isSelected ? 'text-white/90' : 'text-indigo-300/80'}`}>
                    <Zap className="w-3 h-3" /> {heroData.baseAttack} ATK
                  </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-xl">✓</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Hero Details Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedHero}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-start gap-6">
              {/* Hero Icon Large */}
              <div className={`flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${getHeroColor(selectedHero)} flex items-center justify-center text-6xl shadow-lg`}>
                {getHeroIcon(selectedHero)}
              </div>

              {/* Hero Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-black text-white mb-2">{hero.displayName}</h2>
                <p className="text-sm text-indigo-200 mb-3">{hero.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-black/40 rounded-lg p-2 border border-red-500/30">
                    <div className="text-[10px] text-red-400 uppercase font-bold mb-1">HP Base</div>
                    <div className="text-xl font-black text-white">{hero.baseHp}</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2 border border-amber-500/30">
                    <div className="text-[10px] text-amber-400 uppercase font-bold mb-1">Ataque Base</div>
                    <div className="text-xl font-black text-white">{hero.baseAttack}</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2 border border-cyan-500/30 col-span-2 md:col-span-1">
                    <div className="text-[10px] text-cyan-400 uppercase font-bold mb-1">Especialidad</div>
                    <div className="text-sm font-bold text-white">{hero.specialStat}</div>
                  </div>
                </div>

                {/* Passive */}
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-3 mb-3">
                  <div className="text-xs text-purple-300 uppercase font-bold mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Habilidad Pasiva
                  </div>
                  <p className="text-sm text-white">{hero.passive}</p>
                </div>

                {/* Abilities */}
                <div>
                  <div className="text-xs text-indigo-300 uppercase font-bold mb-2">Habilidades Activas:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {hero.abilities.map((ability) => (
                      <div key={ability.id} className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2">
                        <div className="text-xs font-bold text-white mb-1">{ability.name}</div>
                        <div className="text-[10px] text-indigo-300 mb-1">{ability.description}</div>
                        <div className="flex items-center gap-2 text-[9px]">
                          <span className="text-yellow-400">⚡ {ability.energyCost}</span>
                          <span className="text-gray-400">CD: {ability.cooldown}t</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-black text-white uppercase tracking-wider transition-all border border-gray-500"
            >
              Cancelar
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400 flex items-center justify-center gap-2"
          >
            Confirmar Selección
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
