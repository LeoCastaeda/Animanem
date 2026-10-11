/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeroId, GameState } from '../types';
import { getHeroById } from '../data/heroes';
import { Zap, Shield, Heart, ChevronRight, Lock } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface CharacterSelectionProps {
  gameState: GameState;
  onSelect: (heroId: HeroId) => void;
  onCancel?: () => void;
}

const HERO_ORDER: HeroId[] = ['hero', 'zaigo', 'wiku', 'scrap'];

export default function CharacterSelection({ gameState, onSelect, onCancel }: CharacterSelectionProps) {
  const [selectedHero, setSelectedHero] = useState<HeroId>(gameState.player.selectedHero);

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
      className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="w-full max-w-lg bg-gradient-to-br from-slate-900/95 to-indigo-950/95 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(99,102,241,0.25)] max-h-[90vh] flex flex-col"
      >
        <div className="text-center mb-3 shrink-0">
          <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase text-white">
            Elige héroe
          </h1>
          <p className="text-[10px] text-indigo-300/80 uppercase tracking-[0.2em] font-bold mt-0.5">
            Para el próximo combate
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1.5 shrink-0 mb-3">
          {HERO_ORDER.map((heroId) => {
            const heroData = getHeroById(heroId);
            const locked = isLocked(heroId);
            const isSelected = selectedHero === heroId;

            return (
              <button
                key={heroId}
                type="button"
                onClick={() => handleSelect(heroId)}
                className={`relative min-w-0 rounded-xl border px-1 py-2 text-center transition-all cursor-pointer ${
                  isSelected
                    ? `border-white bg-gradient-to-br ${getHeroColor(heroId)} shadow-[0_0_16px_rgba(255,255,255,0.25)]`
                    : locked
                      ? 'border-white/10 bg-black/40 opacity-50 cursor-not-allowed'
                      : 'border-white/10 bg-white/5 hover:border-indigo-400/50'
                }`}
              >
                {locked && (
                  <span className="absolute top-1 right-1">
                    <Lock className="w-3 h-3 text-white/70" />
                  </span>
                )}
                <div className="text-lg leading-none mb-1">{getHeroIcon(heroId)}</div>
                <div className={`text-[10px] sm:text-xs font-black uppercase tracking-wide truncate ${isSelected ? 'text-white' : 'text-indigo-100'}`}>
                  {heroData.displayName}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedHero}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="min-h-0 overflow-y-auto bg-slate-950/70 border border-white/10 rounded-xl p-3 mb-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br ${getHeroColor(selectedHero)} flex items-center justify-center text-2xl`}>
                {getHeroIcon(selectedHero)}
              </div>
              <div className="min-w-0 text-left">
                <h2 className="text-base font-black text-white leading-none">{hero.displayName}</h2>
                <p className="text-[11px] text-indigo-200/80 mt-1 leading-snug">{hero.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2 text-[10px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-md bg-black/40 border border-red-500/30 px-2 py-1 text-red-200">
                <Heart className="w-3 h-3" /> {hero.baseHp} HP
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-black/40 border border-amber-500/30 px-2 py-1 text-amber-200">
                <Zap className="w-3 h-3" /> {hero.baseAttack} ATK
              </span>
              <span className="inline-flex items-center rounded-md bg-black/40 border border-cyan-500/30 px-2 py-1 text-cyan-200">
                {hero.specialStat}
              </span>
            </div>

            <p className="text-[11px] text-purple-100/90 leading-snug mb-2 flex gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-300" />
              <span>{hero.passive}</span>
            </p>

            <div className="space-y-1.5">
              {hero.abilities.map((ability) => (
                <div key={ability.id} className="rounded-lg bg-indigo-950/50 border border-indigo-500/20 px-2.5 py-1.5 text-left">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{ability.name}</span>
                    <span className="shrink-0 text-[9px] text-yellow-300/90">⚡ {ability.energyCost} · CD {ability.cooldown}</span>
                  </div>
                  <p className="text-[10px] text-indigo-200/70 leading-snug mt-0.5">{ability.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 shrink-0">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-black text-xs text-white uppercase tracking-wider transition-all border border-white/15 cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-black text-xs text-white uppercase tracking-wider transition-all border border-indigo-400 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Confirmar
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
