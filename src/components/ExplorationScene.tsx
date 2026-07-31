/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, SceneId } from '../types.ts';
import { Sword, ChevronRight, Gift, Flame, Sparkles, Heart, HelpCircle, ShieldAlert, Sparkle } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';

interface ExplorationSceneProps {
  gameState: GameState;
  onCombatTrigger: () => void;
  onSceneComplete: (nextScene: SceneId) => void;
  onStateUpdate: (updates: Partial<GameState>) => void;
}

export default function ExplorationScene({ gameState, onCombatTrigger, onSceneComplete, onStateUpdate }: ExplorationSceneProps) {
  const currentScene = gameState.currentScene;
  const plannedEncounters = gameState.plannedEncounters[currentScene] || [];
  const currentEncounterId = gameState.currentEncounterId;
  const currentEncounter = plannedEncounters[currentEncounterId];

  // Estado local para controlar el flujo de eventos
  const [eventStep, setEventStep] = useState<'intro' | 'result'>('intro');
  const [eventResult, setEventResult] = useState('');

  // Estados específicos para el Minijuego 2D de Alineación de Runas
  const [cursorPos, setCursorPos] = useState(0);
  const [cursorDir, setCursorDir] = useState(1);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [targetStart, setTargetStart] = useState(40);
  const [minigameState, setMinigameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [isStopped, setIsStopped] = useState(false);

  // Inicializar o reiniciar los estados al entrar al minijuego
  useEffect(() => {
    if (currentEncounter && currentEncounter.startsWith('event:rune-alignment')) {
      setCursorPos(0);
      setCursorDir(1);
      setAttemptsLeft(3);
      setIsStopped(false);
      setMinigameState('playing');
      const start = Math.floor(20 + Math.random() * 45); // Zona objetivo aleatoria entre 20% y 65%
      setTargetStart(start);
    }
  }, [currentEncounter, currentEncounterId]);

  // Bucle de oscilación del cursor en requestAnimationFrame para suavidad
  useEffect(() => {
    if (!currentEncounter || !currentEncounter.startsWith('event:rune-alignment') || minigameState !== 'playing' || isStopped) return;

    let animFrameId: number;
    const speed = 2.4; // Ajuste de velocidad para oscilación fluida

    const updateLoop = () => {
      setCursorPos(prev => {
        let next = prev + cursorDir * speed;
        if (next >= 100) {
          next = 100;
          setCursorDir(-1);
        } else if (next <= 0) {
          next = 0;
          setCursorDir(1);
        }
        return next;
      });
      animFrameId = requestAnimationFrame(updateLoop);
    };

    animFrameId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [currentEncounter, minigameState, isStopped, cursorDir]);

  const sceneConfig = {
    'beach': {
      bg: 'radial-gradient(circle at 50% 100%, #1a365d 0%, #000 70%)',
      title: 'Playa de los Lamentos',
      desc: 'Arena negra y restos de naufragio. Sientes ojos observándote desde las sombras.',
      next: 'forest' as SceneId,
      nextName: 'Bosque de las Almas',
    },
    'forest': {
      bg: 'radial-gradient(circle at 50% 100%, #1c4532 0%, #000 70%)',
      title: 'Bosque de las Almas',
      desc: 'Árboles colosales que susurran secretos prohibidos. La magia aquí es densa.',
      next: 'ruins' as SceneId,
      nextName: 'Ruinas de Aethel',
    },
    'ruins': {
      bg: 'radial-gradient(circle at 50% 100%, #4a2c2c 0%, #000 70%)',
      title: 'Ruinas de Aethel',
      desc: 'Piedras antiguas impregnadas de sangre y gloria. Alguna vez fue un reino próspero.',
      next: 'city' as SceneId,
      nextName: 'Ciudadela de Neón',
    },
    'city': {
      bg: 'radial-gradient(circle at 50% 100%, #2d3748 0%, #000 70%)',
      title: 'Ciudadela de Neón',
      desc: 'Luces mágicas parpadean sobre las calles desiertas. El aire huele a ozono y miedo.',
      next: 'final-boss' as SceneId,
      nextName: 'El Núcleo del Caos',
    },
    'final-boss': {
      bg: 'radial-gradient(circle at 50% 100%, #44337a 0%, #000 70%)',
      title: 'El Núcleo del Caos',
      desc: 'La ciudad se retuerce... las realidades se fusionan. El Coloso despierta.',
      next: 'ending' as SceneId,
      nextName: 'Final',
    },
    'intro': { bg: '', title: '', desc: '', next: 'beach' as SceneId, nextName: '' },
    'ending': { bg: '', title: '', desc: '', next: 'intro' as SceneId, nextName: '' }
  };

  const current = sceneConfig[currentScene] || sceneConfig['beach'];

  const totalEncounters = plannedEncounters.length;
  const isAllDone = currentEncounterId >= totalEncounters && totalEncounters > 0;
  const isEvent = currentEncounter && currentEncounter.startsWith('event:');

  const getEncounterIcon = (id: string, isDone: boolean) => {
    if (isDone) return '✓';
    if (!id) return '?';
    if (id.startsWith('event:chest')) return '📦';
    if (id.startsWith('event:shrine')) return '🌟';
    if (id.startsWith('event:rune-alignment')) return '🌀';
    if (id.startsWith('event:pet')) return '🐾';
    if (id.startsWith('event:lion')) return '🦁';
    if (id.startsWith('event:friend-relic')) return '🕯️';
    return '⚔️';
  };

  const handleAdvance = () => {
    soundManager.playClick();
    if (!isAllDone) {
      if (isEvent) {
        // Los eventos se manejan de forma interactiva aquí
        setEventStep('intro');
      } else {
        onCombatTrigger();
      }
    }
  };

  const handleNextWorld = () => {
    soundManager.playClick();
    onSceneComplete(current.next);
  };

  // Lógica de decisiones de eventos
  const handleEventChoice = (choice: 'A' | 'B') => {
    const itemPool = ['potion', 'elixir', 'shield', 'crystal'];
    const getRandomItem = () => itemPool[Math.floor(Math.random() * itemPool.length)];
    const itemNames: Record<string, string> = {
      potion: 'Poción de Vida',
      elixir: 'Elixir de Fuerza (+3 Ataque)',
      shield: 'Poción de Escudo (Bloquea un ataque)',
      crystal: 'Cristal de Furia (+50 Energía)'
    };

    let resultMsg = '';
    let updatedPlayer = { ...gameState.player };
    let updatedInventory = [...gameState.inventory];
    let updatedHasPet = gameState.hasPet;
    let updatedHasLion = gameState.hasLion;

    if (currentEncounter.startsWith('event:chest')) {
      if (choice === 'A') {
        // Abrir con cautela (75% éxito, 25% trampa)
        if (Math.random() < 0.75) {
          const item = getRandomItem();
          updatedInventory.push(item);
          resultMsg = `¡Abres el cofre con cuidado y encuentras una ${itemNames[item]}!`;
          soundManager.playEvent();
        } else {
          const damage = 15;
          const item = getRandomItem();
          updatedPlayer.hp = Math.max(1, updatedPlayer.hp - damage);
          updatedInventory.push(item);
          resultMsg = `¡Una aguja envenenada salta al abrir el cofre! Pierdes ${damage} HP, pero consigues una ${itemNames[item]}.`;
          soundManager.playHit();
        }
      } else {
        // Forzar cerradura (40% éxito doble, 60% romper contenido)
        if (Math.random() < 0.40) {
          const item1 = getRandomItem();
          const item2 = getRandomItem();
          updatedInventory.push(item1, item2);
          resultMsg = `¡Fuerzas el mecanismo y consigues doble botín!: una ${itemNames[item1]} y una ${itemNames[item2]}.`;
          soundManager.playVictory();
        } else {
          resultMsg = '¡La cerradura se rompe y el cofre queda sellado para siempre! No consigues nada.';
          soundManager.playDefeat();
        }
      }
    } else if (currentEncounter.startsWith('event:shrine')) {
      if (choice === 'A') {
        // Rezar por sanación
        updatedPlayer.hp = updatedPlayer.maxHp;
        resultMsg = 'Rezas en el altar. Una suave luz azul cubre tu cuerpo y sana todas tus heridas (HP al máximo).';
        soundManager.playHeal();
      } else {
        // Canalizar llama (Max HP +20, Energía +25, pero -15 HP)
        const damage = 15;
        updatedPlayer.maxHp += 20;
        updatedPlayer.hp = Math.max(1, updatedPlayer.hp - damage);
        updatedPlayer.energy = Math.min(updatedPlayer.maxEnergy, updatedPlayer.energy + 25);
        resultMsg = `¡Absorbes la llama! Sientes un dolor quemante (-15 HP), pero tu HP máximo aumenta en +20 y ganas +25 de Energía.`;
        soundManager.playAscension();
      }
    } else if (currentEncounter.startsWith('event:pet')) {
      if (choice === 'A') {
        updatedHasPet = true;
        resultMsg = '¡Rescatas al zorro de tres colas! Te lame la mano agradecido y decide seguirte como mascota.';
        soundManager.playVictory();
      } else {
        resultMsg = 'Decides no interferir y sigues de largo. Sientes una punzada de culpa.';
        soundManager.playClick();
      }
    } else if (currentEncounter.startsWith('event:lion')) {
      if (choice === 'A') {
        updatedHasLion = true;
        resultMsg = '¡Liberas al majestuoso león de sus ataduras! Te ruge suavemente y decide protegerte y unirse a ti.';
        soundManager.playVictory();
      } else {
        resultMsg = 'Decides seguir tu camino y no interactuar con el felino enjaulado.';
        soundManager.playClick();
      }
    } else if (currentEncounter.startsWith('event:friend-relic')) {
      if (choice === 'A') {
        // Desbloquear Ascensión
        updatedPlayer.transformationUnlocked = true;
        updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + 40);
        resultMsg = 'Canalizas su espíritu... ¡La espada rota resuena en tu pecho! Desbloqueas permanentemente la habilidad de ASCENSIÓN y recuperas +40 HP.';
        soundManager.playAscension();
      } else {
        // Aumentar ataque
        updatedPlayer.attack += 8;
        resultMsg = 'Fundes los fragmentos de la espada en tu propio equipo. Tu daño base aumenta permanentemente en +8.';
        soundManager.playLevelUp();
      }
    }

    setEventResult(resultMsg);
    setEventStep('result');

    // Actualizar el estado global
    onStateUpdate({
      player: updatedPlayer,
      inventory: updatedInventory,
      hasPet: updatedHasPet,
      hasLion: updatedHasLion
    });
  };

  // Detener y verificar la alineación del cursor en el minijuego
  const handleStopRune = () => {
    if (minigameState !== 'playing' || isStopped) return;
    setIsStopped(true);
    soundManager.playClick();

    const inRange = cursorPos >= targetStart && cursorPos <= (targetStart + 20);

    if (inRange) {
      soundManager.playVictory();
      setMinigameState('success');
      
      const updatedPlayer = { ...gameState.player };
      const updatedInventory = [...gameState.inventory];
      
      updatedPlayer.energy = Math.min(updatedPlayer.maxEnergy, updatedPlayer.energy + 30);
      updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + 20);
      
      const itemPool = ['potion', 'elixir', 'shield', 'crystal'];
      const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
      updatedInventory.push(randomItem);
      
      const itemNames: Record<string, string> = {
        potion: 'Poción de Vida',
        elixir: 'Elixir de Fuerza (+3 Ataque)',
        shield: 'Poción de Escudo (Bloquea un ataque)',
        crystal: 'Cristal de Furia (+50 Energía)'
      };

      setEventResult(`¡Sincronización resonante perfecta! Las runas se estabilizan y el monolito libera su energía: recuperas +20 HP, ganas +30 AP y obtienes ${itemNames[randomItem]}.`);
      setEventStep('result');

      onStateUpdate({
        player: updatedPlayer,
        inventory: updatedInventory
      });
    } else {
      soundManager.playHit();
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);

      if (nextAttempts <= 0) {
        soundManager.playDefeat();
        setMinigameState('failed');
        
        const updatedPlayer = { ...gameState.player };
        updatedPlayer.hp = Math.max(1, updatedPlayer.hp - 15);
        
        setEventResult('¡Fallo de resonancia catastrófico! La sobrecarga de energía arcana explota liberando un latigazo inestable. Pierdes 15 HP.');
        setEventStep('result');

        onStateUpdate({
          player: updatedPlayer
        });
      } else {
        // Reiniciar cursor para reintentar tras 1 segundo
        setTimeout(() => {
          setIsStopped(false);
          setCursorPos(0);
          setCursorDir(1);
        }, 1000);
      }
    }
  };

  // Finalizar evento e incrementar índice de encuentros
  const handleFinishEvent = () => {
    soundManager.playClick();
    const nextEncounterId = currentEncounterId + 1;
    onStateUpdate({
      currentEncounterId: nextEncounterId
    });
    setEventStep('intro');
  };

  // Definir textos de eventos según el identificador de encuentro
  const getEventData = () => {
    if (!currentEncounter) return { title: '', desc: '', optionA: '', optionB: '', icon: <HelpCircle /> };

    if (currentEncounter.startsWith('event:chest')) {
      return {
        title: 'Cofre Ancestral',
        desc: 'Un cofre tallado en madera de ébano y runas brillantes yace oculto tras unas rocas. Parece antiguo pero peligroso.',
        optionA: 'Abrir con Cuidado',
        optionB: 'Forzar Cerradura',
        icon: <Gift className="w-10 h-10 text-amber-400" />
      };
    } else if (currentEncounter.startsWith('event:shrine')) {
      return {
        title: 'Altar de la Llama Azul',
        desc: 'Un santuario de piedra se alza ante ti. Una llama azul etérea flota en el centro, irradiando una vibración purificadora y salvaje.',
        optionA: 'Rezar por Sanación',
        optionB: 'Canalizar la Llama',
        icon: <Flame className="w-10 h-10 text-cyan-400 animate-pulse" />
      };
    } else if (currentEncounter.startsWith('event:pet')) {
      return {
        title: 'Criatura Atrapada',
        desc: 'Un pequeño zorro mágico con tres colas y pelaje brillante gime de dolor, atrapado entre raíces oscuras impregnadas de vacío.',
        optionA: 'Liberarlo y Alimentarlo',
        optionB: 'Ignorar y Continuar',
        icon: <Heart className="w-10 h-10 text-rose-400 animate-bounce" />
      };
    } else if (currentEncounter.startsWith('event:lion')) {
      return {
        title: 'El León Celestial',
        desc: 'Un cachorro de león de melena solar brilla atrapado en un cepo magnético de la ciudadela. Sus ojos irradian valentía.',
        optionA: 'Desactivar el Cepo',
        optionB: 'Ignorar y Continuar',
        icon: <span className="text-4xl animate-pulse">🦁</span>
      };
    } else if (currentEncounter.startsWith('event:friend-relic')) {
      return {
        title: 'La Espada del Caído',
        desc: 'Sobre un lecho de flores marchitas en el centro de las ruinas, encuentras la espada rota de tu mejor amigo. Una débil energía astral emana de ella.',
        optionA: 'Canalizar su Espíritu',
        optionB: 'Recuperar el Metal (+Atk)',
        icon: <Sparkle className="w-10 h-10 text-indigo-400" />
      };
    } else if (currentEncounter.startsWith('event:rune-alignment')) {
      return {
        title: 'Alineación de Runas Arcanas',
        desc: 'Un monolito de cristal flota frente a ti, proyectando runas distorsionadas. Debes estabilizar su flujo de energía en el instante preciso de resonancia.',
        optionA: '',
        optionB: '',
        icon: <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
      };
    }

    return { title: '', desc: '', optionA: '', optionB: '', icon: <HelpCircle /> };
  };

  const eventData = getEventData();

  return (
    <motion.div
      className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
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
      </div>

      <div className="z-10 text-center px-6 w-full max-w-lg">
        {/* Renderizado de Evento Interactivo */}
        {isEvent && !isAllDone ? (
          <motion.div
            key={`event-${currentEncounterId}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="frosted-glass border-white/20 p-5 md:p-8 rounded-2xl md:rounded-3xl text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                {eventData.icon}
              </div>
            </div>

            <h3 className="text-xl md:text-3xl font-black italic tracking-tighter text-white mb-1.5 md:mb-2 uppercase">
              {eventData.title}
            </h3>
            <div className="w-24 md:w-32 h-px bg-white/20 mx-auto mb-3 md:mb-4" />

            <AnimatePresence mode="wait">
              {currentEncounter.startsWith('event:rune-alignment') && minigameState === 'playing' ? (
                <motion.div
                  key="event-minigame"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <p className="text-xs md:text-sm text-indigo-100/70 leading-relaxed font-medium">
                    {eventData.desc}
                  </p>

                  <div className="w-full bg-slate-950/70 border border-indigo-500/20 rounded-2xl p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden select-none">
                    {/* Barra de alineación */}
                    <div className="relative w-full h-8 bg-slate-900 border border-white/10 rounded-lg overflow-hidden flex items-center shadow-inner">
                      {/* Zona objetivo (Sweet Spot) */}
                      <div 
                        className="absolute h-full bg-emerald-500/25 border-l border-r border-emerald-400/50 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                        style={{ left: `${targetStart}%`, width: '20%' }}
                      />
                      {/* Cursor Móvil */}
                      <div 
                        className="absolute w-1.5 h-full bg-indigo-400 shadow-[0_0_10px_indigo] transition-transform duration-75"
                        style={{ left: `${cursorPos}%`, transform: 'translateX(-50%)' }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-black tracking-wider text-slate-400 uppercase">
                      <span>0%</span>
                      <span className="text-emerald-400/80 animate-pulse">ZONA DE RESONANCIA ({targetStart}% - {targetStart + 20}%)</span>
                      <span>100%</span>
                    </div>

                    {/* Intentos y feedback */}
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-xl mt-1 text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">Intentos Restantes:</span>
                      <span className="font-mono font-black text-indigo-300 flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span key={i} className={i < attemptsLeft ? 'text-indigo-400 animate-pulse' : 'text-slate-700'}>
                            ★
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleStopRune}
                    disabled={isStopped}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 border border-indigo-400/40 hover:scale-102 active:scale-98 disabled:opacity-50 transition-all rounded-xl text-white font-black italic tracking-widest uppercase text-[10px] md:text-xs shadow-lg cursor-pointer"
                  >
                    {isStopped ? 'Sincronizando...' : 'Estabilizar Runa (Click!)'}
                  </button>
                </motion.div>
              ) : eventStep === 'intro' ? (
                <motion.div
                  key="event-intro"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <p className="text-sm md:text-base text-indigo-100/70 leading-relaxed font-medium">
                    {eventData.desc}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <button
                      onClick={() => handleEventChoice('A')}
                      className="py-3 px-4 rounded-xl frosted-glass border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-600/20 text-xs font-bold tracking-widest text-indigo-300 transition-all uppercase"
                    >
                      {eventData.optionA}
                    </button>
                    <button
                      onClick={() => handleEventChoice('B')}
                      className="py-3 px-4 rounded-xl frosted-glass border-purple-500/30 hover:border-purple-400 hover:bg-purple-600/20 text-xs font-bold tracking-widest text-purple-300 transition-all uppercase"
                    >
                      {eventData.optionB}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="event-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-sm md:text-base text-emerald-300 leading-relaxed font-black">
                      {eventResult}
                    </p>
                  </div>

                  <button
                    onClick={handleFinishEvent}
                    className="mt-6 w-full py-4 bg-indigo-600 border border-indigo-400/40 rounded-xl text-white font-black italic tracking-widest hover:scale-102 active:scale-98 transition-all uppercase text-xs shadow-lg"
                  >
                    Continuar Exploración
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Renderizado de Exploración Estándar */
          <>
            {/* Zone Badge */}
            <div className="mb-6 px-8 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full inline-flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_indigo]"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300">Exploración Activa</span>
            </div>

            <motion.h2
              className="text-3xl sm:text-5xl md:text-8xl font-black mb-1.5 md:mb-2 tracking-tighter italic text-white drop-shadow-2xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              {current.title}
            </motion.h2>
            <div className="w-40 sm:w-64 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4 md:mb-6" />

            <motion.p
              className="text-indigo-200/60 max-w-lg mx-auto mb-6 md:mb-10 text-xs sm:text-sm md:text-base leading-relaxed font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {current.desc}
            </motion.p>

            {/* Encounter Progress Indicators */}
            {totalEncounters > 0 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 md:mb-10 select-none">
                {Array.from({ length: totalEncounters }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 font-bold text-xs sm:text-base transition-all
                      ${i < currentEncounterId
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                        : i === currentEncounterId
                        ? 'bg-white/10 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.5)] animate-pulse scale-110'
                        : 'bg-white/5 border-white/20 text-white/30'
                      }`}
                  >
                    {getEncounterIcon(plannedEncounters[i], i < currentEncounterId)}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Status text */}
            <div className="mb-4 md:mb-8">
              {isAllDone ? (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-400 font-bold tracking-widest text-xs sm:text-sm uppercase"
                >
                  ✦ Zona completada — todos los encuentros resueltos ✦
                </motion.p>
              ) : (
                <p className="text-white/40 text-[10px] sm:text-xs tracking-widest uppercase">
                  Encuentro {currentEncounterId + 1} de {totalEncounters} en esta zona
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <AnimatePresence mode="wait">
              {isAllDone ? (
                <motion.button
                  key="next-world"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleNextWorld}
                  className="group relative px-8 sm:px-16 py-3.5 sm:py-5 bg-emerald-600/30 backdrop-blur-xl border-2 border-emerald-400/50 rounded-xl sm:rounded-2xl text-white font-black italic uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl text-xs sm:text-sm"
                >
                  <div className="absolute inset-0 bg-emerald-400/5 group-hover:bg-emerald-400/10 transition-colors" />
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    Ir a {current.nextName}
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  key="advance"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleAdvance}
                  className={`group relative px-8 sm:px-16 py-3.5 sm:py-5 backdrop-blur-xl rounded-xl sm:rounded-2xl text-white font-black italic uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl border text-xs sm:text-sm
                    ${isEvent 
                      ? 'bg-indigo-900/30 border-indigo-400/40' 
                      : 'bg-red-900/30 border-red-400/40'
                    }`}
                >
                  <div className={`absolute inset-0 transition-colors ${isEvent ? 'bg-indigo-400/5 group-hover:bg-indigo-400/10' : 'bg-red-400/5 group-hover:bg-red-400/10'}`} />
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    {isEvent ? (
                      <>
                        <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                        Explorar Suceso
                      </>
                    ) : (
                      <>
                        <Sword className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        Combatir
                      </>
                    )}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Right Rail */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-6">
        <div className={`w-14 h-14 rounded-xl frosted-glass flex flex-col items-center justify-center transition-all border-l-4 ${gameState.hasPet ? 'border-l-teal-400 opacity-100' : 'border-l-white/10 opacity-30'}`}>
          <div className="text-[8px] font-bold text-white/50 mb-1">PET 1</div>
          <div className={`w-6 h-6 rounded-full transition-all ${gameState.hasPet ? 'bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.6)]' : 'bg-white/10'}`}></div>
        </div>
        <div className={`w-14 h-14 rounded-xl frosted-glass flex flex-col items-center justify-center transition-all border-l-4 ${gameState.hasLion ? 'border-l-orange-400 opacity-100' : 'border-l-white/10 opacity-30'}`}>
          <div className="text-[8px] font-bold text-white/50 mb-1">PET 2</div>
          <div className={`w-6 h-6 rounded-full transition-all ${gameState.hasLion ? 'bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.6)]' : 'bg-white/10'}`}></div>
        </div>
        <div className={`w-14 h-14 rounded-xl frosted-glass flex flex-col items-center justify-center transition-all border-l-4 ${gameState.player.transformationUnlocked ? 'border-l-amber-500 opacity-100' : 'border-l-white/10 opacity-30'}`}>
          <div className="text-[8px] font-bold text-white/50 mb-1">ASCENT</div>
          <div className={`w-6 h-6 rounded-full transition-all ${gameState.player.transformationUnlocked ? 'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'bg-white/10'}`}></div>
        </div>
      </div>
    </motion.div>
  );
}
