/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Monster } from '../types.ts';
import { Sword, Heart, Zap, Briefcase, ArrowLeft, Shield, Sparkles, Ghost, Skull, ChevronRight, Scroll, X } from 'lucide-react';
import Character3D from './Character3D.tsx';
import Monster3D from './Monster3D.tsx';
import { soundManager } from '../utils/audio.ts';

interface CombatSceneProps {
  gameState: GameState;
  onWin: (state: GameState) => void;
  onGameOver: () => void;
}

interface FloatingVFX {
  id: number;
  text: string;
  color: string;
  isMonster: boolean;
}

export default function CombatScene({ gameState, onWin, onGameOver }: CombatSceneProps) {
  const isFinalBoss = gameState.currentScene === 'final-boss';
  
  // Lista de monstruos del juego
  const ALL_MONSTERS: Monster[] = [
    { id: 'shadow-1', name: 'Sombra Ferina', level: 1, hp: 40, maxHp: 40, attack: 10, type: 'basic', image: '/images/shadow.png' },
    { id: 'shadow-2', name: 'Sombra Nocturna', level: 2, hp: 45, maxHp: 45, attack: 11, type: 'basic', image: '/images/shadow.png' },
    { id: 'ghoul-1', name: 'Ghoul de Ceniza', level: 2, hp: 60, maxHp: 60, attack: 12, type: 'basic', image: '/images/ghoul.png' },
    { id: 'ghoul-2', name: 'Ghoul Antiguo', level: 3, hp: 65, maxHp: 65, attack: 13, type: 'basic', image: '/images/ghoul.png' },
    { id: 'beast-1', name: 'Bestia Mágica', level: 3, hp: 80, maxHp: 80, attack: 15, type: 'basic', image: '/images/beast.png' },
    { id: 'beast-2', name: 'Bestia Salvaje', level: 4, hp: 85, maxHp: 85, attack: 16, type: 'basic', image: '/images/beast.png' },
    { id: 'guardian-1', name: 'Guardián de Piedra', level: 4, hp: 100, maxHp: 100, attack: 18, type: 'basic', image: '/images/guardian.png' },
    { id: 'guardian-2', name: 'Guardián Arcano', level: 5, hp: 110, maxHp: 110, attack: 20, type: 'basic', image: '/images/guardian.png' },
    { id: 'wraith', name: 'Espectro Errante', level: 3, hp: 55, maxHp: 55, attack: 14, type: 'basic', image: '/images/wraith.png' },
    { id: 'golem', name: 'Golem de Ruinas', level: 5, hp: 120, maxHp: 120, attack: 22, type: 'basic', image: '/images/golem.png' },
    { id: 'spirit', name: 'Espíritu Antiguo', level: 4, hp: 70, maxHp: 70, attack: 13, type: 'basic', image: '/images/spirit.png' },
    { id: 'ice-giant', name: 'Gigante de Hielo', level: 4, hp: 95, maxHp: 95, attack: 17, type: 'basic', image: '/images/giant.png' },
    { id: 'demon', name: 'Demonio Errante', level: 5, hp: 75, maxHp: 75, attack: 15, type: 'basic', image: '/images/demon.png' },
    { id: 'dark-knight', name: 'Caballero Oscuro', level: 6, hp: 105, maxHp: 105, attack: 19, type: 'basic', image: '/images/knight.png' },
    { id: 'titan', name: 'Titán Maldito', level: 7, hp: 130, maxHp: 130, attack: 23, type: 'basic', image: '/images/titan.png' },
  ];

  const [monster, setMonster] = useState<Monster>(() => {
    if (isFinalBoss) {
      return { id: 'colossus', name: 'COLOSO DEL CAOS', level: 10, hp: 500, maxHp: 500, attack: 25, type: 'boss', image: '/images/colossus.png' };
    }
    const monsterIds = gameState.plannedEncounters[gameState.currentScene] || [];
    const currentMonsterId = monsterIds[gameState.currentEncounterId] || monsterIds[0];
    const monsterData = ALL_MONSTERS.find(m => m.id === currentMonsterId);
    return monsterData || ALL_MONSTERS[0];
  });

  const [playerHp, setPlayerHp] = useState(gameState.player.hp);
  const [playerEnergy, setPlayerEnergy] = useState(gameState.player.energy);
  const [isTransformed, setIsTransformed] = useState(gameState.player.isTransformed);
  const [shieldActive, setShieldActive] = useState(gameState.player.shieldActive);
  const [inventory, setInventory] = useState<string[]>(gameState.inventory);
  const [playerAttack, setPlayerAttack] = useState(gameState.player.attack);
  
  const [isFriendActive, setIsFriendActive] = useState(false);
  const [turn, setTurn] = useState<'player' | 'monster'>('player');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Animaciones y modo de vista
  const [playerAction, setPlayerAction] = useState<'idle' | 'attack' | 'heal' | 'damage' | 'shield'>('idle');
  const [monsterAction, setMonsterAction] = useState<'idle' | 'attack' | 'damage'>('idle');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  // Historial de combate y VFX flotantes
  const [logs, setLogs] = useState<string[]>(['¡Encuentro hostil comenzado! Prepárate para combatir.']);
  const [vfxList, setVfxList] = useState<FloatingVFX[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    show: boolean;
    level: number;
    prevLevel: number;
    maxHp: number;
    prevMaxHp: number;
    attack: number;
    prevAttack: number;
    newState: GameState | null;
  }>({
    show: false,
    level: 1,
    prevLevel: 1,
    maxHp: 100,
    prevMaxHp: 100,
    attack: 10,
    prevAttack: 10,
    newState: null
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Añadir mensaje de log
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const getLogColorAndStyle = (log: string) => {
    if (log.startsWith('⚔️')) return 'text-cyan-300';
    if (log.startsWith('💚')) return 'text-emerald-400 font-semibold';
    if (log.startsWith('💥')) return 'text-rose-400 font-semibold';
    if (log.startsWith('🛡️')) return 'text-sky-300';
    if (log.startsWith('🔥')) return 'text-amber-400 font-black tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse';
    if (log.startsWith('⚡')) return 'text-yellow-400 font-bold';
    if (log.startsWith('📦')) return 'text-purple-300';
    if (log.startsWith('🐾')) return 'text-teal-300';
    if (log.startsWith('🦁')) return 'text-orange-300 font-semibold';
    if (log.startsWith('✨')) return 'text-indigo-300';
    if (log.startsWith('🌟')) return 'text-blue-300 font-bold';
    if (log.startsWith('💫')) return 'text-pink-300';
    if (log.startsWith('💀')) return 'text-red-500 font-black';
    return 'text-slate-100';
  };

  // Crear VFX flotante
  const spawnVFX = (text: string, color: string, isMonster: boolean) => {
    const id = Date.now() + Math.random();
    setVfxList(prev => [...prev, { id, text, color, isMonster }]);
    setTimeout(() => {
      setVfxList(prev => prev.filter(v => v.id !== id));
    }, 1000);
  };

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);
  };

  const triggerFlash = () => {
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 150);
  };

  // Nombres descriptivos para la UI de objetos
  const itemNames: Record<string, string> = {
    potion: 'Poción de Vida',
    elixir: 'Elixir de Fuerza',
    shield: 'Poción de Escudo',
    crystal: 'Cristal de Furia'
  };

  const itemDescriptions: Record<string, string> = {
    potion: 'Restaura +40 HP',
    elixir: 'Aumenta permanentemente +3 Ataque',
    shield: 'Absorbe por completo el siguiente ataque',
    crystal: 'Genera +50 de Energía Arcana'
  };

  // ATACAR
  const handleAttack = () => {
    if (turn !== 'player' || isAnimating || monster.hp <= 0) return;
    setIsAnimating(true);
    soundManager.playHit();

    // Animaciones físicas
    setPlayerAction('attack');
    setTimeout(() => {
      setMonsterAction('damage');
      setTimeout(() => {
        setMonsterAction('idle');
      }, 500);
    }, 200);
    setTimeout(() => {
      setPlayerAction('idle');
    }, 600);

    // Cálculo de daño
    const baseDmg = playerAttack + (gameState.player.level * 2);
    const finalDamage = isTransformed ? baseDmg * 2 : baseDmg;
    
    setMonster(prev => ({ ...prev, hp: Math.max(0, prev.hp - finalDamage) }));
    addLog(`⚔️ Héroe ataca a ${monster.name} causando ${finalDamage} de daño!`);
    spawnVFX(`-${finalDamage} HP`, isTransformed ? 'text-amber-400 font-extrabold' : 'text-red-500 font-bold', true);

    // Ganar energía
    if (!isTransformed) {
      const energyGain = 15;
      setPlayerEnergy(prev => {
        const next = Math.min(gameState.player.maxEnergy, prev + energyGain);
        if (next >= 100 && prev < 100) {
          addLog('⚡ ¡Tu energía arcana está al máximo! Desbloqueas la ASCENSIÓN.');
        }
        return next;
      });
    }

    setTimeout(() => {
      setTurn('monster');
      setIsAnimating(false);
    }, 900);
  };

  // CURAR
  const handleHeal = () => {
    if (turn !== 'player' || isAnimating || monster.hp <= 0) return;
    setIsAnimating(true);
    soundManager.playHeal();

    setPlayerAction('heal');
    setTimeout(() => {
      setPlayerAction('idle');
    }, 600);

    const healAmount = 35;
    setPlayerHp(prev => Math.min(gameState.player.maxHp, prev + healAmount));
    addLog(`💚 Héroe usa magia curativa y restaura +${healAmount} HP.`);
    spawnVFX(`+${healAmount} HP`, 'text-emerald-400 font-bold', false);

    // Ganar energía
    if (!isTransformed) {
      const energyGain = 10;
      setPlayerEnergy(prev => {
        const next = Math.min(gameState.player.maxEnergy, prev + energyGain);
        if (next >= 100 && prev < 100) {
          addLog('⚡ ¡Tu energía arcana está al máximo! Desbloqueas la ASCENSIÓN.');
        }
        return next;
      });
    }

    setTimeout(() => {
      setTurn('monster');
      setIsAnimating(false);
    }, 900);
  };

  // USAR OBJETO
  const handleUseItem = (itemKey: string) => {
    if (turn !== 'player' || isAnimating || monster.hp <= 0) return;
    setIsAnimating(true);
    soundManager.playItem();

    // Eliminar un objeto del inventario local
    const itemIdx = inventory.indexOf(itemKey);
    if (itemIdx === -1) return;
    const newInventory = [...inventory];
    newInventory.splice(itemIdx, 1);
    setInventory(newInventory);

    addLog(`📦 Héroe consume ${itemNames[itemKey]} de su inventario.`);
    setShowItems(false);

    if (itemKey === 'potion') {
      setPlayerAction('heal');
      setTimeout(() => setPlayerAction('idle'), 600);
      const healAmount = 40;
      setPlayerHp(prev => Math.min(gameState.player.maxHp, prev + healAmount));
      spawnVFX(`+${healAmount} HP`, 'text-emerald-400 font-bold', false);
    } else if (itemKey === 'elixir') {
      setPlayerAction('heal');
      setTimeout(() => setPlayerAction('idle'), 600);
      setPlayerAttack(prev => prev + 3);
      addLog(`✨ ¡Tu ataque base ha aumentado en +3 permanentemente!`);
      spawnVFX(`+3 ATK`, 'text-purple-400 font-bold', false);
    } else if (itemKey === 'shield') {
      setPlayerAction('shield');
      setTimeout(() => setPlayerAction('idle'), 600);
      setShieldActive(true);
      addLog(`🛡️ Escudo de runas activado. Bloqueará el siguiente ataque.`);
      spawnVFX(`ESCUDO`, 'text-cyan-400 font-bold', false);
    } else if (itemKey === 'crystal') {
      setPlayerAction('heal');
      setTimeout(() => setPlayerAction('idle'), 600);
      setPlayerEnergy(prev => {
        const next = Math.min(gameState.player.maxEnergy, prev + 50);
        if (next >= 100 && prev < 100) {
          addLog('⚡ ¡Tu energía arcana está al máximo! Desbloqueas la ASCENSIÓN.');
        }
        return next;
      });
      spawnVFX(`+50 ENERGÍA`, 'text-indigo-400 font-bold', false);
    }

    setTimeout(() => {
      setTurn('monster');
      setIsAnimating(false);
    }, 900);
  };

  // ASCENSIÓN
  const handleAscension = () => {
    if (isTransformed || playerEnergy < 100 || !gameState.player.transformationUnlocked) return;
    soundManager.playAscension();
    setIsTransformed(true);
    addLog(`🔥 ¡ASCENSIÓN ACTIVADA! Tu núcleo de cristal brilla con furia arcana. Tu daño se duplica.`);
    spawnVFX(`ASCENSIÓN`, 'text-amber-400 font-black', false);
  };

  // Turno del Monstruo y efectos de fin de turno
  useEffect(() => {
    if (turn === 'monster' && monster.hp > 0 && playerHp > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(true);

        // 1. Drenar energía si está transformado
        let nextTransformed = isTransformed;
        let nextEnergy = playerEnergy;
        if (isTransformed) {
          nextEnergy = Math.max(0, playerEnergy - 25);
          setPlayerEnergy(nextEnergy);
          if (nextEnergy <= 0) {
            nextTransformed = false;
            setIsTransformed(false);
            addLog('💫 El modo Ascensión ha finalizado. Tu cristal recupera su flujo normal.');
          }
        }

        // 2. Acción de la mascota (Pet)
        let petActionHappened = false;
        let nextMonsterHp = monster.hp;
        let nextPlayerHp = playerHp;

        if (gameState.hasPet) {
          petActionHappened = true;
          soundManager.playClick();
          if (Math.random() < 0.5) {
            // Curar
            nextPlayerHp = Math.min(gameState.player.maxHp, playerHp + 5);
            setPlayerHp(nextPlayerHp);
            setPlayerAction('heal');
            setTimeout(() => setPlayerAction('idle'), 500);
            addLog('🐾 Tu zorro arcano te lame las heridas y te cura +5 HP.');
            spawnVFX('+5 HP', 'text-teal-400 text-xs', false);
          } else {
            // Atacar
            nextMonsterHp = Math.max(0, monster.hp - 5);
            setMonster(prev => ({ ...prev, hp: nextMonsterHp }));
            setMonsterAction('damage');
            setTimeout(() => setMonsterAction('idle'), 500);
            addLog(`🐾 Tu zorro arcano muerde a ${monster.name} por 5 de daño.`);
            spawnVFX('-5 HP', 'text-teal-400 text-xs', true);
          }
        }

        // 2.5. Acción del León (Lion)
        let lionActionHappened = false;
        if (gameState.hasLion && nextMonsterHp > 0) {
          lionActionHappened = true;
          soundManager.playClick();
          const lionDmg = 8;
          nextMonsterHp = Math.max(0, nextMonsterHp - lionDmg);
          setMonster(prev => ({ ...prev, hp: nextMonsterHp }));
          setMonsterAction('damage');
          setTimeout(() => setMonsterAction('idle'), 500);
          addLog(`🦁 Tu León Astral ruge con fuerza e inflige ${lionDmg} de daño solar.`);
          spawnVFX(`-${lionDmg} HP`, 'text-amber-400 text-xs font-semibold', true);
        }

        // 3. Acción del amigo (Final Boss solamente)
        if (isFriendActive && nextMonsterHp > 0) {
          const friendDmg = 15;
          nextMonsterHp = Math.max(0, nextMonsterHp - friendDmg);
          setMonster(prev => ({ ...prev, hp: nextMonsterHp }));
          setMonsterAction('damage');
          setTimeout(() => setMonsterAction('idle'), 500);
          addLog(`✨ Tu amigo recuperado conjura un haz de luz infligiendo ${friendDmg} de daño al Coloso.`);
          spawnVFX(`-${friendDmg} HP`, 'text-blue-300 font-bold', true);
        }

        // Si el monstruo muere debido a la mascota o amigo
        if (nextMonsterHp <= 0) {
          setIsAnimating(false);
          return;
        }

        // 4. Ataque del monstruo
        setTimeout(() => {
          // Animación física del monstruo
          setMonsterAction('attack');
          setTimeout(() => {
            setMonsterAction('idle');
          }, 600);

          if (shieldActive) {
            setShieldActive(false);
            setPlayerAction('shield');
            setTimeout(() => setPlayerAction('idle'), 600);
            addLog(`🛡️ ¡El Escudo de Runas absorbe por completo el ataque de ${monster.name}!`);
            spawnVFX('BLOQUEADO', 'text-cyan-400 font-bold', false);
            soundManager.playHit();
          } else {
            const damage = monster.attack;
            setPlayerHp(prev => Math.max(0, prev - damage));
            setPlayerAction('damage');
            setTimeout(() => setPlayerAction('idle'), 600);
            addLog(`💥 ${monster.name} arremete contra ti causando ${damage} de daño.`);
            spawnVFX(`-${damage} HP`, 'text-red-500 font-bold animate-bounce', false);
            soundManager.playHit();
            triggerShake();
            triggerFlash();

            // Ganar energía al recibir daño
            if (!nextTransformed) {
              setPlayerEnergy(prev => {
                const next = Math.min(gameState.player.maxEnergy, prev + 10);
                if (next >= 100 && prev < 100) {
                  addLog('⚡ ¡Tu energía arcana está al máximo! Desbloqueas la ASCENSIÓN.');
                }
                return next;
              });
            }
          }

          setTimeout(() => {
            setTurn('player');
            setIsAnimating(false);
          }, 600);
        }, (petActionHappened || lionActionHappened) ? 700 : 0);

      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, monster.hp, playerHp, isTransformed, playerEnergy, shieldActive, isFriendActive, gameState.hasPet, gameState.hasLion]);

  // Invocar al amigo si la vida del Coloso baja del 50%
  useEffect(() => {
    if (isFinalBoss && monster.hp < 250 && !isFriendActive) {
      addLog("🌟 ¡Tu mejor amigo revive impulsado por la magia de las ruinas y se une al combate!");
      setIsFriendActive(true);
      soundManager.playLevelUp();
    }
  }, [monster.hp, isFinalBoss, isFriendActive]);

  // Verificar fin de combate (Victoria o Derrota)
  useEffect(() => {
    if (monster.hp <= 0) {
      const timer = setTimeout(() => {
        soundManager.playVictory();
        
        const currentDefeated = gameState.defeatedMonsters[gameState.currentScene] || [];
        const updatedDefeated = {
          ...gameState.defeatedMonsters,
          [gameState.currentScene]: [...currentDefeated, monster.id]
        };

        const expGained = isFinalBoss ? 1000 : 50;
        let nextExp = gameState.player.exp + expGained;
        let nextLevel = gameState.player.level;
        let nextMaxHp = gameState.player.maxHp;
        let nextAttack = playerAttack;
        let levelUpHappened = false;

        // Subir de nivel si alcanza 100 EXP
        if (nextExp >= 100 && !isFinalBoss) {
          nextLevel += 1;
          nextExp -= 100;
          nextMaxHp += 15;
          nextAttack += 2;
          levelUpHappened = true;
        }

        const newState: GameState = {
          ...gameState,
          inventory: inventory, // Mantener los cambios del inventario
          defeatedMonsters: updatedDefeated,
          currentEncounterId: gameState.currentEncounterId + 1,
          monstersDefeated: gameState.monstersDefeated + 1,
          player: {
            ...gameState.player,
            hp: levelUpHappened ? nextMaxHp : playerHp, // Sanar si sube de nivel
            maxHp: nextMaxHp,
            attack: nextAttack,
            level: nextLevel,
            exp: nextExp,
            energy: playerEnergy,
            isTransformed: false, // Resetear transformación
            shieldActive: false
          }
        };

        if (levelUpHappened) {
          soundManager.playLevelUp();
          setLevelUpData({
            show: true,
            level: nextLevel,
            prevLevel: gameState.player.level,
            maxHp: nextMaxHp,
            prevMaxHp: gameState.player.maxHp,
            attack: nextAttack,
            prevAttack: gameState.player.attack,
            newState: newState
          });
        } else {
          onWin(newState);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (playerHp <= 0) {
      const timer = setTimeout(() => {
        soundManager.playDefeat();
        addLog('💀 Has caído en combate... El reino se sume en el caos.');
        setTimeout(onGameOver, 1500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [monster.hp, playerHp]);

  // Agrupar inventario para contadores
  const groupedInventory = inventory.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hasItems = inventory.length > 0;

  return (
    <motion.div 
      animate={screenShake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.1, repeat: 4 }}
      className="relative h-full w-full flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden z-10 select-none"
    >
      {/* Damage Flash */}
      <AnimatePresence>
        {damageFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600/40 z-90 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Floating VFX Numbers */}
      <div className="absolute inset-0 z-80 pointer-events-none">
        <AnimatePresence>
          {vfxList.map(vfx => (
            <motion.div
              key={vfx.id}
              initial={{ opacity: 1, y: 30, scale: 0.8 }}
              animate={{ opacity: 0, y: -70, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className={`absolute font-black text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] 
                ${vfx.color} 
                ${vfx.isMonster 
                  ? 'top-[22%] left-[65%] md:left-[60%]' 
                  : 'top-[42%] left-[25%] md:left-[35%]'
                }`}
            >
              {vfx.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-radial from-[#1e1b4b]/20 to-[#020617]/50 pointer-events-none" />

      {/* Título de Combate e Interruptor de Vista */}
      <div className="mt-10 md:mt-14 flex items-center gap-3 select-none z-20">
        <div className="px-4 md:px-6 py-1 bg-red-950/40 backdrop-blur-md border border-red-500/20 rounded-full flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></span>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-red-400">Combate de Supervivencia</span>
        </div>
        
        {/* Toggle 2D/3D */}
        <button
          onClick={() => {
            soundManager.playClick();
            setViewMode(prev => prev === '2d' ? '3d' : '2d');
          }}
          className="px-3 py-1 bg-indigo-950/40 hover:bg-indigo-950/70 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-400/40 rounded-full flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase text-indigo-300 hover:text-indigo-100 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        >
          <span>👁️ {viewMode === '2d' ? 'VISTA 3D' : 'VISTA 2D'}</span>
        </button>
      </div>

      {/* Cinematic Battle Ticker */}
      <div className="w-full max-w-xl px-4 mt-2 md:mt-3 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={logs.length}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-950/80 backdrop-blur-md border border-indigo-500/30 rounded-full py-1.5 md:py-2 px-3 md:px-4 shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-between gap-2.5 text-center mx-auto"
          >
            <div className="flex-1 flex items-center justify-center gap-1.5 overflow-hidden">
              <span className="text-sm">📢</span>
              <span className={`text-[10px] md:text-xs font-semibold tracking-wide truncate ${getLogColorAndStyle(logs[logs.length - 1] || '')}`}>
                {logs[logs.length - 1] || '¡El combate ha comenzado!'}
              </span>
            </div>
            
            <button
              onClick={() => {
                soundManager.playClick();
                setShowHistory(true);
              }}
              className="p-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/20 hover:border-indigo-400/40 text-indigo-300 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              title="Historial de Combate"
            >
              <Scroll className="w-3 md:w-3.5 h-3 md:h-3.5" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cuerpo del Combate: Héroe y Monstruo Side by Side */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-2.5 md:gap-6 items-stretch justify-center flex-1 my-2 md:my-4 min-h-0 overflow-y-auto md:overflow-hidden scrollbar-none py-1">
        
        {/* Lado Izquierdo: HÉROE */}
        <motion.div
          animate={
            playerAction === 'attack' ? { x: [0, 40, 0], scale: [1, 1.03, 1] } :
            playerAction === 'heal' ? { y: [0, -15, 0], scale: [1, 1.04, 1] } :
            playerAction === 'damage' ? { x: [-8, 8, -6, 6, -4, 4, 0] } :
            playerAction === 'shield' ? { scale: [1, 0.96, 1] } : {}
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 bg-slate-950/20 backdrop-blur-xs border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[240px] md:min-h-0"
        >
          {/* Indicador de transformación */}
          {isTransformed && (
            <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500 animate-pulse shadow-[0_0_15px_#f59e0b]" />
          )}

          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <span className="text-[8px] md:text-[10px] font-black tracking-widest text-indigo-400 uppercase">HÉROE</span>
            <div className="flex gap-1 md:gap-2">
              {shieldActive && (
                <div className="px-1.5 py-0.5 bg-cyan-900/50 border border-cyan-400 rounded-sm text-[6px] md:text-[8px] font-black text-cyan-300 flex items-center gap-0.5 md:gap-1">
                  <Shield className="w-2 md:w-2.5 h-2 md:h-2.5" /> <span className="hidden sm:inline">ESCUDO</span>
                </div>
              )}
              {isTransformed && (
                <div className="px-1.5 py-0.5 bg-amber-950/60 border border-amber-400 rounded-sm text-[6px] md:text-[8px] font-black text-amber-400 flex items-center gap-0.5 md:gap-1 animate-pulse">
                  <Zap className="w-2 md:w-2.5 h-2 md:h-2.5" /> <span className="hidden sm:inline">ASCENDIDO</span>
                </div>
              )}
            </div>
          </div>

          {/* Canvas 3D Procedural */}
          <div className="flex-1 min-h-[90px] md:min-h-[220px] flex items-center justify-center overflow-hidden">
            <Character3D isTransformed={isTransformed} />
          </div>

          {/* Estadísticas e HP del Jugador */}
          <div className="mt-2 md:mt-4 space-y-1.5 md:space-y-3">
            <div>
              <div className="flex justify-between text-[9px] md:text-xs font-black italic mb-0.5 md:mb-1 text-white/90">
                <span className="hidden sm:inline">PUNTOS DE VIDA</span>
                <span className="sm:hidden">HP</span>
                <span>{playerHp} / {gameState.player.maxHp} HP</span>
              </div>
              <div className="h-2 md:h-3 bg-black/40 border border-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  animate={{ width: `${(playerHp / gameState.player.maxHp) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9px] md:text-xs font-black italic mb-0.5 md:mb-1 text-indigo-300">
                <span className="hidden sm:inline">ENERGÍA ARCANA</span>
                <span className="sm:hidden">AP</span>
                <span>{playerEnergy} / 100 AP</span>
              </div>
              <div className="h-1.5 md:h-2 bg-black/40 border border-indigo-900/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  animate={{ width: `${playerEnergy}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lado Derecho: MONSTRUO */}
        <motion.div
          animate={
            monsterAction === 'attack' ? { x: [0, -40, 0], scale: [1, 1.03, 1] } :
            monsterAction === 'damage' ? { x: [8, -8, 6, -6, 4, -4, 0] } : {}
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 bg-slate-950/20 backdrop-blur-xs border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl min-h-[240px] md:min-h-0"
        >
          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <span className="text-[8px] md:text-[10px] font-black tracking-widest text-red-400 uppercase">ENEMIGO</span>
            {(monster.id === 'titan' || monster.id === 'golem' || monster.id === 'colossus') ? (
              <span className="px-1.5 py-0.5 bg-purple-950/60 border border-purple-400 rounded-sm text-[6px] md:text-[8px] font-black text-purple-300 animate-pulse">
                ELITE
              </span>
            ) : (
              <span className="text-[6px] md:text-[8px] font-black px-1.5 py-0.5 bg-red-950/60 border border-red-500/30 rounded-sm text-red-400">
                NIVEL {monster.level}
              </span>
            )}
          </div>

          {/* Imagen o Modelo 3D de Enemigo */}
          <div className="flex-1 flex items-center justify-center min-h-[90px] md:min-h-[220px] overflow-hidden w-full h-full">
            <motion.div
              animate={{
                scale: monster.hp <= 0 ? 0 : 1,
                y: [0, -6, 0]
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {viewMode === '3d' ? (
                <Monster3D monsterId={monster.id} />
              ) : monster.image ? (
                <img
                  src={monster.image}
                  alt={monster.name}
                  className="w-24 sm:w-28 md:w-44 h-24 sm:h-28 md:h-44 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <Ghost className="w-12 md:w-20 h-12 md:h-20 text-white/20" />
              )}
            </motion.div>
          </div>

          {/* HP del Monstruo */}
          <div className="mt-2 md:mt-4">
            <div className="flex justify-between text-[9px] md:text-xs font-black italic mb-0.5 md:mb-1 text-white/90">
              <span className="uppercase truncate max-w-[60px] sm:max-w-none">{monster.name}</span>
              <span>{monster.hp} / {monster.maxHp} HP</span>
            </div>
            <div className="h-2 md:h-3 bg-black/40 border border-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_10px_rgba(185,28,28,0.5)]"
                animate={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Panel de Controles / Interfaz de Usuario */}
      <div className="w-full max-w-md relative z-20 mb-4">
        <AnimatePresence mode="wait">
          {showItems ? (
            /* Menú de Objetos (Inventario) */
            <motion.div
              key="items-panel"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="frosted-glass border-white/20 p-5 rounded-2xl flex flex-col gap-3 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs font-black italic tracking-widest text-indigo-300">MOCHILA DE OBJETOS</span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowItems(false);
                  }}
                  className="p-1 text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {hasItems ? (
                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                  {Object.keys(groupedInventory).map(itemKey => (
                    <button
                      key={itemKey}
                      onClick={() => handleUseItem(itemKey)}
                      disabled={turn !== 'player' || isAnimating}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all text-left group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors uppercase">
                          {itemNames[itemKey]} <span className="text-indigo-400 font-black ml-1">x{groupedInventory[itemKey]}</span>
                        </div>
                        <div className="text-[9px] text-white/40 mt-0.5">{itemDescriptions[itemKey]}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-white/30 italic">
                  Tu mochila está vacía...
                </div>
              )}
            </motion.div>
          ) : (
            /* Panel de Acciones Normales */
            <motion.div
              key="actions-panel"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="grid grid-cols-2 gap-3 w-full px-2"
            >
              {/* ATACAR */}
              <button
                onClick={handleAttack}
                disabled={turn !== 'player' || isAnimating || monster.hp <= 0}
                className="flex items-center justify-center gap-2 py-3 frosted-glass border-white/20 hover:bg-indigo-600/10 hover:border-indigo-500/30 rounded-xl transition-all active:scale-95 disabled:opacity-30 group shadow-md cursor-pointer"
              >
                <Sword className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black italic tracking-widest uppercase">ATACAR</span>
              </button>

              {/* CURAR */}
              <button
                onClick={handleHeal}
                disabled={turn !== 'player' || isAnimating || monster.hp <= 0}
                className="flex items-center justify-center gap-2 py-3 frosted-glass border-white/20 hover:bg-emerald-600/10 hover:border-emerald-500/30 rounded-xl transition-all active:scale-95 disabled:opacity-30 group shadow-md cursor-pointer"
              >
                <Heart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black italic tracking-widest uppercase">CURAR</span>
              </button>

              {/* MOCHILA */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowItems(true);
                }}
                disabled={turn !== 'player' || isAnimating || monster.hp <= 0}
                className="flex items-center justify-center gap-2 py-3 frosted-glass border-white/20 hover:bg-purple-600/10 hover:border-purple-500/30 rounded-xl transition-all active:scale-95 disabled:opacity-30 group shadow-md cursor-pointer text-xs font-black italic"
              >
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-black italic tracking-widest uppercase">MOCHILA ({inventory.length})</span>
              </button>

              {/* Botón de Ascensión / Transformación */}
              <button
                onClick={handleAscension}
                disabled={!gameState.player.transformationUnlocked || playerEnergy < 100 || isTransformed || turn !== 'player' || isAnimating || monster.hp <= 0}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black italic text-[10px] tracking-widest uppercase border select-none
                  ${!gameState.player.transformationUnlocked 
                    ? 'bg-zinc-800/10 border-white/5 opacity-25 cursor-not-allowed text-white/30' 
                    : playerEnergy < 100
                    ? 'bg-indigo-950/20 border-indigo-500/10 opacity-50 cursor-not-allowed text-indigo-400/50'
                    : isTransformed
                    ? 'bg-amber-950/40 border-amber-400/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                    : 'bg-amber-500 border-amber-300 text-black hover:scale-102 active:scale-98 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce'
                  }`}
              >
                <Zap className="w-4 h-4" />
                {isTransformed ? 'ASCENDIDO' : 'ASCENSIÓN'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Aliados flotantes o HUD lateral */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-none">
        {gameState.hasPet && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center border border-teal-500/40 shadow-inner">
              <span className="text-xl">🦊</span>
            </div>
            <span className="text-[8px] font-black text-teal-400 tracking-widest uppercase">ZORRO ARCANE</span>
          </motion.div>
        )}

        {gameState.hasLion && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40 shadow-inner">
              <span className="text-xl">🦁</span>
            </div>
            <span className="text-[8px] font-black text-amber-400 tracking-widest uppercase">LEÓN ASTRAL</span>
          </motion.div>
        )}

        {isFriendActive && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/40 shadow-inner">
              <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
            <span className="text-[8px] font-black text-blue-400 tracking-widest uppercase">AMIGO</span>
          </motion.div>
        )}
      </div>

      {/* Historial Completo (Sidebar Drawer) */}
      <AnimatePresence>
        {showHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/60 z-40 cursor-pointer pointer-events-auto"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-slate-950/95 backdrop-blur-md border-l border-white/10 z-50 p-6 flex flex-col pointer-events-auto shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-black italic tracking-widest text-indigo-300">HISTORIAL DE COMBATE</span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowHistory(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                {logs.map((log, index) => (
                  <div key={index} className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono leading-relaxed ${getLogColorAndStyle(log)}`}>
                    <span className="text-white/20 mr-1.5 font-sans">[{index + 1}]</span>
                    {log}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Subida de Nivel */}
      <AnimatePresence>
        {levelUpData.show && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-90 pointer-events-auto"
            />

            {/* Modal Content */}
            <div className="absolute inset-0 flex items-center justify-center z-100 p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -30 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-full max-w-md frosted-glass border-2 border-yellow-500/30 p-6 md:p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] pointer-events-auto relative overflow-hidden flex flex-col gap-6"
              >
                {/* Glow effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Animated Header */}
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-linear-to-b from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-yellow-300"
                  >
                    <Sparkles className="w-8 h-8 text-slate-950" />
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] uppercase">
                    ¡SUBIDA DE NIVEL!
                  </h3>
                  <div className="h-0.5 w-24 bg-linear-to-r from-transparent via-yellow-500 to-transparent" />
                </div>

                {/* Level indicators */}
                <div className="flex justify-center items-center gap-6 my-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Nivel anterior</span>
                    <div className="text-2xl font-black text-slate-500 italic mt-1">{levelUpData.prevLevel}</div>
                  </div>
                  <div className="text-xl font-bold text-yellow-400 animate-pulse">➔</div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-yellow-400 tracking-wider uppercase">Nuevo nivel</span>
                    <div className="text-5xl font-black bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-transparent italic drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{levelUpData.level}</div>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Tus flujos arcanos se han estabilizado. Tu poder aumenta y la energía del mundo te ha <span className="text-emerald-400 font-bold font-sans">sanado por completo</span>.
                </p>

                {/* Stat Changes */}
                <div className="bg-slate-950/60 rounded-2xl border border-white/5 p-4 flex flex-col gap-2.5 text-left max-w-sm mx-auto w-full">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Vida Máxima (HP)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{levelUpData.prevMaxHp}</span>
                      <span className="text-yellow-400">➔</span>
                      <span className="text-emerald-400 font-bold font-sans">+{levelUpData.maxHp - levelUpData.prevMaxHp}</span>
                      <span className="text-white font-bold">{levelUpData.maxHp}</span>
                    </div>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Ataque base</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{levelUpData.prevAttack}</span>
                      <span className="text-yellow-400">➔</span>
                      <span className="text-emerald-400 font-bold font-sans">+{levelUpData.attack - levelUpData.prevAttack}</span>
                      <span className="text-white font-bold">{levelUpData.attack}</span>
                    </div>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setLevelUpData(prev => ({ ...prev, show: false }));
                    if (levelUpData.newState) {
                      onWin(levelUpData.newState);
                    }
                  }}
                  className="w-full max-w-xs mx-auto py-3 md:py-4 rounded-xl bg-linear-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black tracking-widest text-xs uppercase shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer border border-yellow-300/40"
                >
                  Continuar Aventura
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
