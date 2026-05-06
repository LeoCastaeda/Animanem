/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_STATE, GameState, SceneId } from './types.ts';
import IntroScene from './components/IntroScene.tsx';
import ExplorationScene from './components/ExplorationScene.tsx';
import CombatScene from './components/CombatScene.tsx';
import CinematicScene from './components/CinematicScene.tsx';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [activeView, setActiveView] = useState<'narrative' | 'exploration' | 'combat'>('narrative');

  // Mapeo automático de escenas a videos
  const SCENE_VIDEOS: Record<SceneId, string | undefined> = {
    'intro': '/video/cabecera_principal.mp4',
    'beach': '/video/primer_nivel.mp4',
    'forest': '/video/second_level.mp4',
    'ruins': '/video/bosque_de_las_almas.mp4',
    'city': undefined,
    'final-boss': undefined,
    'ending': undefined,
  };

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const changeScene = (sceneId: SceneId) => {
    updateGameState({ currentScene: sceneId });
    if (sceneId === 'intro' || sceneId === 'ending') {
      setActiveView('narrative');
    } else {
      setActiveView('exploration');
    }
  };

  const getBackgroundVideoSrc = () => {
    return SCENE_VIDEOS[gameState.currentScene];
  };

  const shouldShowVideo = getBackgroundVideoSrc() !== undefined;

  return (
    <div className="fixed inset-0 bg-[#020617] text-white font-sans overflow-hidden select-none">
      {shouldShowVideo && (
        <video
          key={gameState.currentScene}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          src={getBackgroundVideoSrc()}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      )}

      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-tr from-[#0c0a09] via-[#1e1b4b] to-[#4338ca] opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      <AnimatePresence mode="wait">
        {gameState.currentScene === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10 transition-colors">
            <IntroScene onComplete={() => changeScene('beach')} />
          </motion.div>
        )}

        {activeView === 'exploration' && (
          <motion.div key={`exploration-${gameState.currentScene}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
            <ExplorationScene
              gameState={gameState}
              onCombatTrigger={() => setActiveView('combat')}
              onSceneComplete={(nextScene) => changeScene(nextScene)}
            />
          </motion.div>
        )}

        {activeView === 'combat' && (
          <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
            <CombatScene
              gameState={gameState}
              onWin={(updatedState) => {
                setGameState(updatedState);
                setActiveView('exploration');
              }}
              onGameOver={() => setGameState(INITIAL_STATE)}
            />
          </motion.div>
        )}

        {gameState.currentScene === 'ending' && (
          <motion.div key="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative z-10">
            <CinematicScene
              type="ending"
              onComplete={() => setGameState(INITIAL_STATE)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Overlay */}
      {gameState.currentScene !== 'intro' && gameState.currentScene !== 'ending' && (
        <HUD player={gameState.player} scene={gameState.currentScene} />
      )}

      {/* Post-Processing Effects */}
      <div className="absolute inset-0 pointer-events-none z-100 scanlines opacity-10"></div>
      <div className="absolute inset-0 pointer-events-none z-100 vignette opacity-30"></div>
    </div>
  );
}

function HUD({ player, scene }: { player: any, scene: string }) {
  return (
    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-60">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full frosted-glass flex items-center justify-center p-1 border-white/30">
          <div className="w-full h-full rounded-full bg-linear-to-b from-indigo-400 to-purple-600 flex items-center justify-center font-black italic text-xl shadow-inner">
            {player.isTransformed ? '★' : 'H'}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">Level {player.level} Hero</span>
            <div className="h-px w-16 bg-white/20"></div>
          </div>
          <h2 className="text-xl font-black tracking-tighter italic uppercase underline decoration-white/10 underline-offset-4">ANIMANEM</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-48 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                className="h-full bg-linear-to-r from-red-500 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                initial={{ width: 0 }}
                animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <h3 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/40 leading-none">
          {scene.replace('-', ' ')}
        </h3>
        <p className="text-[10px] tracking-[0.3em] uppercase text-indigo-400 font-bold mt-1">THE SHATTERED ISLES</p>
      </div>
    </div>
  );
}
