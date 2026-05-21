/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ProceduralModelProps {
  isTransformed: boolean;
}

function ProceduralHero({ isTransformed }: ProceduralModelProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerShieldRef = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Generar posiciones estables para las partículas orbitales
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.4;
      const speed = 0.5 + Math.random() * 0.8;
      const yOffset = (Math.random() - 0.5) * 0.5;
      return { angle, radius, speed, yOffset, scale: 0.05 + Math.random() * 0.05 };
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speedMult = isTransformed ? 4 : 1;

    // Rotar núcleo
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.5 * speedMult;
      coreRef.current.rotation.x = time * 0.3 * speedMult;
      
      // Respiración del cristal
      const scale = (isTransformed ? 1.6 : 1.0) + Math.sin(time * 2) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }

    // Rotar escudo wireframe
    if (outerShieldRef.current) {
      outerShieldRef.current.rotation.y = -time * 0.25 * speedMult;
      outerShieldRef.current.rotation.z = time * 0.1 * speedMult;
      const shieldScale = isTransformed ? 2.2 : 1.6;
      outerShieldRef.current.scale.set(shieldScale, shieldScale, shieldScale);
    }

    // Orbitar partículas
    if (particleGroupRef.current) {
      const children = particleGroupRef.current.children;
      particles.forEach((p, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          const currentAngle = p.angle + time * p.speed * 0.8 * speedMult;
          mesh.position.x = Math.cos(currentAngle) * p.radius;
          mesh.position.z = Math.sin(currentAngle) * p.radius;
          mesh.position.y = p.yOffset + Math.sin(time * 3 + idx) * 0.1;
        }
      });
    }
  });

  // Colores según transformación
  const coreColor = isTransformed ? '#f59e0b' : '#6366f1';
  const emissiveColor = isTransformed ? '#f59e0b' : '#312e81';
  const shieldColor = isTransformed ? 'rgba(245, 158, 11, 0.4)' : 'rgba(99, 102, 241, 0.2)';

  return (
    <group>
      {/* Luz focal interna */}
      <pointLight position={[0, 0, 0]} intensity={isTransformed ? 3.0 : 1.0} color={coreColor} />

      {/* Núcleo Cristal (Icosaedro) */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={emissiveColor}
          emissiveIntensity={isTransformed ? 2.5 : 0.8}
          roughness={0.1}
          metalness={0.9}
          flatShading
        />
      </mesh>

      {/* Escudo Arcane Wireframe (Dodecaedro) */}
      <mesh ref={outerShieldRef}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={shieldColor}
          wireframe
          transparent
          opacity={isTransformed ? 0.7 : 0.4}
        />
      </mesh>

      {/* Grupo de Partículas Orbitantes */}
      <group ref={particleGroupRef}>
        {particles.map((p, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[p.scale, 8, 8]} />
            <meshBasicMaterial color={coreColor} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface Character3DProps {
  isTransformed: boolean;
}

export default function Character3D({ isTransformed }: Character3DProps) {
  return (
    <div className="w-full h-full min-h-[220px] max-h-[300px] flex items-center justify-center relative select-none">
      <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.4}>
          <ProceduralHero isTransformed={isTransformed} />
        </Float>
        
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={isTransformed ? 0.6 : 0.3} 
          scale={4} 
          blur={1.8} 
          far={3.0} 
        />
      </Canvas>
    </div>
  );
}
