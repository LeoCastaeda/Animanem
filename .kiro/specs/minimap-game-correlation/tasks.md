# Implementation Plan: Minimap-Game-Correlation

## Overview

Este plan transforma el minimapa estático actual en un sistema dinámico que refleja el progreso real del jugador en tiempo real. La implementación se realizará en TypeScript, construyendo sobre el componente existente `src/components/Minimap.tsx` mediante refactorización incremental y modularización de la lógica de renderizado.

## Tasks

- [x] 1. Setup: Crear estructura de módulos y tipos
  - Crear carpeta `src/components/minimap/`
  - Crear `src/components/minimap/types.ts` con tipos `VisualState`, `NodeType`, `TooltipData`
  - Crear `src/components/minimap/constants.ts` con mapeos de iconos y clases de color
  - Crear `src/components/minimap/helpers.ts` con funciones puras (vacías por ahora)
  - Configurar imports en el componente principal `Minimap.tsx`
  - _Requirements: 1.1, 2.1, 6.1_

- [x] 2. Implementar funciones helper core
  - [x] 2.1 Implementar `getPathNodeVisualState(index: number, currentEncounterId: number): VisualState`
    - Retorna 'completed' si `index < currentEncounterId`
    - Retorna 'active' si `index === currentEncounterId`
    - Retorna 'pending' si `index > currentEncounterId`
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [ ] 2.2 Escribir property test para `getPathNodeVisualState`
    - **Property 1: Node Visual State Correctness**
    - **Valida: Requirements 1.2, 1.3, 1.4**
  
  - [x] 2.3 Implementar `getNodeColorClasses(type: NodeType, state: VisualState): string`
    - Mapear combinaciones tipo-estado a clases Tailwind CSS
    - Seguir tabla de colores del documento de diseño
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ] 2.4 Escribir property test para mapeo de iconos de encuentros
    - **Property 2: Encounter Type to Icon Mapping**
    - **Valida: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

- [x] 3. Checkpoint - Validar funciones helper
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Refactorizar vista compacta del minimapa con estados visuales
  - [x] 4.1 Agregar atributo `data-state` a nodos en vista compacta
    - Usar `getPathNodeVisualState()` para determinar estado
    - Agregar `data-encounter-type` para cada tipo de encuentro
    - Agregar `data-encounter-index` con el índice del encuentro
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [x] 4.2 Aplicar clases de color dinámicas usando `getNodeColorClasses()`
    - Reemplazar lógica inline de clases con llamadas a función helper
    - Asegurar consistencia entre nodos de tipo enemy/mission/rune
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 4.3 Escribir unit tests para renderizado de vista compacta
    - Verificar atributos data-state correctos para diferentes estados
    - Verificar clases CSS aplicadas según tipo y estado
    - _Requirements: 1.2, 1.3, 1.4, 2.1_

- [x] 5. Refactorizar vista expandida del minimapa
  - [x] 5.1 Sincronizar vista expandida con mismos estados visuales que vista compacta
    - Aplicar `getPathNodeVisualState()` y `getNodeColorClasses()` en SVG expandido
    - Agregar atributos `data-state`, `data-encounter-type`, `data-encounter-index`
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 5.2 Escribir property test para consistencia entre vistas
    - **Property 7: Cross-View Consistency**
    - **Valida: Requirements 6.1, 6.2, 6.3**
  
  - [x] 5.3 Escribir unit tests para vista expandida
    - Verificar que tooltips muestran estado correcto (completado/activo/pendiente)
    - Verificar sincronización de Player_Position entre vistas
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_

- [ ] 6. Checkpoint - Validar refactorización de vistas
  - Ensure all tests pass, ask the user if questions arise.

- [-] 7. Implementar sistema de visibilidad de Map_Elements
  - [x] 7.1 Extender interface `MapElement` con campo opcional `linkedEncounterId`
    - Actualizar tipo en `src/components/minimap/types.ts`
    - Agregar campo `linkedEncounterId?: number` a la interfaz
    - _Requirements: 3.4_
  
  - [x] 7.2 Implementar función `shouldRenderMapElement(element: MapElement, currentEncounterId: number): boolean`
    - Retorna `true` si `linkedEncounterId` es undefined
    - Retorna `false` si `linkedEncounterId < currentEncounterId`
    - Retorna `true` en otros casos
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [-] 7.3 Escribir property test para visibilidad de Map_Elements
    - **Property 4: Map Element Visibility Based on Completion**
    - **Valida: Requirements 3.1, 3.2, 3.3**
  
  - [ ] 7.4 Actualizar datos de `mapData` con `linkedEncounterId` en elementos relevantes
    - Agregar `linkedEncounterId` a edificios y NPCs en scenes beach, forest, ruins, city, final-boss
    - Asociar elementos con sus encuentros correspondientes según lógica del juego
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [ ] 7.5 Aplicar filtrado de visibilidad en renderizado de edificios y NPCs
    - Usar `shouldRenderMapElement()` antes de renderizar cada edificio/NPC
    - Aplicar en vista compacta y vista expandida
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Implementar visualización de ruta visitada
  - [ ] 8.1 Implementar función `getVisitedPathSegment(pathPoints: Point[], currentEncounterId: number): string`
    - Retorna string vacío si `currentEncounterId === 0`
    - Retorna SVG path string conectando `pathPoints[0]` hasta `pathPoints[currentEncounterId]`
    - _Requirements: 4.1, 4.2_
  
  - [ ] 8.2 Escribir property test para renderizado de ruta visitada
    - **Property 5: Visited Path Rendering**
    - **Valida: Requirements 4.1, 4.2**
  
  - [ ] 8.3 Agregar elemento SVG para ruta visitada en vista expandida
    - Renderizar nuevo elemento `<path>` con resultado de `getVisitedPathSegment()`
    - Aplicar estilo distintivo: color cyan/emerald, stroke-width 2.5, shadow effect
    - Posicionar antes del marcador del jugador en orden de capas
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 8.4 Escribir property test para presencia de ruta completa
    - **Property 6: Complete Route Path Presence**
    - **Valida: Requirements 4.4**

- [ ] 9. Checkpoint - Validar sistema de visibilidad y rutas
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implementar indicador de progreso dinámico
  - [ ] 10.1 Agregar cálculo de progreso en Minimap_Expanded
    - Calcular `currentProgress = currentEncounterId + 1` y `totalEncounters = plannedEncounters.length`
    - _Requirements: 7.1_
  
  - [ ] 10.2 Implementar renderizado condicional de indicador de progreso
    - Mostrar "Encuentro {currentProgress} de {totalEncounters}" si `currentEncounterId < totalEncounters`
    - Mostrar "Zona Completada ✓" en color esmeralda si `currentEncounterId >= totalEncounters`
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 10.3 Escribir property test para indicador de progreso
    - **Property 8: Progress Indicator Accuracy**
    - **Valida: Requirements 7.1, 7.2**

- [ ] 11. Implementar reinicio de estado en cambio de escena
  - [ ] 11.1 Agregar effect para detectar cambios en `currentScene`
    - Usar `useEffect` con dependencia `[currentScene]`
    - Limpiar estados locales del minimapa al cambiar escena
    - _Requirements: 8.1, 8.2_
  
  - [ ] 11.2 Escribir property test para reinicio de estado
    - **Property 9: Scene Change Data Reload**
    - **Valida: Requirements 8.1, 8.2, 8.4**
  
  - [ ] 11.3 Escribir property test para posición inicial en nueva escena
    - **Property 10: Initial Position on Scene Entry**
    - **Valida: Requirements 8.3**

- [ ] 12. Implementar validación de posición del jugador
  - [ ] 12.1 Mejorar cálculo de `playerPos` con validación de límites
    - Agregar guards para `currentEncounterId` fuera de rango
    - Usar `Math.min(Math.max(0, currentEncounterId), pathPoints.length - 1)`
    - _Requirements: 1.5_
  
  - [ ] 12.2 Escribir property test para precisión de posición del jugador
    - **Property 3: Player Position Accuracy**
    - **Valida: Requirements 1.5**

- [ ] 13. Checkpoint - Validar progreso y cambio de escena
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implementar indicadores de logros especiales
  - [ ] 14.1 Crear componente visual para indicadores de logros en información panel
    - Agregar sección "Logros Especiales" en el panel de información expandido
    - Mostrar icono de mascota si `gameState.hasPet === true` con color esmeralda
    - Mostrar icono de león si `gameState.hasLion === true` con color naranja
    - Mostrar indicador de ascensión si `gameState.player.transformationUnlocked === true`
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 14.2 Escribir property test para indicadores de logros especiales
    - **Property 11: Special Achievement Indicators**
    - **Valida: Requirements 10.1, 10.2, 10.3, 10.4**
  
  - [ ] 14.3 Escribir unit tests para persistencia de indicadores
    - Verificar que indicadores persisten al cambiar de escena
    - Verificar renderizado condicional basado en flags del gameState
    - _Requirements: 10.4_

- [ ] 15. Implementar animaciones de transición
  - [ ] 15.1 Agregar animación de fade para nodos completados
    - Usar `motion` (Framer Motion) para transición de opacidad 300-500ms
    - Aplicar en cambio de estado de 'active' a 'completed'
    - _Requirements: 9.1_
  
  - [ ] 15.2 Agregar animación de movimiento suave para Player_Position
    - Usar transición CSS o Framer Motion con curva ease-out 400-600ms
    - Aplicar cuando `currentEncounterId` cambia
    - _Requirements: 9.2_
  
  - [ ] 15.3 Agregar animación de dibujo progresivo para ruta visitada
    - Usar `stroke-dasharray` y `stroke-dashoffset` para efecto de dibujo
    - Animar cuando la ruta visitada se extiende
    - _Requirements: 9.3_
  
  - [ ] 15.4 Escribir integration tests para animaciones
    - Verificar que animaciones se activan en cambios de estado
    - Verificar duración y curvas de transición
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 16. Agregar manejo defensivo de errores
  - [ ] 16.1 Implementar guards para estados inválidos
    - Validar `currentEncounterId` no sea negativo ni mayor que array length
    - Validar que `currentScene` esté en las claves de `mapData`
    - Retornar early con mensaje de error si `gameState` es null/undefined
    - _Requirements: 8.1, 8.2_
  
  - [ ] 16.2 Implementar fallback para `plannedEncounters` vacío
    - Renderizar solo nodos de inicio y fin si `plannedEncounters.length === 0`
    - Mostrar mensaje "No hay encuentros en esta escena" en indicador de progreso
    - _Requirements: 7.1, 8.1_
  
  - [ ] 16.3 Escribir unit tests para manejo de errores
    - Test con `currentEncounterId` fuera de rango
    - Test con `plannedEncounters` vacío
    - Test con `currentScene` inválido
    - _Requirements: 8.1, 8.2_

- [ ] 17. Checkpoint - Validar animaciones y error handling
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Optimización de performance
  - [ ] 18.1 Agregar memoización para `pathPoints` y `currentMap`
    - Usar `useMemo` con dependencia `[currentScene, currentMap.encounterPoints]`
    - Memoizar cálculo de `pathPoints`
    - _Requirements: 8.1, 8.2_
  
  - [ ] 18.2 Agregar renderizado condicional para escenas intro/ending
    - Early return en Minimap si `currentScene === 'intro' || currentScene === 'ending'`
    - (Ya existe, validar que continúe funcionando)
    - _Requirements: 8.1_
  
  - [ ] 18.3 Escribir performance tests
    - Test con lista de 20+ encuentros
    - Verificar tiempo de render <100ms para cambios de estado
    - _Requirements: 9.1, 9.2_

- [ ] 19. Agregar atributos de accesibilidad
  - [ ] 19.1 Agregar `aria-label` a nodos interactivos en SVG
    - Agregar labels descriptivos para nodos de encuentros
    - Agregar label para marcador del jugador
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 19.2 Agregar soporte de navegación por teclado
    - (Ya existe con shortcuts + y Escape, validar funcionamiento)
    - Verificar que tooltips sean accesibles por teclado
    - _Requirements: 5.1, 6.1_
  
  - [ ] 19.3 Escribir integration tests para accesibilidad
    - Verificar presencia de aria-labels
    - Verificar navegación por teclado funciona correctamente
    - _Requirements: 5.1_

- [ ] 20. Final checkpoint - Validación integral del sistema
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los property tests validan propiedades universales de corrección definidas en el documento de diseño
- Los unit tests validan casos específicos y edge cases
- Los checkpoints aseguran validación incremental del progreso
- Se usa TypeScript con React y Framer Motion (bibliotecas ya presentes en el proyecto)
- Las funciones helper son puras y testables de forma aislada
- El componente mantiene su arquitectura actual sin cambios en la estructura de GameState
