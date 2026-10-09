import { useGLTF } from '@react-three/drei';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';

export const DRACO_DECODER = '/draco/';

/** Altura en la escena para que el personaje ocupe casi todo el encuadre. */
const TARGET_HEIGHT = 0.98;

/**
 * Zaigo tiene el pelo en el límite superior de la malla, así que el encuadre
 * general le corta la cabeza y lo deja alto. Solo él se baja y se reduce un poco.
 */
const MODEL_FIT: Record<string, { height: number; offsetY: number }> = {
  '/models/hero_zaigo.glb': { height: 0.84, offsetY: -0.14 },
};

const ENCOUNTER_MODELS: Record<string, string> = {
  'shadow-1': '/models/shadow.glb',
  'shadow-2': '/models/shadow.glb',
  'ghoul-1': '/models/ghoul.glb',
  'ghoul-2': '/models/ghoul.glb',
  'beast-1': '/models/beast.glb',
  'beast-2': '/models/beast.glb',
  'guardian-1': '/models/guardian.glb',
  'guardian-2': '/models/guardian.glb',
  wraith: '/models/wraith.glb',
  golem: '/models/golem.glb',
  spirit: '/models/spirit.glb',
  'ice-giant': '/models/giant.glb',
  demon: '/models/demon.glb',
  'dark-knight': '/models/dark-knight.glb',
  titan: '/models/titan.glb',
  colossus: '/models/colossus.glb',
};

export function modelPathForEncounter(encounterId?: string) {
  if (!encounterId) return undefined;
  return ENCOUNTER_MODELS[encounterId];
}

export function preloadGlb(path?: string) {
  if (!path) return;
  useGLTF.preload(path, DRACO_DECODER);
}

const _skinMatrix = new THREE.Matrix4();
const _vertex = new THREE.Vector3();
const _skinned = new THREE.Vector3();

function expandMeshBounds(mesh: THREE.Mesh, box: THREE.Box3) {
  const position = mesh.geometry.attributes.position;
  const skinned = mesh as THREE.SkinnedMesh;
  const skinIndex = mesh.geometry.attributes.skinIndex;
  const skinWeight = mesh.geometry.attributes.skinWeight;
  const step = Math.max(1, Math.floor(position.count / 2500));

  if (skinned.isSkinnedMesh && skinIndex && skinWeight) {
    skinned.skeleton.update();
    const bones = skinned.skeleton.boneMatrices;
    skinned.updateWorldMatrix(true, false);
    for (let i = 0; i < position.count; i += step) {
      _skinned.set(0, 0, 0);
      for (let influence = 0; influence < 4; influence++) {
        const weight = skinWeight.getComponent(i, influence);
        if (weight === 0) continue;
        const bone = skinIndex.getComponent(i, influence);
        _skinMatrix.fromArray(bones, bone * 16);
        _vertex.fromBufferAttribute(position, i).applyMatrix4(_skinMatrix).multiplyScalar(weight);
        _skinned.add(_vertex);
      }
      _skinned.applyMatrix4(skinned.matrixWorld);
      box.expandByPoint(_skinned);
    }
    return;
  }

  mesh.updateWorldMatrix(true, false);
  for (let i = 0; i < position.count; i += step) {
    _vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
    box.expandByPoint(_vertex);
  }
}

/** Clona el GLB, lo centra en el origen y lo escala a una altura visible. */
export function stageModel(source: THREE.Object3D, modelPath?: string) {
  const clone = cloneSkinned(source);
  clone.updateMatrixWorld(true);

  const box = new THREE.Box3();
  clone.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry?.attributes?.position) return;
    expandMeshBounds(mesh, box);
  });

  if (box.isEmpty()) return clone;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const fit = modelPath ? MODEL_FIT[modelPath] : undefined;
  const scale = (fit?.height ?? TARGET_HEIGHT) / Math.max(size.y, 0.001);
  clone.scale.multiplyScalar(scale);
  clone.position.copy(center).multiplyScalar(-scale);
  if (fit) clone.position.y += fit.offsetY;
  return clone;
}
