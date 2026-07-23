/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, History, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio.ts';
import { loadGame, hasSaveData } from '../utils/saveSystem.ts';
import { GameState } from '../types.ts';

interface MainMenuProps {
  onNewGame: () => void;
  onContinueGame: (savedState: GameState) => void;
}

export default function MainMenu({ onNewGame, onContinueGame }: MainMenuProps) {
  const [hasSave, setHasSave] = useState(false);
  const [savedState, setSavedState] = useState<GameState | null>(null);

  useEffect(() => {
    const checkSave = hasSaveData();
    setHasSave(checkSave);
    if (checkSave) {
      setSavedState(loadGame());
    }
  }, []);

  const handleNewGameClick = () => {
    soundManager.playVictory();
    onNewGame();
  };

  const handleContinueClick = () => {
    if (hasSave && savedState) {
      soundManager.playLevelUp();
      onContinueGame(savedState);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full min-h-screen text-center p-4">
      {/* Fondo de gradiente sutil específico para el menú */}
      <div className="absolute inset-0 z-0 bg-radial-to-b from-indigo-950/40 via-[#020617] to-[#020617] pointer-events-none" />

      {/* Brillo de luz de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full px-6 flex flex-col items-center gap-10"
      >
        {/* Bloque del Título */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex items-center gap-2 text-indigo-400 font-bold tracking-[0.4em] uppercase text-xs sm:text-sm animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            <span>Un RPG de Fantasía Web</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-indigo-100 to-indigo-400 drop-shadow-[0_4px_12px_rgba(99,102,241,0.3)] mt-2">
            ANIMANEM
          </h1>
          <div className="h-0.5 w-32 bg-linear-to-r from-transparent via-indigo-500 to-transparent mt-1" />
          <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-indigo-300/60 font-medium mt-1">
            THE SHATTERED ISLES
          </p>
        </div>

        {/* Bloque de Botones */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {/* Nueva Partida */}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewGameClick}
            className="relative overflow-hidden w-full py-4 px-6 rounded-xl border border-white/20 frosted-glass hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all text-sm font-bold uppercase tracking-wider text-white shadow-xl cursor-pointer flex items-center justify-center gap-3 group"
          >
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <Play className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
            <span>Nueva Partida</span>
          </motion.button>

          {/* Continuar Partida */}
          <motion.button
            whileHover={hasSave ? { scale: 1.03, boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' } : {}}
            whileTap={hasSave ? { scale: 0.98 } : {}}
            disabled={!hasSave}
            onClick={handleContinueClick}
            className={`relative overflow-hidden w-full py-4 px-6 rounded-xl border transition-all text-sm font-bold uppercase tracking-wider shadow-xl flex flex-col items-center justify-center gap-1 ${
              hasSave
                ? 'border-white/20 frosted-glass hover:border-purple-400/50 hover:bg-purple-500/10 text-white cursor-pointer group'
                : 'border-white/5 bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {hasSave && (
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            )}
            <div className="flex items-center justify-center gap-3">
              <History className={`w-4 h-4 ${hasSave ? 'text-purple-400 group-hover:text-white' : 'text-white/20'} transition-colors`} />
              <span>Continuar Partida</span>
            </div>
            {hasSave && savedState && (
              <span className="text-[9px] lowercase font-normal tracking-wide text-purple-300/80 group-hover:text-purple-200 transition-colors mt-0.5">
                nivel {savedState.player.level} • {savedState.currentScene.replace('-', ' ')}
              </span>
            )}
            {!hasSave && (
              <span className="text-[9px] lowercase font-normal tracking-wide text-white/20 mt-0.5">
                no hay partida guardada
              </span>
            )}
          </motion.button>
        </div>

        {/* Créditos de pie de página */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="text-[9px] uppercase tracking-widest text-white/50"
        >
          © 2026 Animanem Studio. Todos los derechos reservados.
        </motion.div>
      </motion.div>
    </div>
  );
}
