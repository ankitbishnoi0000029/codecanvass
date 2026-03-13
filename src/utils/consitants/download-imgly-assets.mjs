/**
 * download-imgly-assets.mjs
 *
 * Downloads all model/wasm files from the same CDN that
 * @imgly/background-removal uses at runtime, and saves them
 * to public/imgly/ so the library can be pointed at your own server.
 *
 * Add to package.json:
 *   "postinstall": "node scripts/download-imgly-assets.mjs"
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { readFileSync } from 'fs';
import { join } from 'path';

const DEST = './public/imgly';

async function main() {
  // Read the exact version from the installed package
  let version = '1.7.0';
  try {
    const pkg = JSON.parse(
      readFileSync('./node_modules/@imgly/background-removal/package.json', 'utf8')
    );
    version = pkg.version;
  } catch {
    console.log(`[imgly] Could not read installed version, defaulting to ${version}`);
  }

  const BASE_URL = `https://staticimgly.com/@imgly/background-removal-data/${version}/dist/`;
  console.log(`[imgly] Source : ${BASE_URL}`);
  console.log(`[imgly] Dest   : ${DEST}`);

  // Create destination directory
  if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

  // ── Step 1: download resources.json ──────────────────────────────────────
  const resUrl = `${BASE_URL}resources.json`;
  console.log('[imgly] Fetching resources.json ...');
  const resResponse = await fetch(resUrl);
  if (!resResponse.ok) {
    throw new Error(
      `Failed to fetch resources.json (HTTP ${resResponse.status}).\n` +
      `Make sure you have internet access during npm install.`
    );
  }
  const resourcesText = await resResponse.text();
  writeFileSync(join(DEST, 'resources.json'), resourcesText);
  const resources = JSON.parse(resourcesText);
  console.log('[imgly] Saved resources.json');

  // ── Step 2: collect all unique chunk filenames ────────────────────────────
  const allChunks = new Set();
  for (const entry of Object.values(resources)) {
    for (const chunk of entry.chunks) {
      // CDN version uses chunk.name; npm data package uses chunk.hash — handle both
      allChunks.add(chunk.name ?? chunk.hash);
    }
  }

  // ── Step 3: download each chunk (skip if already exists) ─────────────────
  const total = allChunks.size;
  console.log(`[imgly] Downloading ${total} asset chunks ...`);
  let done = 0;
  let skipped = 0;

  for (const chunkName of allChunks) {
    const destFile = join(DEST, chunkName);

    if (existsSync(destFile)) {
      skipped++;
      done++;
      process.stdout.write(`\r[imgly] ${done}/${total} (${skipped} cached)`);
      continue;
    }

    const url = `${BASE_URL}${chunkName}`;
    const r = await fetch(url);
    if (!r.ok) {
      console.warn(`\n[imgly] WARNING: failed to download ${chunkName} (HTTP ${r.status})`);
      continue;
    }
    const buf = await r.arrayBuffer();
    writeFileSync(destFile, Buffer.from(buf));
    done++;
    process.stdout.write(`\r[imgly] ${done}/${total} (${skipped} cached)`);
  }

  console.log(`\n[imgly] Complete — ${done} files saved to ${DEST}`);
  if (skipped > 0) console.log(`[imgly] (${skipped} already existed, skipped re-download)`);
}

main().catch(e => {
  console.error('\n[imgly] Fatal error:', e.message);
  process.exit(1);
});
