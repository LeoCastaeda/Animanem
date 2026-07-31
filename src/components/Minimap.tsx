/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Minimize2, MapPin, Skull, Gift, Home, User, Sparkles } from 'lucide-react';
import { GameState, SceneId } from '../types.ts';

interface MinimapProps {
  gameState: GameState;
}

interface MapElement {
  name: string;
  x: number; // 0-100
  y: number; // 0-100
  desc: string;
}

export default function Minimap({ gameState }: MinimapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<{
    name: string;
    desc: string;
    type: 'player' | 'enemy' | 'mission' | 'building' | 'npc';
    x: number;
    y: number;
  } | null>(null);

  const currentScene = gameState.currentScene;
  const currentEncounterId = gameState.currentEncounterId;
  const plannedEncounters = gameState.plannedEncounters[currentScene] || [];
  const totalEncounters = plannedEncounters.length;

  // Toggle expand/collapse
  const toggleExpand = () => setIsExpanded(prev => !prev);

  // Esc/Keyboard event listener for "+" (expand) and "Escape" (close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle expansion when "+" or "*" is pressed
      // Covers '+' key, Numpad '+' (NumpadAdd), and Shift+"+" (some layouts)
      if (e.key === '+' || e.key === '*' || e.code === 'NumpadAdd' || (e.code === 'Equal' && e.shiftKey)) {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      }
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Coordinates and static elements for each scene
  const mapData: Record<
    SceneId,
    {
      start: { x: number; y: number };
      end: { x: number; y: number };
      encounterPoints: { x: number; y: number }[];
      buildings: MapElement[];
      npcs: MapElement[];
      title: string;
      region: string;
    }
  > = {
    'beach': {
      title: 'Playa de los Lamentos',
      region: 'Las Playas del Olvido',
      start: { x: 15, y: 80 },
      end: { x: 90, y: 20 },
      encounterPoints: [
        { x: 35, y: 65 }, // shadow-1
        { x: 55, y: 50 }, // event:chest
        { x: 75, y: 35 }  // shadow-2
      ],
      buildings: [
        { name: 'Faro Derruido', x: 82, y: 15, desc: 'Un faro antiguo cubierto de musgo y sal. Emite un leve zumbido mágico.' },
        { name: 'Choza Abandonada', x: 25, y: 85, desc: 'El refugio podrido de un viejo marinero. Huele a humedad.' }
      ],
      npcs: [
        { name: 'Náufrago Misterioso', x: 45, y: 75, desc: 'Un viejo que murmura sobre sombras gigantescas que acechan en el agua.' }
      ]
    },
    'forest': {
      title: 'Bosque de las Almas',
      region: 'Las Tierras Silvestres',
      start: { x: 85, y: 85 },
      end: { x: 15, y: 15 },
      encounterPoints: [
        { x: 70, y: 70 }, // ghoul-1
        { x: 50, y: 60 }, // event:pet (Zorro de tres colas)
        { x: 38, y: 45 }, // beast-1
        { x: 25, y: 30 }  // event:chest
      ],
      buildings: [
        { name: 'Santuario de Hojas', x: 62, y: 30, desc: 'Un altar consagrado a los espíritus del bosque. Brilla con magia curativa.' },
        { name: 'Árbol Madre', x: 40, y: 20, desc: 'Un árbol colosal cuyas raíces nutren toda la magia vital del bosque.' }
      ],
      npcs: [
        { name: 'Sabio Druida', x: 80, y: 45, desc: 'Un anciano elfo que aconseja a los viajeros no salirse del camino principal.' }
      ]
    },
    'ruins': {
      title: 'Ruinas de Aethel',
      region: 'El Reino Caído',
      start: { x: 10, y: 80 },
      end: { x: 90, y: 15 },
      encounterPoints: [
        { x: 22, y: 72 }, // guardian-1
        { x: 35, y: 62 }, // event:shrine (Altar Llama Azul)
        { x: 48, y: 52 }, // event:rune-alignment (NEW)
        { x: 60, y: 44 }, // spirit
        { x: 72, y: 34 }, // event:friend-relic (Espada rota)
        { x: 82, y: 24 }  // golem
      ],
      buildings: [
        { name: 'Templo de Aethel', x: 50, y: 18, desc: 'El salón del trono en ruinas del imperio caído. Alguna vez fue glorioso.' },
        { name: 'Arcada del Amanecer', x: 88, y: 30, desc: 'Un umbral de piedra labrada que conduce a la ciudadela.' }
      ],
      npcs: [
        { name: 'Espíritu Guardián', x: 45, y: 38, desc: 'El espectro de un caballero que aún vigila las ruinas imperiales.' }
      ]
    },
    'city': {
      title: 'Ciudadela de Neón',
      region: 'El Núcleo Tecnológico',
      start: { x: 15, y: 90 },
      end: { x: 92, y: 10 },
      encounterPoints: [
        { x: 18, y: 78 }, // demon
        { x: 28, y: 68 }, // event:chest
        { x: 38, y: 58 }, // event:rune-alignment (NEW)
        { x: 48, y: 50 }, // event:lion (León Celestial)
        { x: 58, y: 40 }, // dark-knight
        { x: 68, y: 30 }, // event:shrine
        { x: 78, y: 20 }, // titan
        { x: 86, y: 12 }  // guardian-2
      ],
      buildings: [
        { name: 'Torre del Núcleo', x: 50, y: 25, desc: 'El reactor central que alimenta los hologramas y defensas de la ciudadela.' },
        { name: 'Barrio Bajo', x: 15, y: 42, desc: 'Sector residencial abandonado, ahora lleno de trampas y restos cibernéticos.' }
      ],
      npcs: [
        { name: 'Mercader de Chatarra', x: 28, y: 38, desc: 'Un ciborg que busca reliquias útiles entre los escombros de neón.' }
      ]
    },
    'final-boss': {
      title: 'El Núcleo del Caos',
      region: 'La Falla Temporal',
      start: { x: 50, y: 85 },
      end: { x: 50, y: 15 },
      encounterPoints: [
        { x: 50, y: 50 }  // colossus
      ],
      buildings: [
        { name: 'Portal del Vacío', x: 50, y: 42, desc: 'Un vórtice de energía que altera el tiempo y el espacio a su alrededor.' }
      ],
      npcs: [
        { name: 'Eco de tu Amigo', x: 30, y: 70, desc: 'Una proyección de fuerza astral que te infunde valor para la última batalla.' }
      ]
    },
    'intro': { title: 'Intro', region: '', start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, encounterPoints: [], buildings: [], npcs: [] },
    'ending': { title: 'Final', region: '', start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, encounterPoints: [], buildings: [], npcs: [] }
  };

  const currentMap = mapData[currentScene] || mapData['beach'];

  if (currentScene === 'intro' || currentScene === 'ending') {
    return null;
  }

  // Build points array: start node, all encounters, end node
  const pathPoints = [currentMap.start, ...currentMap.encounterPoints, currentMap.end];

  // Current player position (interpolated or snapped to current node)
  const playerPos = pathPoints[Math.min(currentEncounterId, pathPoints.length - 1)] || currentMap.start;

  // Determine categories of nodes in the path for visual display
  const getPathNodeType = (index: number) => {
    if (index === 0) return 'start';
    if (index === pathPoints.length - 1) return 'end';
    
    // Encounters index is index - 1
    const encounter = plannedEncounters[index - 1];
    if (!encounter) return 'unknown';
    
    if (encounter.startsWith('event:')) {
      return 'mission';
    }
    return 'enemy';
  };

  const getPathNodeName = (index: number, type: string) => {
    if (index === 0) return 'Punto de Partida';
    if (index === pathPoints.length - 1) return 'Salida de Zona';
    
    const encounter = plannedEncounters[index - 1];
    if (!encounter) return 'Punto Desconocido';
    
    if (encounter.startsWith('event:chest')) return 'Cofre del Tesoro';
    if (encounter.startsWith('event:shrine')) return 'Altar Ancestral';
    if (encounter.startsWith('event:rune-alignment')) return 'Desafío de Runas';
    if (encounter.startsWith('event:pet')) return 'Criatura Atrapada (NPC)';
    if (encounter.startsWith('event:lion')) return 'León Celestial (NPC)';
    if (encounter.startsWith('event:friend-relic')) return 'Reliquia del Caído';
    
    // Si es enemigo, formatear nombre
    return encounter.charAt(0).toUpperCase() + encounter.slice(1).replace('-', ' ');
  };

  const getPathNodeDesc = (index: number, type: string) => {
    if (index === 0) return 'El inicio de tu viaje en este sector.';
    if (index === pathPoints.length - 1) return 'La salida hacia el siguiente mapa.';
    
    const encounter = plannedEncounters[index - 1];
    if (!encounter) return '';
    
    if (encounter.startsWith('event:chest')) return 'Un cofre que contiene pociones o elixires valiosos.';
    if (encounter.startsWith('event:shrine')) return 'Un altar de energía que puede restaurar tu salud o potenciarte.';
    if (encounter.startsWith('event:rune-alignment')) return 'Un minijuego interactivo 2D de alineación y sincronización de runas arcanas.';
    if (encounter.startsWith('event:pet')) return 'Un zorro mágico que puedes rescatar para que sea tu compañero.';
    if (encounter.startsWith('event:lion')) return 'Un león celestial atrapado por trampas de la ciudadela.';
    if (encounter.startsWith('event:friend-relic')) return 'La espada rota de tu mejor amigo de la que emana energía astral.';
    
    return 'Un enemigo que bloquea el camino. Debes derrotarlo en combate para avanzar.';
  };

  return (
    <>
      {/* 1. COMPACT HUD MINIMAP (Top Left Corner) */}
      <div 
        className="fixed top-28 left-4 md:top-36 md:left-8 z-50 pointer-events-auto select-none animate-fade-in"
        style={{ contentVisibility: 'auto' }}
      >
        <div 
          onClick={toggleExpand}
          className="w-24 h-24 md:w-32 md:h-32 rounded-xl border border-white/20 bg-slate-950/80 backdrop-blur-md overflow-hidden relative cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] group hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300"
        >
          {/* Grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
          
          {/* Radar Sweep Effect */}
          <div className="absolute inset-0 origin-center bg-radial-gradient from-indigo-500/10 to-transparent w-full h-full rotate-radar opacity-50" />
          
          {/* SVG Map Layout */}
          <svg className="w-full h-full p-2" viewBox="0 0 100 100">
            {/* Draw Path */}
            <path
              d={`M ${pathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke="rgba(99, 102, 241, 0.2)"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            
            {/* Draw Buildings */}
            {currentMap.buildings.map((b, i) => (
              <circle
                key={`b-${i}`}
                cx={b.x}
                cy={b.y}
                r="3"
                className="fill-amber-500/30 stroke-amber-400 stroke-[1px]"
              />
            ))}

            {/* Draw NPCs */}
            {currentMap.npcs.map((n, i) => (
              <circle
                key={`n-${i}`}
                cx={n.x}
                cy={n.y}
                r="3"
                className="fill-emerald-500/30 stroke-emerald-400 stroke-[1px]"
              />
            ))}

            {/* Draw Path Nodes */}
            {pathPoints.map((p, idx) => {
              const type = getPathNodeType(idx);
              const isVisited = idx < currentEncounterId;
              const isCurrent = idx === currentEncounterId;
              
              if (idx === 0 || idx === pathPoints.length - 1) return null;

              let colorClass = "fill-slate-500 stroke-slate-400";
              if (type === 'enemy') colorClass = isVisited ? "fill-red-950/60 stroke-red-800/40" : "fill-red-600/30 stroke-red-500 stroke-[1px]";
              if (type === 'mission') colorClass = isVisited ? "fill-purple-950/60 stroke-purple-800/40" : "fill-purple-500/30 stroke-purple-400 stroke-[1px]";
              
              if (isCurrent) return null;

              return (
                <circle
                  key={`node-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className={colorClass}
                />
              );
            })}

            {/* Player Marker */}
            <circle
              cx={playerPos.x}
              cy={playerPos.y}
              r="6.5"
              className="fill-indigo-500/40 stroke-indigo-400 stroke-[1.5px] animate-ping"
            />
            <circle
              cx={playerPos.x}
              cy={playerPos.y}
              r="4.5"
              className="fill-indigo-400 stroke-white stroke-[1px]"
            />
          </svg>

          {/* Action indicator on hover */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <span className="text-[9px] md:text-[10px] text-indigo-300 font-black italic tracking-widest uppercase flex items-center gap-1">
              <Maximize2 className="w-2.5 h-2.5" /> Ampliar
            </span>
          </div>

          {/* Keyboard Hint */}
          <div className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[7px] text-white/50 border border-white/5 font-mono select-none">
            +
          </div>
        </div>
      </div>

      {/* 2. EXPANDED TACTICAL HOLO-MAP OVERLAY */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-12 pointer-events-auto"
          >
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute inset-0 pointer-events-none scanlines opacity-5" />
            <div className="absolute inset-0 pointer-events-none vignette opacity-40" />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
              className="w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-3xl frosted-glass border-white/10 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative"
            >
              {/* Top border glow line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              {/* Map Canvas Section */}
              <div className="flex-1 bg-slate-950/60 p-4 md:p-8 flex flex-col relative border-b md:border-b-0 md:border-r border-white/10">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_indigo]" />
                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">{currentMap.region}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase mt-1">
                    {currentMap.title}
                  </h2>
                  <div className="h-px bg-linear-to-r from-white/20 to-transparent w-full mt-2" />
                </div>

                {/* SVG Visualizer */}
                <div className="flex-1 w-full relative bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-2">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:15px_15px]" />
                  
                  {/* Radar sweep inside the map */}
                  <div className="absolute inset-0 origin-center bg-radial-gradient from-indigo-500/5 to-transparent w-full h-full rotate-radar opacity-40 pointer-events-none" />

                  <svg className="w-full h-full max-h-[50vh] md:max-h-full aspect-square p-6 md:p-10 select-none z-10" viewBox="0 0 100 100">
                    {/* Path coordinates line */}
                    <path
                      d={`M ${pathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.3)"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                    />

                    {/* Visited path line (Solid cyan/emerald glow up to player) */}
                    {currentEncounterId > 0 && (
                      <path
                        d={`M ${pathPoints.slice(0, currentEncounterId + 1).map(p => `${p.x} ${p.y}`).join(' L ')}`}
                        fill="none"
                        stroke="rgba(45, 212, 191, 0.6)"
                        strokeWidth="2.5"
                        className="drop-shadow-[0_0_4px_rgba(45,212,191,0.5)]"
                      />
                    )}

                    {/* Draw Buildings */}
                    {currentMap.buildings.map((b, i) => (
                      <g
                        key={`eb-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredElement({ ...b, type: 'building' })}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle
                          cx={b.x}
                          cy={b.y}
                          r="5"
                          className="fill-amber-950/40 stroke-amber-400 stroke-[1.5px] hover:fill-amber-500/30 transition-colors"
                        />
                        <Home className="text-amber-400" style={{ transform: `translate(${b.x - 3}px, ${b.y - 3}px)` }} size={6} />
                      </g>
                    ))}

                    {/* Draw NPCs */}
                    {currentMap.npcs.map((n, i) => (
                      <g
                        key={`en-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredElement({ ...n, type: 'npc' })}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r="5"
                          className="fill-emerald-950/40 stroke-emerald-400 stroke-[1.5px] hover:fill-emerald-500/30 transition-colors"
                        />
                        <User className="text-emerald-400" style={{ transform: `translate(${n.x - 3}px, ${n.y - 3}px)` }} size={6} />
                      </g>
                    ))}

                    {/* Draw Path Nodes */}
                    {pathPoints.map((p, idx) => {
                      const type = getPathNodeType(idx);
                      const isVisited = idx < currentEncounterId;
                      const isCurrent = idx === currentEncounterId;
                      
                      let colorClass = "fill-slate-700 stroke-slate-500";
                      let iconColor = "text-white/40";
                      let r = 5.5;

                      if (type === 'start') {
                        colorClass = "fill-indigo-950/50 stroke-indigo-400";
                        iconColor = "text-indigo-400";
                      } else if (type === 'end') {
                        colorClass = "fill-emerald-950/50 stroke-emerald-400";
                        iconColor = "text-emerald-400";
                      } else if (type === 'enemy') {
                        colorClass = isVisited
                          ? "fill-red-950/80 stroke-red-900/30 text-red-500/20"
                          : "fill-red-950/40 stroke-red-500 stroke-[1.5px] hover:fill-red-900/20";
                        iconColor = isVisited ? "text-red-500/30" : "text-red-400";
                      } else if (type === 'mission') {
                        colorClass = isVisited
                          ? "fill-purple-950/80 stroke-purple-900/30 text-purple-500/20"
                          : "fill-purple-950/40 stroke-purple-500 stroke-[1.5px] hover:fill-purple-900/20";
                        iconColor = isVisited ? "text-purple-500/30" : "text-purple-400";
                      }

                      if (isCurrent) return null;

                      const nodeName = getPathNodeName(idx, type);
                      const nodeDesc = getPathNodeDesc(idx, type);

                      return (
                        <g
                          key={`enode-${idx}`}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredElement({ name: nodeName, desc: nodeDesc, type: type as any, x: p.x, y: p.y })}
                          onMouseLeave={() => setHoveredElement(null)}
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={r}
                            className={`${colorClass} transition-colors duration-200`}
                          />
                          {type === 'enemy' && (
                            <Skull className={iconColor} style={{ transform: `translate(${p.x - 3}px, ${p.y - 3}px)` }} size={6} />
                          )}
                          {type === 'mission' && (
                            <Gift className={iconColor} style={{ transform: `translate(${p.x - 3}px, ${p.y - 3}px)` }} size={6} />
                          )}
                          {type === 'start' && (
                            <MapPin className={iconColor} style={{ transform: `translate(${p.x - 3.5}px, ${p.y - 4}px)` }} size={7} />
                          )}
                          {type === 'end' && (
                            <Sparkles className={iconColor} style={{ transform: `translate(${p.x - 3}px, ${p.y - 3.5}px)` }} size={6.5} />
                          )}
                        </g>
                      );
                    })}

                    {/* Player Marker */}
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredElement({
                        name: 'Tú (Héroe)',
                        desc: `Posicionado en la zona. Nivel actual de progreso: encuentro ${currentEncounterId} de ${totalEncounters}.`,
                        type: 'player',
                        x: playerPos.x,
                        y: playerPos.y
                      })}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <circle
                        cx={playerPos.x}
                        cy={playerPos.y}
                        r="11"
                        className="fill-indigo-500/20 stroke-indigo-400 stroke-[1px] animate-pulse"
                      />
                      <circle
                        cx={playerPos.x}
                        cy={playerPos.y}
                        r="7.5"
                        className="fill-indigo-500/40 stroke-indigo-300 stroke-[1.5px] animate-ping"
                      />
                      <circle
                        cx={playerPos.x}
                        cy={playerPos.y}
                        r="5.5"
                        className="fill-indigo-500 stroke-white stroke-[1.5px]"
                      />
                    </g>
                  </svg>

                  {/* Real-time coordinates monitor */}
                  <div className="absolute bottom-4 left-4 font-mono text-[9px] text-white/40 tracking-wider">
                    SYS_COORD: [X_{Math.round(playerPos.x)}, Y_{Math.round(playerPos.y)}] | SCAN_OK
                  </div>
                </div>
              </div>

              {/* Information Panel Section */}
              <div className="w-full md:w-80 bg-slate-950/90 p-6 flex flex-col justify-between relative overflow-y-auto">
                <div className="space-y-6">
                  {/* Title Info Panel */}
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-2">Panel Táctico</h3>
                    <p className="text-xs text-white/50 leading-relaxed font-medium">
                      Holograma táctico del sector. Pasa el ratón sobre los marcadores para obtener información detallada del terreno y los objetivos.
                    </p>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Context-aware Info Box */}
                  <div className="min-h-32 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    {hoveredElement ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full
                            ${hoveredElement.type === 'player' ? 'bg-indigo-400' : ''}
                            ${hoveredElement.type === 'enemy' ? 'bg-red-400' : ''}
                            ${hoveredElement.type === 'mission' ? 'bg-purple-400' : ''}
                            ${hoveredElement.type === 'building' ? 'bg-amber-400' : ''}
                            ${hoveredElement.type === 'npc' ? 'bg-emerald-400' : ''}
                          `} />
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                            {hoveredElement.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase italic tracking-wide">{hoveredElement.name}</h4>
                        <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">{hoveredElement.desc}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-4">
                        <span className="text-2xl opacity-40 mb-1">📡</span>
                        <p className="text-[10px] font-bold tracking-wider text-indigo-300/40 uppercase">Esperando señal...</p>
                        <p className="text-[8px] text-white/30 mt-1 max-w-[150px] mx-auto">Selecciona un marcador en el mapa para ver sus detalles.</p>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Map Legend */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-black tracking-wider text-indigo-400 uppercase">Leyenda</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white/20 shrink-0" />
                        <span>Jugador</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white/20 shrink-0" />
                        <span>Enemigo</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white/20 shrink-0" />
                        <span>Misión</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/20 shrink-0" />
                        <span>NPC / Aliado</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white/20 shrink-0" />
                        <span>Edificio</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-white/20 shrink-0" />
                        <span>Completado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and Controls */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between text-[8px] font-bold text-indigo-400/50 uppercase tracking-widest font-mono">
                    <span>Ver: 1.0.4a</span>
                    <span>Status: ONLINE</span>
                  </div>

                  <button
                    onClick={toggleExpand}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 border border-indigo-400/40 rounded-xl text-white font-black italic tracking-widest hover:scale-102 active:scale-98 transition-all uppercase text-xs shadow-lg cursor-pointer"
                  >
                    <Minimize2 className="w-4 h-4" />
                    Cerrar Mapa
                  </button>

                  <p className="text-center text-[9px] text-white/30 font-medium">
                    Atajo: Pulsa <span className="font-bold font-mono px-1 bg-white/10 rounded text-indigo-300">+</span> para alternar o <span className="font-bold font-mono px-1 bg-white/10 rounded text-indigo-300">Esc</span> para salir
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
