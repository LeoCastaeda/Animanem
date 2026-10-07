/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface ProceduralMonsterProps {
  monsterId: string;
}

function ProceduralMonster({ monsterId }: ProceduralMonsterProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const secondaryRef = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Obtener configuración del monstruo según el ID
  const monsterConfig = useMemo(() => {
    // Determinar la categoría principal según el ID
    let category = 'shadow';
    if (monsterId.startsWith('shadow')) category = 'shadow';
    else if (monsterId.startsWith('ghoul')) category = 'ghoul';
    else if (monsterId.startsWith('beast')) category = 'beast';
    else if (monsterId.startsWith('guardian')) category = 'guardian';
    else if (monsterId.startsWith('wraith')) category = 'wraith';
    else if (monsterId.startsWith('golem')) category = 'golem';
    else if (monsterId.startsWith('spirit')) category = 'spirit';
    else if (monsterId.startsWith('ice-giant')) category = 'ice-giant';
    else if (monsterId.startsWith('demon')) category = 'demon';
    else if (monsterId.startsWith('dark-knight')) category = 'dark-knight';
    else if (monsterId.startsWith('titan')) category = 'titan';
    else if (monsterId === 'colossus') category = 'colossus';

    switch (category) {
      case 'shadow':
        return {
          coreColor: '#3b0764', // Morado oscuro
          emissiveColor: '#581c87',
          outerColor: '#1e1b4b',
          particleColor: '#a855f7',
          coreType: 'sphere',
          outerType: 'torus',
          particleCount: 12,
          speedMult: 1.2,
          scale: 1.0,
          wireframe: true,
        };
      case 'ghoul':
        return {
          coreColor: '#991b1b', // Rojo carmesí
          emissiveColor: '#7f1d1d',
          outerColor: '#450a0a',
          particleColor: '#ef4444',
          coreType: 'octahedron',
          outerType: 'icosahedron',
          particleCount: 10,
          speedMult: 1.5,
          scale: 0.9,
          wireframe: true,
        };
      case 'beast':
        return {
          coreColor: '#064e3b', // Verde esmeralda
          emissiveColor: '#065f46',
          outerColor: '#022c22',
          particleColor: '#10b981',
          coreType: 'dodecahedron',
          outerType: 'dodecahedron',
          particleCount: 14,
          speedMult: 1.1,
          scale: 1.1,
          wireframe: false,
        };
      case 'guardian':
        return {
          coreColor: '#451a03', // Marrón piedra/fuego
          emissiveColor: '#78350f',
          outerColor: '#b45309',
          particleColor: '#f59e0b',
          coreType: 'box',
          outerType: 'box',
          particleCount: 8,
          speedMult: 0.7,
          scale: 1.05,
          wireframe: false,
        };
      case 'wraith':
        return {
          coreColor: '#0e7490', // Cyan espectral
          emissiveColor: '#0891b2',
          outerColor: '#155e75',
          particleColor: '#22d3ee',
          coreType: 'torusKnot',
          outerType: 'sphere',
          particleCount: 15,
          speedMult: 1.4,
          scale: 0.85,
          wireframe: true,
          opacity: 0.6,
        };
      case 'golem':
        return {
          coreColor: '#374151', // Gris oscuro / magma
          emissiveColor: '#991b1b',
          outerColor: '#1f2937',
          particleColor: '#dc2626',
          coreType: 'box',
          outerType: 'icosahedron',
          particleCount: 6,
          speedMult: 0.5,
          scale: 1.25,
          wireframe: false,
        };
      case 'spirit':
        return {
          coreColor: '#d97706', // Oro espiritual
          emissiveColor: '#f59e0b',
          outerColor: '#fbbf24',
          particleColor: '#fef08a',
          coreType: 'octahedron',
          outerType: 'torus',
          particleCount: 16,
          speedMult: 1.0,
          scale: 0.95,
          wireframe: false,
        };
      case 'ice-giant':
        return {
          coreColor: '#0369a1', // Azul hielo
          emissiveColor: '#0284c7',
          outerColor: '#e0f2fe',
          particleColor: '#38bdf8',
          coreType: 'octahedron',
          outerType: 'dodecahedron',
          particleCount: 12,
          speedMult: 0.8,
          scale: 1.2,
          wireframe: false,
        };
      case 'demon':
        return {
          coreColor: '#7f1d1d', // Rojo fuego demoníaco
          emissiveColor: '#b91c1c',
          outerColor: '#f97316',
          particleColor: '#facc15',
          coreType: 'cone',
          outerType: 'torusKnot',
          particleCount: 18,
          speedMult: 1.8,
          scale: 1.15,
          wireframe: false,
        };
      case 'dark-knight':
        return {
          coreColor: '#111827', // Metal negro
          emissiveColor: '#ef4444',
          outerColor: '#374151',
          particleColor: '#f43f5e',
          coreType: 'torusKnot',
          outerType: 'dodecahedron',
          particleCount: 14,
          speedMult: 1.0,
          scale: 1.1,
          wireframe: true,
        };
      case 'titan':
        return {
          coreColor: '#2e1065', // Vacío violeta titanico
          emissiveColor: '#4c1d95',
          outerColor: '#1e1b4b',
          particleColor: '#d8b4fe',
          coreType: 'icosahedron',
          outerType: 'box',
          particleCount: 16,
          speedMult: 0.6,
          scale: 1.3,
          wireframe: false,
        };
      case 'colossus':
      default:
        return {
          coreColor: '#4c1d95', // Coloso celestial (Púrpura y Oro)
          emissiveColor: '#d97706',
          outerColor: '#fbbf24',
          particleColor: '#a855f7',
          coreType: 'sphere',
          outerType: 'torusKnot',
          particleCount: 30,
          speedMult: 2.0,
          scale: 1.4,
          wireframe: false,
        };
    }
  }, [monsterId]);

  // Generar posiciones estables para las partículas
  const particles = useMemo(() => {
    const count = monsterConfig.particleCount;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.5;
      const speed = (0.4 + Math.random() * 0.8) * monsterConfig.speedMult;
      const yOffset = (Math.random() - 0.5) * 0.8;
      const scale = 0.04 + Math.random() * 0.06;
      return { angle, radius, speed, yOffset, scale };
    });
  }, [monsterConfig]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const sm = monsterConfig.speedMult;

    // Animación de Rotación y Escala del núcleo
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.4 * sm;
      coreRef.current.rotation.x = time * 0.2 * sm;
      
      const pulse = 1.0 + Math.sin(time * 2.5 * sm) * 0.06;
      coreRef.current.scale.set(
        monsterConfig.scale * pulse,
        monsterConfig.scale * pulse,
        monsterConfig.scale * pulse
      );
    }

    // Animación del contenedor externo/escudo
    if (outerRef.current) {
      outerRef.current.rotation.y = -time * 0.3 * sm;
      outerRef.current.rotation.z = time * 0.15 * sm;
      const outerScale = monsterConfig.scale * 1.5;
      outerRef.current.scale.set(outerScale, outerScale, outerScale);
    }

    // Animación del secundario (para jefes o formas complejas)
    if (secondaryRef.current) {
      secondaryRef.current.rotation.x = -time * 0.5 * sm;
      secondaryRef.current.rotation.y = time * 0.6 * sm;
      const secScale = monsterConfig.scale * 1.8;
      secondaryRef.current.scale.set(secScale, secScale, secScale);
    }

    // Animación de partículas orbitales
    if (particleGroupRef.current) {
      const children = particleGroupRef.current.children;
      particles.forEach((p, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          const currentAngle = p.angle + time * p.speed * 0.6;
          mesh.position.x = Math.cos(currentAngle) * p.radius;
          mesh.position.z = Math.sin(currentAngle) * p.radius;
          mesh.position.y = p.yOffset + Math.sin(time * 2 + idx) * 0.12;
        }
      });
    }
  });

  // Renderizador dinámico de Geometrías según la configuración
  const renderGeometry = (type: string, detail = 0) => {
    switch (type) {
      case 'octahedron':
        return <octahedronGeometry args={[0.7, detail]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[0.7, detail]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.7, detail]} />;
      case 'box':
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
      case 'cone':
        return <coneGeometry args={[0.6, 1.2, 8]} />;
      case 'torus':
        return <torusGeometry args={[0.6, 0.15, 8, 24]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[0.45, 0.15, 64, 8]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={[0.65, 16, 16]} />;
    }
  };

  return (
    <group>
      {/* Luz focal interna */}
      <pointLight position={[0, 0, 0]} intensity={2.5} color={monsterConfig.emissiveColor} />

      {/* Núcleo Principal */}
      <mesh ref={coreRef}>
        {renderGeometry(monsterConfig.coreType)}
        <meshStandardMaterial
          color={monsterConfig.coreColor}
          emissive={monsterConfig.emissiveColor}
          emissiveIntensity={1.8}
          roughness={monsterConfig.wireframe ? 0.3 : 0.1}
          metalness={0.9}
          transparent={monsterConfig.opacity !== undefined}
          opacity={monsterConfig.opacity ?? 1}
          flatShading={!monsterConfig.wireframe}
          wireframe={monsterConfig.wireframe}
        />
      </mesh>

      {/* Escudo / Estructura Externa */}
      <mesh ref={outerRef}>
        {renderGeometry(monsterConfig.outerType, 1)}
        <meshBasicMaterial
          color={monsterConfig.outerColor}
          wireframe
          transparent
          opacity={monsterConfig.opacity ? monsterConfig.opacity * 0.5 : 0.35}
        />
      </mesh>

      {/* Anillo Adicional para el Coloso Final */}
      {monsterId === 'colossus' && (
        <mesh ref={secondaryRef}>
          <torusGeometry args={[0.8, 0.05, 8, 32]} />
          <meshBasicMaterial
            color="#e9d5ff"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Partículas Orbitantes */}
      <group ref={particleGroupRef}>
        {particles.map((p, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[p.scale, 6, 6]} />
            <meshBasicMaterial color={monsterConfig.particleColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

class ModelErrorBoundary extends Component<{ fallback: React.ReactNode; children?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: React.ReactNode; children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { fallback: React.ReactNode; children?: React.ReactNode }) {
    if (prevProps.fallback !== this.props.fallback && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default function Monster3D({ monsterId, modelPath }: { monsterId: string; modelPath?: string }) {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    if (!modelPath) {
      setHasModel(false);
      return;
    }
    setHasModel(null);
    let mounted = true;
    // Check if the GLB exists before trying to load it to avoid loader errors
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => {
        if (!mounted) return;
        const contentType = res.headers.get('content-type') ?? '';
        const looksLikeGlb = /glb|gltf|model\/gltf-binary|application\/octet-stream/i.test(contentType);
        setHasModel(res.ok && (contentType ? looksLikeGlb : true));
      })
      .catch(() => {
        if (!mounted) return;
        setHasModel(false);
      });
    return () => { mounted = false; };
  }, [modelPath]);

  function ModelEntity({ path }: { path: string }) {
    const group = useRef<THREE.Group | null>(null);
    const { scene, animations } = useGLTF(path, '/draco/') as any;
    const { actions } = useAnimations(animations, group as any) as { actions?: Record<string, any> };

    useEffect(() => {
      // Protección: actions puede ser null/undefined o un objeto vacío
      if (!actions || Object.keys(actions).length === 0) return;

      // Preferir clips por nombre común, si no usar el primero
      const preferred = actions['Attack'] ?? actions['attack'] ?? actions['Idle'] ?? actions['idle'] ?? Object.values(actions)[0];
      if (!preferred) return;

      // Reproducir con fades si están disponibles
      try {
        if (typeof preferred.reset === 'function') preferred.reset();
        if (typeof preferred.fadeIn === 'function') preferred.fadeIn(0.2);
        if (typeof preferred.play === 'function') preferred.play();
      } catch (e) {
        // Si algo falla, intentar play directo en todas las acciones como fallback
        Object.values(actions).forEach((a) => { try { a.play?.(); } catch {} });
      }

      return () => {
        try { preferred.fadeOut?.(0.2); } catch {}
      };
    }, [actions]);

    useFrame((state, delta) => {
      if (group.current) {
        group.current.rotation.y += delta * 0.25;
        group.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.1) * 0.08;
      }
    });

    return (
      <group ref={group}>
        <primitive object={scene} />
      </group>
    );
  }

  return (
    <div className="w-full h-18 sm:h-27.5 md:h-full min-h-16 max-h-25 sm:max-h-35 md:min-h-55 md:max-h-75 flex items-center justify-center relative select-none">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />

        <Float speed={2.0} rotationIntensity={0.4} floatIntensity={0.5}>
          {hasModel === true && modelPath ? (
            <ModelErrorBoundary fallback={<ProceduralMonster monsterId={monsterId} />}>
              <Suspense fallback={<ProceduralMonster monsterId={monsterId} />}>
                <ModelEntity path={modelPath} />
              </Suspense>
            </ModelErrorBoundary>
          ) : (
            <ProceduralMonster monsterId={monsterId} />
          )}
        </Float>

        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.5} 
          scale={4} 
          blur={1.8} 
          far={3.0} 
        />
      </Canvas>
    </div>
  );
}
