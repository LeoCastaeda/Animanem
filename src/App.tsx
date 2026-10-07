/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, LogOut } from 'lucide-react';
import { INITIAL_STATE, GameState, SceneId, HeroId } from './types.ts';
import IntroScene from './components/IntroScene.tsx';
import ExplorationScene from './components/ExplorationScene.tsx';
import CombatScene from './components/CombatScene.tsx';
import CinematicScene from './components/CinematicScene.tsx';
import MainMenu from './components/MainMenu.tsx';
import Minimap from './components/Minimap.tsx';
import CharacterSelection from './components/CharacterSelection.tsx';
import UndergroundScene from './components/UndergroundScene.tsx';
import EndgameScene from './components/EndgameScene.tsx';
import SaveSlotsManager from './components/SaveSlotsManager.tsx';
import { saveGame, clearSaveData, clearAllSaveData } from './utils/saveSystem.ts';
import { soundManager } from './utils/audio.ts';
import { getHeroById } from './data/heroes.ts';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activeView, setActiveView] = useState<'narrative' | 'exploration' | 'combat' | 'underground' | 'endgame'>('narrative');
  const [isInMenu, setIsInMenu] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [showSaveSlots, setShowSaveSlots] = useState(false);
  const [currentSaveSlot, setCurrentSaveSlot] = useState<number>(0);
  const [pendingCombat, setPendingCombat] = useState(false);

  // Mapeo automático de escenas a videos
  const SCENE_VIDEOS: Record<SceneId, string | undefined> = {
    'intro': '/video/cabecera_principal.mp4',
    'beach': '/video/primer_nivel.mp4',
    'forest': '/video/second_level.mp4',
    'ruins': '/video/bosque_de_las_almas.mp4',
    'city': '/video/city.mp4',
    'underground': undefined,
    'final-boss': '/video/final-boss.mp4',
    'ending': '/video/final.mp4',
    'endgame': undefined,
  };

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const generateEncounters = (sceneId: SceneId) => {
    switch(sceneId) {
      case 'beach':
        return ['shadow-1', 'event:chest', 'shadow-2'];
      case 'forest':
        return ['ghoul-1', 'event:unlock-zaigo', 'event:pet', 'beast-1', 'event:chest'];
      case 'ruins':
        return ['guardian-1', 'event:unlock-wiku', 'event:shrine', 'event:rune-alignment', 'spirit', 'event:friend-relic', 'golem'];
      case 'city':
        return ['demon', 'event:chest', 'event:unlock-scrap', 'event:lion', 'dark-knight', 'event:rune-alignment', 'event:shrine', 'titan', 'guardian-2'];
      case 'final-boss':
        return ['colossus'];
      default:
        return [];
    }
  };

  const changeScene = (sceneId: SceneId) => {
    const encounters = generateEncounters(sceneId);
    updateGameState({ 
      currentScene: sceneId, 
      plannedEncounters: { ...gameState.plannedEncounters, [sceneId]: encounters },
      currentEncounterId: 0 
    });
    
    if (sceneId === 'intro' || sceneId === 'ending') {
      setActiveView('narrative');
    } else {
      setActiveView('exploration');
    }
  };

  const handleNewGame = (heroId: HeroId) => {
    clearAllSaveData();
    const hero = getHeroById(heroId);
    setGameState({
      ...INITIAL_STATE,
      player: {
        ...INITIAL_STATE.player,
        heroModelPath: hero.modelPath,
        selectedHero: heroId,
        maxHp: hero.baseHp,
        hp: hero.baseHp,
        attack: hero.baseAttack,
      },
      unlockedHeroes: [heroId],
    });
    setActiveView('narrative');
    setIsInMenu(false);
  };

  const handleContinueGame = (savedState: GameState) => {
    setGameState(savedState);
    setIsInMenu(false);
    if (savedState.currentScene === 'intro' || savedState.currentScene === 'ending') {
      setActiveView('narrative');
    } else if (savedState.currentScene === 'underground') {
      setActiveView('underground');
    } else if (savedState.currentScene === 'endgame') {
      setActiveView('endgame');
    } else {
      setActiveView('exploration');
    }
  };

  const handleSaveGame = () => {
    setShowSaveSlots(true);
  };

  const handleSaveToSlot = (slotId: number) => {
    saveGame(gameState, slotId);
    setCurrentSaveSlot(slotId);
    soundManager.playEvent();
    setShowSaveToast(true);
    setShowSaveSlots(false);
  };

  const unlockHero = (heroId: HeroId) => {
    if (!gameState.unlockedHeroes.includes(heroId)) {
      updateGameState({
        unlockedHeroes: [...gameState.unlockedHeroes, heroId]
      });
      soundManager.playLevelUp();
    }
  };

  useEffect(() => {
    if (showSaveToast) {
      const timer = setTimeout(() => setShowSaveToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showSaveToast]);

  const handleExitToMenu = () => {
    soundManager.playClick();
    setIsInMenu(true);
    setActiveView('narrative');
  };

  const handleCombatTrigger = () => {
    setShowCharacterSelection(true);
    setPendingCombat(true);
  };

  const handleCharacterSelect = (heroId: HeroId) => {
    const hero = getHeroById(heroId);
    updateGameState({
      player: {
        ...gameState.player,
        selectedHero: heroId,
        heroModelPath: hero.modelPath,
      }
    });
    setShowCharacterSelection(false);
    if (pendingCombat) {
      setActiveView('combat');
      setPendingCombat(false);
    }
  };

  const handleUndergroundAccess = () => {
    soundManager.playClick();
    setActiveView('underground');
    setIsInMenu(false);
  };

  const handleEndgameAccess = () => {
    soundManager.playClick();
    setActiveView('endgame');
    setIsInMenu(false);
  };

  const handleEndgameModeSelect = (mode: 'arena' | 'survival' | 'boss-rush') => {
    soundManager.playEvent();
    // Aquí puedes configurar el modo específico en el gameState si es necesario
    updateGameState({ 
      currentScene: 'endgame',
      // Podrías agregar un campo endgameMode en GameState si quieres rastrearlo
    });
    setActiveView('combat');
  };

  const getBackgroundVideoSrc = () => {
    return SCENE_VIDEOS[gameState.currentScene];
  };

  const shouldShowVideo = getBackgroundVideoSrc() !== undefined;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Intentar forzar reproducción — en algunos navegadores móviles la reproducción sólo empieza tras interacción
    const tryPlay = async () => {
      try {
        v.preload = 'auto';
        v.muted = true;
        await v.play();
      } catch (err) {
        // silencio de fallos: algunos navegadores bloquean autoplay hasta interacción
      }
    };
    tryPlay();
  }, [gameState.currentScene]);

  return (
    <div className="fixed inset-0 bg-[#020617] text-white font-sans overflow-hidden select-none">
      {shouldShowVideo && (
        <video
          ref={videoRef}
          key={gameState.currentScene}
          className="absolute inset-0 w-full h-full object-cover opacity-60 sm:opacity-70 md:opacity-80 will-change-opacity"
          src={getBackgroundVideoSrc()}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          aria-hidden="true"
          onCanPlay={() => { try { videoRef.current?.play(); } catch {} }}
        />
      )}

      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-tr from-[#0c0a09] via-[#1e1b4b] to-[#4338ca] opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Character Selection Modal */}
      <AnimatePresence>
        {showCharacterSelection && (
          <CharacterSelection
            gameState={gameState}
            onSelect={handleCharacterSelect}
            onCancel={() => {
              setShowCharacterSelection(false);
              setPendingCombat(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Save Slots Modal */}
      <AnimatePresence>
        {showSaveSlots && (
          <SaveSlotsManager
            mode="save"
            onSelect={handleSaveToSlot}
            onCancel={() => setShowSaveSlots(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isInMenu ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-20">
            <MainMenu 
              onNewGame={handleNewGame} 
              onContinueGame={handleContinueGame}
              onUnderground={handleUndergroundAccess}
              onEndgame={handleEndgameAccess}
            />
          </motion.div>
        ) : (
          <>
            {gameState.currentScene === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10 transition-colors">
                <IntroScene onComplete={() => changeScene('beach')} />
              </motion.div>
            )}

            {activeView === 'exploration' && (
              <motion.div key={`exploration-${gameState.currentScene}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
                <ExplorationScene
                  gameState={gameState}
                  onCombatTrigger={handleCombatTrigger}
                  onSceneComplete={(nextScene) => changeScene(nextScene)}
                  onStateUpdate={updateGameState}
                  onUnlockHero={unlockHero}
                />
              </motion.div>
            )}

            {activeView === 'underground' && (
              <motion.div key="underground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
                <UndergroundScene
                  gameState={gameState}
                  onCombatTrigger={handleCombatTrigger}
                  onExit={() => setActiveView('exploration')}
                  onStateUpdate={updateGameState}
                />
              </motion.div>
            )}

            {activeView === 'endgame' && (
              <motion.div key="endgame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
                <EndgameScene
                  gameState={gameState}
                  onSelectMode={handleEndgameModeSelect}
                  onExit={handleExitToMenu}
                />
              </motion.div>
            )}

            {activeView === 'combat' && (
              <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
                <CombatScene
                  gameState={gameState}
                  onWin={(updatedState) => {
                    setGameState(updatedState);
                    if (updatedState.currentScene === 'final-boss' && updatedState.monstersDefeated > gameState.monstersDefeated) {
                      // Campaña completada
                      updateGameState({ campaignCompleted: true });
                    }
                    setActiveView(updatedState.currentScene === 'underground' ? 'underground' : 'exploration');
                  }}
                  onGameOver={() => {
                    if (gameState.currentScene === 'underground') {
                      // En subterráneos, volver a la exploración
                      updateGameState({ undergroundProgress: 0 });
                      setActiveView('exploration');
                    } else {
                      clearAllSaveData();
                      setGameState(INITIAL_STATE);
                      setIsInMenu(true);
                    }
                  }}
                />
              </motion.div>
            )}

            {gameState.currentScene === 'ending' && (
              <motion.div key="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
                <CinematicScene
                  type="ending"
                  onComplete={() => {
                    updateGameState({ campaignCompleted: true });
                    setIsInMenu(true);
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* HUD Overlay */}
      {!isInMenu && gameState.currentScene !== 'intro' && gameState.currentScene !== 'ending' && activeView !== 'endgame' && (
        <HUD 
          player={gameState.player} 
          scene={gameState.currentScene} 
          onSave={handleSaveGame} 
          onExitToMenu={handleExitToMenu} 
        />
      )}

      {/* Minimap Overlay */}
      {!isInMenu && activeView === 'exploration' && gameState.currentScene !== 'intro' && gameState.currentScene !== 'ending' && (
        <Minimap gameState={gameState} />
      )}

      {/* Toast de Guardado */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-100 px-6 py-3 rounded-xl border border-emerald-500/30 bg-emerald-950/80 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ¡Partida guardada correctamente!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Processing Effects */}
      <div className="absolute inset-0 pointer-events-none z-100 scanlines opacity-10"></div>
      <div className="absolute inset-0 pointer-events-none z-100 vignette opacity-30"></div>
    </div>
  );
}

function HUD({ 
  player, 
  scene, 
  onSave, 
  onExitToMenu 
}: { 
  player: any; 
  scene: string; 
  onSave: () => void; 
  onExitToMenu: () => void; 
}) {
  return (
    <div className="absolute top-0 left-0 w-full p-3 md:p-8 flex justify-between items-start pointer-events-none z-60">
      <div className="flex gap-2 md:gap-4">
        <div className="w-10 h-10 md:w-16 md:h-16 rounded-full frosted-glass flex items-center justify-center p-1 border-white/30 shrink-0">
          <div className="w-full h-full rounded-full bg-linear-to-b from-indigo-400 to-purple-600 flex items-center justify-center font-black italic text-sm md:text-xl shadow-inner">
            {player.isTransformed ? '★' : 'H'}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5 md:gap-3">
            <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">Lvl {player.level} Hero</span>
            <div className="h-px w-8 md:w-16 bg-white/20"></div>
          </div>
          <h2 className="text-xs md:text-xl font-black tracking-tighter italic uppercase underline decoration-white/10 underline-offset-4">ANIMANEM</h2>
          
          <div className="flex flex-col gap-0.5 md:gap-1 mt-1">
            {/* HP Bar */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[6px] md:text-[7px] text-red-400 font-bold uppercase tracking-wider w-4 md:w-6">HP</span>
              <div className="h-1 md:h-1.5 w-28 sm:w-36 md:w-48 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className="h-full bg-linear-to-r from-red-500 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* EXP Bar */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[6px] md:text-[7px] text-emerald-400 font-bold uppercase tracking-wider w-4 md:w-6">EXP</span>
              <div className="h-0.5 md:h-1 w-28 sm:w-36 md:w-48 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-400" 
                  initial={{ width: 0 }}
                  animate={{ width: `${player.exp}%` }}
                />
              </div>
            </div>

            {/* AP (Energy) Bar */}
            {player.transformationUnlocked && (
              <div className="flex items-center gap-1.5 md:gap-2 animate-pulse">
                <span className="text-[6px] md:text-[7px] text-amber-400 font-bold uppercase tracking-wider w-4 md:w-6">AP</span>
                <div className="h-0.5 md:h-1 w-28 sm:w-36 md:w-48 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    className="h-full bg-linear-to-r from-amber-500 to-yellow-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${player.energy}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end gap-2">
        <div>
          <h3 className="text-base sm:text-2xl md:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/40 leading-none">
            {scene.replace('-', ' ')}
          </h3>
          <p className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-indigo-400 font-bold mt-0.5 md:mt-1">THE SHATTERED ISLES</p>
        </div>

        {/* Botones de guardado y salida */}
        <div className="flex gap-2 mt-1 md:mt-2 pointer-events-auto">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg frosted-glass border border-white/20 hover:border-indigo-400 hover:bg-indigo-500/10 active:scale-95 transition-all text-[9px] md:text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer"
            title="Guardar partida"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Guardar</span>
          </button>
          
          <button
            onClick={onExitToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg frosted-glass border border-white/20 hover:border-red-400 hover:bg-red-500/10 active:scale-95 transition-all text-[9px] md:text-xs font-bold uppercase tracking-wider text-white/85 hover:text-white shadow-lg cursor-pointer"
            title="Salir al menú principal"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
