/**
 * Reduce los GLB de juego a un tamaño cargable en el navegador.
 * Los originales siguen en public/models_backup.
 *
 * Uso: node scripts/optimize-models.mjs [archivo.glb ...]
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, prune, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_TRIANGLES = 18000;
const SIMPLIFY_ERROR = 0.05;

const DEFAULT_FILES = [
  'hero.glb',
  'hero_zaigo.glb',
  'hero_wiku.glb',
  'hero_scrapy.glb',
  'shadow.glb',
  'ghoul.glb',
  'beast.glb',
  'guardian.glb',
  'wraith.glb',
  'golem.glb',
  'spirit.glb',
  'giant.glb',
  'demon.glb',
  'dark-knight.glb',
  'titan.glb',
  'colossus.glb',
];

const root = process.cwd();
const sourceDir = path.join(root, 'public', 'models_backup');
const outputDir = path.join(root, 'public', 'models');

function triangleCount(document) {
  let triangles = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices();
      triangles += indices ? indices.getCount() / 3 : 0;
    }
  }
  return Math.round(triangles);
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
  });

const requested = process.argv.slice(2);
const files = requested.length > 0 ? requested : DEFAULT_FILES;

await MeshoptSimplifier.ready;

for (const file of files) {
  const input = path.join(sourceDir, file);
  const output = path.join(outputDir, file);
  if (!fs.existsSync(input)) {
    console.error(`No está el original: ${input}`);
    continue;
  }

  const beforeBytes = fs.statSync(input).size;
  console.log(`\n${file}  ${(beforeBytes / 1024 / 1024).toFixed(1)} MB`);
  let document;
  try {
    document = await io.read(input);
  } catch (error) {
    console.error(`  no se pudo leer: ${error.message}`);
    continue;
  }
  const beforeTris = triangleCount(document);
  const ratio = Math.min(1, TARGET_TRIANGLES / Math.max(beforeTris, 1));

  try {
    if (ratio < 0.95) {
      await document.transform(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio,
          error: SIMPLIFY_ERROR,
          lockBorder: true,
        }),
      );
      const remaining = triangleCount(document);
      if (remaining > TARGET_TRIANGLES * 2) {
        await document.transform(
          simplify({
            simplifier: MeshoptSimplifier,
            ratio: TARGET_TRIANGLES / remaining,
            error: 0.2,
            lockBorder: false,
          }),
        );
      }
    }

    await document.transform(dedup(), prune(), draco({ method: 'edgebreaker' }));
  } catch (error) {
    console.error(`  falló la optimización: ${error.message}`);
    continue;
  }

  const tmp = output.replace(/\.glb$/i, '.optimizing.glb');
  await io.write(tmp, document);
  fs.renameSync(tmp, output);

  const afterBytes = fs.statSync(output).size;
  const afterTris = triangleCount(await io.read(output));
  console.log(
    `  ${beforeTris.toLocaleString()} → ${afterTris.toLocaleString()} tris, ` +
      `${(beforeBytes / 1024 / 1024).toFixed(1)} MB → ${(afterBytes / 1024).toFixed(0)} KB`,
  );
}
