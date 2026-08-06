# Requirements Document

## Introduction

Este documento especifica los requisitos para la característica **Minimap-Game-Correlation**, que tiene como objetivo hacer que el minimapa del juego refleje dinámicamente el progreso real del jugador en cada escena, en lugar de mostrar información estática hardcodeada.

El juego es un RPG 3D con 5 niveles principales (beach, forest, ruins, city, final-boss), donde cada escena tiene una lista de encuentros planificados (`plannedEncounters`) que incluyen combates contra enemigos y eventos interactivos. El progreso se rastrea mediante `currentEncounterId`, un índice que indica el encuentro actual en la escena.

Actualmente, el minimapa (`src/components/Minimap.tsx`) muestra coordenadas estáticas y elementos que no reflejan el estado real del juego, como enemigos ya derrotados, eventos completados, o la posición dinámica del jugador según su progreso.

## Glossary

- **Minimap**: Componente visual ubicado en la esquina superior izquierda que muestra un mapa compacto de la escena actual.
- **Minimap_Expanded**: Vista ampliada del minimapa que se abre con el atajo "+" y muestra información táctica detallada.
- **Game_State**: Objeto que contiene el estado completo del juego, incluyendo escena actual, progreso, inventario, y estado del jugador.
- **Scene**: Una de las cinco áreas principales del juego (beach, forest, ruins, city, final-boss).
- **Encounter**: Un punto de interacción en la escena que puede ser un combate (enemy) o un evento interactivo (event).
- **Planned_Encounters**: Array que contiene la lista ordenada de encuentros planificados para una escena específica.
- **Current_Encounter_Id**: Índice numérico que indica el encuentro activo actual dentro de `plannedEncounters`.
- **Defeated_Monsters**: Objeto que registra los monstruos derrotados por escena.
- **Map_Element**: Edificio, NPC u otro elemento estático del mapa con coordenadas (x, y) y descripción.
- **Path_Node**: Punto en la ruta del jugador que representa un encuentro específico.
- **Player_Position**: Coordenadas (x, y) calculadas que representan la ubicación actual del jugador en el mapa.
- **Visual_State**: Representación visual de un elemento del mapa que puede ser: pendiente, completado, actual, o bloqueado.
- **Event**: Encuentro no combativo interactivo (cofre, altar, minijuego de runas, rescate de mascota).
- **Enemy**: Encuentro combativo donde el jugador debe derrotar a un monstruo.

## Requirements

### Requirement 1: Renderizado Dinámico de Encuentros en el Minimapa

**User Story:** Como jugador, quiero ver en el minimapa solo los encuentros que todavía están pendientes, para saber qué desafíos me quedan en la escena actual.

#### Acceptance Criteria

1. WHEN `currentEncounterId` cambia, THE Minimap SHALL actualizar visualmente los nodos de encuentros para reflejar el progreso actual.
2. FOR ALL encuentros en `plannedEncounters` donde el índice es menor que `currentEncounterId`, THE Minimap SHALL renderizar esos encuentros con un estado visual de "completado" (opacidad reducida, color gris/tenue, icono de checkmark).
3. WHEN un encuentro es el encuentro actual (índice igual a `currentEncounterId`), THE Minimap SHALL renderizar ese encuentro con un estado visual de "activo" (color brillante, animación de pulso, borde destacado).
4. FOR ALL encuentros con índice mayor que `currentEncounterId`, THE Minimap SHALL renderizar esos encuentros con un estado visual de "pendiente" (color normal, opacidad completa).
5. THE Minimap SHALL calcular dinámicamente la posición del jugador (Player_Position) interpolando las coordenadas del Path_Node correspondiente a `currentEncounterId`.

### Requirement 2: Correlación de Iconos con Tipos de Encuentros

**User Story:** Como jugador, quiero ver iconos diferenciados para cada tipo de encuentro en el minimapa, para identificar rápidamente si es un combate, un evento, o un minijuego.

#### Acceptance Criteria

1. WHEN un encuentro en `plannedEncounters` es de tipo enemigo (no comienza con 'event:'), THE Minimap SHALL renderizar el nodo con un icono de calavera (Skull) y color rojo.
2. WHEN un encuentro comienza con 'event:chest', THE Minimap SHALL renderizar el nodo con un icono de regalo (Gift) y color púrpura.
3. WHEN un encuentro comienza con 'event:shrine', THE Minimap SHALL renderizar el nodo con un icono de chispa (Sparkles) y color púrpura.
4. WHEN un encuentro comienza con 'event:rune-alignment', THE Minimap SHALL renderizar el nodo con un icono de chispas (Sparkles) y color cian.
5. WHEN un encuentro comienza con 'event:pet' o 'event:lion', THE Minimap SHALL renderizar el nodo con un icono de usuario (User) y color esmeralda (indicando NPC/aliado).
6. WHEN un encuentro comienza con 'event:friend-relic', THE Minimap SHALL renderizar el nodo con un icono de chispa (Sparkle) y color púrpura.
7. THE Minimap SHALL mantener consistencia entre los iconos del minimapa compacto y el minimapa expandido.

### Requirement 3: Ocultar o Atenuar Elementos Estáticos Irrelevantes

**User Story:** Como jugador, quiero que los edificios y NPCs mostrados en el minimapa sean relevantes al progreso actual, para no ver información obsoleta o confusa.

#### Acceptance Criteria

1. WHERE un Map_Element de tipo edificio está asociado a un encuentro específico, THE Minimap SHALL ocultar o atenuar ese edificio WHEN el encuentro asociado ha sido completado (índice menor que `currentEncounterId`).
2. WHERE un Map_Element de tipo NPC está asociado a un evento de rescate (pet, lion) que ha sido completado, THE Minimap SHALL ocultar ese NPC del minimapa expandido.
3. THE Minimap SHALL renderizar edificios genéricos sin asociación a encuentros con opacidad normal en todo momento.
4. THE Minimap SHALL proporcionar metadatos en cada Map_Element indicando si está asociado a un encuentro específico mediante un campo opcional `linkedEncounterId`.

### Requirement 4: Actualización de Línea de Ruta Visitada

**User Story:** Como jugador, quiero ver una línea de progreso que muestre claramente el camino que ya he recorrido, para tener una sensación visual de avance.

#### Acceptance Criteria

1. WHEN `currentEncounterId` es mayor que cero, THE Minimap_Expanded SHALL renderizar una línea de ruta desde el punto de inicio hasta el Path_Node actual con un color distintivo (cyan/esmeralda).
2. THE línea de ruta visitada SHALL tener un efecto visual de sombra o brillo para diferenciarla de la línea de ruta completa (que usa color índigo tenue con guiones).
3. WHEN `currentEncounterId` aumenta, THE línea de ruta visitada SHALL extenderse dinámicamente hasta el nuevo Path_Node actual con una animación suave.
4. THE Minimap SHALL renderizar la línea de ruta completa (todos los Path_Nodes) con una opacidad reducida (20-30%) y estilo punteado.

### Requirement 5: Información Contextual Dinámica en Hover

**User Story:** Como jugador, quiero que al pasar el cursor sobre un encuentro en el minimapa expandido, se me muestre información actualizada sobre ese encuentro, para saber si ya lo completé o qué me espera.

#### Acceptance Criteria

1. WHEN el jugador pasa el cursor sobre un Path_Node en el Minimap_Expanded, THE Minimap SHALL mostrar un tooltip con el nombre del encuentro, su descripción, y su estado (completado/activo/pendiente).
2. WHERE un Path_Node representa un encuentro completado, THE tooltip SHALL incluir el texto "✓ Completado" en color esmeralda.
3. WHERE un Path_Node representa el encuentro actual, THE tooltip SHALL incluir el texto "⬤ En Progreso" en color índigo brillante.
4. WHERE un Path_Node representa un encuentro pendiente, THE tooltip SHALL incluir el texto "⏳ Pendiente" en color blanco/gris.
5. THE tooltip SHALL actualizarse instantáneamente WHEN `currentEncounterId` cambia mientras el cursor está sobre un nodo.

### Requirement 6: Persistencia del Estado Visual entre Vistas

**User Story:** Como jugador, quiero que el estado visual del minimapa compacto y el expandido sean consistentes entre sí, para no ver información contradictoria.

#### Acceptance Criteria

1. WHEN el jugador alterna entre el minimapa compacto y el expandido, THE estado visual de todos los nodos de encuentros SHALL ser idéntico en ambas vistas.
2. WHEN un encuentro se marca como completado mediante el avance de `currentEncounterId`, THE Minimap compacto y Minimap_Expanded SHALL reflejar ese cambio simultáneamente.
3. THE coordenadas calculadas de Player_Position SHALL ser las mismas en ambas vistas del minimapa.

### Requirement 7: Indicador de Progreso Numérico

**User Story:** Como jugador, quiero ver un contador que me indique cuántos encuentros he completado del total en la escena, para conocer mi porcentaje de avance.

#### Acceptance Criteria

1. THE Minimap_Expanded SHALL renderizar un indicador textual que muestre "Encuentro X de Y" donde X es `currentEncounterId + 1` e Y es el total de encuentros en `plannedEncounters`.
2. WHEN todos los encuentros en la escena han sido completados (`currentEncounterId >= plannedEncounters.length`), THE indicador textual SHALL mostrar "Zona Completada ✓" en color esmeralda.
3. THE indicador de progreso SHALL actualizarse inmediatamente WHEN `currentEncounterId` cambia.

### Requirement 8: Reinicio del Estado Visual al Cambiar de Escena

**User Story:** Como jugador, quiero que el minimapa se reinicie completamente cuando entro a una nueva escena, para empezar con información limpia y relevante.

#### Acceptance Criteria

1. WHEN `gameState.currentScene` cambia a una nueva Scene, THE Minimap SHALL reinicializar todos los estados visuales de encuentros.
2. WHEN entra a una nueva Scene, THE Minimap SHALL calcular los nuevos Path_Nodes basándose en `plannedEncounters[currentScene]`.
3. WHEN `currentEncounterId` se reinicia a cero al cambiar de escena, THE Player_Position SHALL posicionarse en el punto de inicio (start) del nuevo mapa.
4. THE Minimap SHALL cargar dinámicamente los Map_Elements (edificios, NPCs) correspondientes a la nueva Scene desde la configuración `mapData`.

### Requirement 9: Animación Suave de Transición de Nodos

**User Story:** Como jugador, quiero ver transiciones visuales suaves cuando completo un encuentro, para tener una experiencia visual fluida y satisfactoria.

#### Acceptance Criteria

1. WHEN un Path_Node cambia de estado "activo" a "completado", THE Minimap SHALL aplicar una animación de desvanecimiento con duración de 300-500ms.
2. WHEN el marcador de Player_Position se mueve al siguiente Path_Node, THE Minimap SHALL interpolar la posición con una transición suave de 400-600ms usando una curva de aceleración (ease-out).
3. WHEN la línea de ruta visitada se extiende, THE Minimap SHALL animar el trazo de la línea con un efecto de "dibujo progresivo" (stroke animation).

### Requirement 10: Renderizado Condicional de Elementos de Progreso Especial

**User Story:** Como jugador, quiero que el minimapa refleje mis logros especiales (mascotas rescatadas, habilidades desbloqueadas), para visualizar mi progreso global.

#### Acceptance Criteria

1. WHERE `gameState.hasPet` es verdadero Y el evento 'event:pet' fue completado en la escena forest, THE Minimap_Expanded SHALL mostrar un icono de mascota en el panel de información con un estado visual de "activo" (color esmeralda brillante).
2. WHERE `gameState.hasLion` es verdadero Y el evento 'event:lion' fue completado en la escena city, THE Minimap_Expanded SHALL mostrar un icono de león en el panel de información con un estado visual de "activo" (color naranja brillante).
3. WHERE `gameState.player.transformationUnlocked` es verdadero Y el evento 'event:friend-relic' fue completado en la escena ruins, THE Minimap_Expanded SHALL mostrar un indicador de ascensión desbloqueada en el panel de información.
4. THE Minimap SHALL mantener estos indicadores visibles en todas las escenas posteriores una vez desbloqueados.

