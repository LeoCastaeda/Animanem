/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGLTF, Float, ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function Model({ url }: { url: string }) {
  // Nota: Deberás subir tu archivo .glb a la carpeta /public o referenciar una URL
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2} position={[0, -1, 0]} />;
}

export default function Character3D({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Model url={modelUrl} />
          </Float>
          <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={5} blur={2} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
