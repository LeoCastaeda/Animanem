/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Monster } from '../types.ts';
import { Sword, Shield, Zap, Heart, Sparkles, Skull, Ghost } from 'lucide-react';
import Character3D from './Character3D.tsx';

interface CombatSceneProps {
  gameState: GameState;
  onWin: (state: GameState) => void;
  onGameOver: () => void;
}

export default function CombatScene({ gameState, onWin, onGameOver }: CombatSceneProps) {
  const isFinalBoss = gameState.currentScene === 'final-boss';
  
  // Monstruos disponibles por escena
  const ALL_MONSTERS: Monster[] = [
    { id: 'shadow-1', name: 'Sombra Ferina', hp: 40, maxHp: 40, attack: 10, type: 'basic', image: '/images/shadow.png' },
    { id: 'shadow-2', name: 'Sombra Nocturna', hp: 45, maxHp: 45, attack: 11, type: 'basic', image: '/images/shadow.png' },
    { id: 'ghoul-1', name: 'Ghoul de Ceniza', hp: 60, maxHp: 60, attack: 12, type: 'basic', image: '/images/ghoul.png' },
    { id: 'ghoul-2', name: 'Ghoul Antiguo', hp: 65, maxHp: 65, attack: 13, type: 'basic', image: '/images/ghoul.png' },
    { id: 'beast-1', name: 'Bestia Mágica', hp: 80, maxHp: 80, attack: 15, type: 'basic', image: '/images/beast.png' },
    { id: 'beast-2', name: 'Bestia Salvaje', hp: 85, maxHp: 85, attack: 16, type: 'basic', image: '/images/beast.png' },
    { id: 'guardian-1', name: 'Guardián de Piedra', hp: 100, maxHp: 100, attack: 18, type: 'basic', image: '/images/guardian.png' },
    { id: 'guardian-2', name: 'Guardián Arcano', hp: 110, maxHp: 110, attack: 20, type: 'basic', image: '/images/guardian.png' },
    { id: 'wraith', name: 'Espectro Errante', hp: 55, maxHp: 55, attack: 14, type: 'basic', image: '/images/wraith.png' },
    { id: 'golem', name: 'Golem de Ruinas', hp: 120, maxHp: 120, attack: 22, type: 'basic', image: '/images/golem.png' },
  ];

  // Monstruos por escena: beach(2), forest(3), ruins(4), city(5)
  const ENCOUNTER_COUNTS: Record<string, number> = {
    'intro': 0,
    'beach': 2,
    'forest': 3,
    'ruins': 4,
    'city': 5,
    'final-boss': 1,
    'ending': 0,
  };

  const generateSceneMonsters = () => {
    const count = ENCOUNTER_COUNTS[gameState.currentScene] || 0;
    const shuffled = [...ALL_MONSTERS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(m => m.id);
  };

  const [monster, setMonster] = useState<Monster>(() => {
    if (isFinalBoss) {
      return { id: 'colossus', name: 'COLOSO DEL CAOS', hp: 500, maxHp: 500, attack: 25, type: 'boss', image: '/images/colossus.png' };
    }

    // Si es la primera vez en esta escena, generar encuentros
    let monsterIds = gameState.sceneEncounters[gameState.currentScene] || [];
    if (monsterIds.length === 0) {
      monsterIds = generateSceneMonsters();
    }

    // Obtener el monstruo actual según currentEncounterId
    const currentMonsterId = monsterIds[gameState.currentEncounterId] || monsterIds[0];
    const monsterData = ALL_MONSTERS.find(m => m.id === currentMonsterId);
    
    return monsterData || ALL_MONSTERS[0];
  });

  const isGhoul = monster.id.startsWith('ghoul');
  const ghoulOffsetClass = isGhoul ? 'mt-4' : '';
  const ghoulObjectPosition = isGhoul ? 'object-top' : 'object-cover';

  const [playerHp, setPlayerHp] = useState(gameState.player.hp);
  const [isFriendActive, setIsFriendActive] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [turn, setTurn] = useState<'player' | 'monster'>('player');
  const [screenShake, setScreenShake] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);
  };

  const triggerFlash = () => {
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 150);
  };

  const attack = () => {
    if (turn !== 'player' || isAnimating) return;
    setIsAnimating(true);
    
    const damage = gameState.player.attack + (gameState.player.level * 2);
    const finalDamage = isFriendActive ? damage * 2 : damage;
    
    setMonster(prev => ({ ...prev, hp: Math.max(0, prev.hp - finalDamage) }));
    setNarrative(`¡Atacas a ${monster.name} causando ${finalDamage} de daño!`);
    
    setTimeout(() => {
      setTurn('monster');
      setIsAnimating(false);
    }, 1000);
  };

  const heal = () => {
    if (turn !== 'player' || isAnimating) return;
    setIsAnimating(true);
    
    const healAmount = 30;
    setPlayerHp(prev => Math.min(gameState.player.maxHp, prev + healAmount));
    setNarrative(`Usas magia curativa. +${healAmount} HP.`);
    
    setTimeout(() => {
      setTurn('monster');
      setIsAnimating(false);
    }, 1000);
  };

  // Monster Turn
  useEffect(() => {
    if (turn === 'monster' && monster.hp > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        const damage = monster.attack;
        setPlayerHp(prev => Math.max(0, prev - damage));
        setNarrative(`${monster.name} te ataca causando ${damage} de daño.`);
        triggerShake();
        triggerFlash();
        
        setTimeout(() => {
          setTurn('player');
          setIsAnimating(false);
        }, 1000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, monster.hp, monster.name, monster.attack]);

  // Friend Revival Logic (Final Boss only)
  useEffect(() => {
    if (isFinalBoss && monster.hp < 250 && !isFriendActive) {
      setNarrative("¡Tu mejor amigo revive con magia ancestral para ayudarte!");
      setIsFriendActive(true);
    }
  }, [monster.hp, isFinalBoss, isFriendActive]);

  // Check Win/Loss
  useEffect(() => {
    if (monster.hp <= 0) {
      const timer = setTimeout(() => {
        // Actualizar encuentros de la escena
        const currentEncounters = gameState.sceneEncounters[gameState.currentScene] || [];
        const updatedEncounters = {
          ...gameState.sceneEncounters,
          [gameState.currentScene]: [...new Set([...currentEncounters, monster.id])]
        };

        const ENCOUNTER_COUNTS: Record<string, number> = {
          'intro': 0, 'beach': 2, 'forest': 3, 'ruins': 4, 'city': 5, 'final-boss': 1, 'ending': 0,
        };

        const monstersInScene = ENCOUNTER_COUNTS[gameState.currentScene] || 0;
        const hasMoreEncounters = updatedEncounters[gameState.currentScene].length < monstersInScene;

        const newState = {
          ...gameState,
          sceneEncounters: updatedEncounters,
          currentEncounterId: hasMoreEncounters ? gameState.currentEncounterId + 1 : 0,
          monstersDefeated: gameState.monstersDefeated + 1,
          player: {
            ...gameState.player,
            hp: playerHp,
            exp: gameState.player.exp + (isFinalBoss ? 1000 : 50),
            level: gameState.player.level + (gameState.player.exp + 50 >= 100 ? 1 : 0),
          }
        };
        onWin(newState);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (playerHp <= 0) {
      const timer = setTimeout(onGameOver, 2000);
      return () => clearTimeout(timer);
    }
  }, [monster.hp, playerHp, gameState, onWin, onGameOver, isFinalBoss]);

  return (
    <motion.div 
      animate={screenShake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.1, repeat: 4 }}
      className="relative h-full w-full flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* Damage Flash */}
      <AnimatePresence>
        {damageFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 z-90 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className={`absolute inset-0 transition-all duration-1000 ${isFinalBoss ? 'bg-purple-900/10' : 'bg-red-900/5'}`} />
      
      {/* Monster Display */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="mb-4 px-6 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-red-300">Encuentro Hostil</span>
        </div>

        <motion.div
          animate={{ 
            scale: monster.hp <= 0 ? 0 : 1,
            y: [0, -10, 0],
            filter: isAnimating && turn === 'monster' ? 'brightness(1.5) contrast(1.2)' : 'brightness(1)'
          }}
          transition={{ duration: 0.5, y: { duration: 3, repeat: Infinity } }}
          className="relative w-64 h-64 flex items-center justify-center"
        >
          {monster.id === 'colossus' ? (
             <div className="w-56 h-56 rounded-full frosted-glass flex items-center justify-center relative overflow-hidden border-white/30 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                <div className="absolute inset-0 animate-spin bg-[conic-gradient(from_0deg,#6366f1,#a855f7,#6366f1)] opacity-20" />
                {monster.image ? (
                  <img src={monster.image} alt={monster.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Skull className="w-24 h-24 text-white/50" />
                )}
             </div>
          ) : (
            <div className={`w-full h-full frosted-glass rounded-3xl flex items-center justify-center border-white/20 ${ghoulOffsetClass}`}>
              {monster.image ? (
                <img src={monster.image} alt={monster.name} className={`w-full h-full ${ghoulObjectPosition} rounded-3xl`} />
              ) : (
                <Ghost className="w-24 h-24 text-white/20" />
              )}
              {/* Cuando tengas un modelo .glb, puedes agregarlo aquí: */}
              {/* <Character3D modelUrl="/path_to_your_model.glb" /> */}
            </div>
          )}
        </motion.div>

        <div className="mt-8 text-center">
          <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">{monster.name}</h3>
          <div className="w-64 h-2 bg-black/40 rounded-full mt-3 overflow-hidden border border-white/10">
            <motion.div 
              className="h-full bg-linear-to-r from-red-600 to-red-400 shadow-[0_0_10px_red]"
              initial={{ width: '100%' }}
              animate={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Narrative Overlay */}
      <div className="relative z-10 h-12 flex items-center justify-center mb-10">
        <p className="text-sm md:text-lg italic font-medium text-indigo-200/60 transition-opacity bg-white/5 px-6 py-2 rounded-lg backdrop-blur-sm border border-white/5">
          {narrative || "Esperando acción..."}
        </p>
      </div>

      {/* Player Actions */}
      <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm">
        <button 
          onClick={attack}
          disabled={turn !== 'player' || isAnimating || monster.hp <= 0}
          className="flex flex-col items-center justify-center gap-1 py-4 frosted-glass hover:bg-white/20 rounded-2xl transition-all active:scale-95 disabled:opacity-30 border-white/30 group"
        >
          <Sword className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black italic tracking-widest">ATACAR</span>
        </button>
        <button 
          onClick={heal}
          disabled={turn !== 'player' || isAnimating || monster.hp <= 0}
          className="flex flex-col items-center justify-center gap-1 py-4 frosted-glass hover:bg-white/20 rounded-2xl transition-all active:scale-95 disabled:opacity-30 border-white/30 group"
        >
          <Heart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black italic tracking-widest">CURAR</span>
        </button>
        <button 
          disabled={true}
          className="col-span-2 flex items-center justify-center gap-3 py-4 bg-indigo-600/20 border-2 border-indigo-400/30 rounded-2xl opacity-50 cursor-not-allowed"
        >
          <Zap className="w-5 h-5 text-indigo-400" /> 
          <span className="text-xs font-black italic">ASCENSIÓN (MODO BLOQUEADO)</span>
        </button>
      </div>

      {/* Friend Visual (Final Boss) */}
      <AnimatePresence>
        {isFriendActive && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute left-4 bottom-4 flex flex-col items-center gap-2"
          >
             <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center border border-blue-400/50">
               <Sparkles className="w-8 h-8 text-blue-300 animate-pulse" />
             </div>
             <span className="text-[10px] font-bold text-blue-400">AMIGO REVIVIDO</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
