/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Trash2, Clock, MapPin, TrendingUp, X } from 'lucide-react';
import { SaveSlot } from '../types';
import { getAllSaveSlots, clearSaveData } from '../utils/saveSystem';
import { soundManager } from '../utils/audio';

interface SaveSlotsManagerProps {
  mode: 'save' | 'load';
  onSelect: (slotId: number) => void;
  onCancel: () => void;
}

export default function SaveSlotsManager({ mode, onSelect, onCancel }: SaveSlotsManagerProps) {
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = () => {
    const loadedSlots = getAllSaveSlots();
    setSlots(loadedSlots);
  };

  const handleSlotClick = (slotId: number) => {
    soundManager.playClick();
    setSelectedSlot(slotId);
  };

  const handleConfirm = () => {
    if (selectedSlot === null) return;
    soundManager.playEvent();
    onSelect(selectedSlot);
  };

  const handleDelete = (slotId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    soundManager.playClick();
    setShowDeleteConfirm(slotId);
  };

  const confirmDelete = (slotId: number) => {
    soundManager.playEvent();
    clearSaveData(slotId);
    loadSlots();
    setShowDeleteConfirm(null);
    if (selectedSlot === slotId) {
      setSelectedSlot(null);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSceneName = (sceneId: string) => {
    const names: Record<string, string> = {
      'intro': 'Introducción',
      'beach': 'Playa',
      'forest': 'Bosque',
      'ruins': 'Ruinas',
      'city': 'Ciudad',
      'underground': 'Subterráneos',
      'final-boss': 'Jefe Final',
      'ending': 'Final',
      'endgame': 'Modo Infinito',
    };
    return names[sceneId] || sceneId;
  };

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
        className="w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-indigo-950/95 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_60px_rgba(99,102,241,0.3)] overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent mb-2">
              {mode === 'save' ? 'Guardar Partida' : 'Cargar Partida'}
            </h1>
            <p className="text-xs md:text-sm text-indigo-300 uppercase tracking-[0.3em] font-bold">
              {mode === 'save' ? 'Selecciona un slot para guardar' : 'Selecciona un slot para cargar'}
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onCancel();
            }}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 transition-all"
          >
            <X className="w-6 h-6 text-red-400" />
          </button>
        </div>

        {/* Slots Grid */}
        <div className="space-y-4 mb-6">
          {slots.map((slot, index) => {
            const isEmpty = slot === null;
            const isSelected = selectedSlot === index;
            const isDeleteConfirming = showDeleteConfirm === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: isEmpty ? 1 : 1.02 }}
                whileTap={{ scale: isEmpty ? 1 : 0.98 }}
                onClick={() => handleSlotClick(index)}
                className={`
                  relative cursor-pointer rounded-2xl p-5 border-2 transition-all
                  ${isSelected 
                    ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] bg-indigo-600/20' 
                    : isEmpty
                      ? 'border-dashed border-gray-600 bg-slate-800/30 hover:border-gray-500'
                      : 'border-indigo-500/30 bg-slate-800/50 hover:border-indigo-400/60'
                  }
                `}
              >
                {isEmpty ? (
                  // Empty Slot
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Save className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 font-bold">Slot {index + 1} - Vacío</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {mode === 'save' ? 'Haz clic para guardar aquí' : 'No hay datos guardados'}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Filled Slot
                  <div className="flex items-start gap-4">
                    {/* Slot Number */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                      {index + 1}
                    </div>

                    {/* Slot Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black text-white truncate">
                          {slot.playerName || `Partida ${index + 1}`}
                        </h3>
                        {!isDeleteConfirming && (
                          <button
                            onClick={(e) => handleDelete(index, e)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-indigo-300">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{getSceneName(slot.gameState.currentScene)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-300">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Nivel {slot.gameState.player.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-300">
                          <span className="font-bold">⚔️</span>
                          <span>{slot.gameState.monstersDefeated} Derrotados</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimestamp(slot.timestamp)}</span>
                        </div>
                      </div>

                      {/* Campaign Status */}
                      {slot.gameState.campaignCompleted && (
                        <div className="mt-2 inline-block px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-[10px] font-bold text-yellow-300 uppercase">
                          ✓ Campaña Completada
                        </div>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <span className="text-xl text-indigo-600">✓</span>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                <AnimatePresence>
                  {isDeleteConfirming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4"
                    >
                      <div className="text-center">
                        <p className="text-white font-bold mb-4">¿Borrar esta partida?</p>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundManager.playClick();
                              setShowDeleteConfirm(null);
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold text-white transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(index);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-all"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundManager.playClick();
              onCancel();
            }}
            className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-black text-white uppercase tracking-wider transition-all border border-gray-500"
          >
            Cancelar
          </motion.button>
          
          <motion.button
            whileHover={selectedSlot !== null ? { scale: 1.05 } : {}}
            whileTap={selectedSlot !== null ? { scale: 0.95 } : {}}
            onClick={handleConfirm}
            disabled={selectedSlot === null || (mode === 'load' && slots[selectedSlot] === null)}
            className={`
              flex-1 px-6 py-4 rounded-xl font-black uppercase tracking-wider transition-all border
              ${selectedSlot !== null && !(mode === 'load' && slots[selectedSlot] === null)
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border-indigo-400 cursor-pointer'
                : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
              }
            `}
          >
            {mode === 'save' ? 'Guardar' : 'Cargar'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
