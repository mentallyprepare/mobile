'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const fullMark = path.join(root, 'brand', 'logo-mark.svg');
const transparentMark = path.join(root, 'brand', 'logo-mark-transparent.svg');
const manifestPath = path.join(root, 'brand', 'generated-assets.json');
const generatorVersion = sharp.versions.sharp;
const pngOptions = { compressionLevel: 9, adaptiveFiltering: true };

function target(relativePath, width, height, render) {
  return {
    relativePath,
    width,
    height,
    output: path.join(root, relativePath),
    render,
  };
}

function fullMarkAt(size) {
  return sharp(fullMark, { density: 192 })
    .resize(size, size)
    .png(pngOptions)
    .toBuffer();
}

function transparentMarkAt(width) {
  return sharp(transparentMark, { density: 192 })
    .resize({ width })
    .png(pngOptions)
    .toBuffer();
}

async function adaptiveForeground() {
  const mark = await sharp(transparentMark, { density: 192 })
    .resize(624, 408)
    .png(pngOptions)
    .toBuffer();

  return sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: mark, left: 200, top: 308 }])
    .png(pngOptions)
    .toBuffer();
}

function adaptiveBackground() {
  return sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: '#050311',
    },
  })
    .png(pngOptions)
    .toBuffer();
}

const targets = [
  target('brand/app-icon-1024.png', 1024, 1024, () => fullMarkAt(1024)),
  target('brand/app-icon-512.png', 512, 512, () => fullMarkAt(512)),
  target('brand/app-icon-192.png', 192, 192, () => fullMarkAt(192)),
  target('brand/logo-mark-transparent-512.png', 512, 335, () => transparentMarkAt(512)),
  target('assets/images/icon.png', 1024, 1024, () => fullMarkAt(1024)),
  target('assets/images/favicon.png', 48, 48, () => fullMarkAt(48)),
  target('assets/images/splash-icon.png', 512, 335, () => transparentMarkAt(512)),
  target(
    'assets/images/android-icon-foreground.png',
    1024,
    1024,
    adaptiveForeground,
  ),
  target(
    'assets/images/android-icon-background.png',
    1024,
    1024,
    adaptiveBackground,
  ),
];

function digest(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sourceDigest() {
  return digest(
    Buffer.concat([
      fs.readFileSync(fullMark),
      Buffer.from('\0'),
      fs.readFileSync(transparentMark),
    ]),
  );
}

async function checkManifest() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error('brand/generated-assets.json is missing; run `npm run brand:generate`');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const drift = [];

  if (manifest.version !== 1) drift.push('generated asset manifest version is unsupported');
  if (manifest.generator !== `sharp@${generatorVersion}`) {
    drift.push(`manifest generator must be sharp@${generatorVersion}`);
  }
  if (manifest.sourceSha256 !== sourceDigest()) {
    drift.push('SVG source changed after the raster set was generated');
  }

  for (const item of targets) {
    if (!fs.existsSync(item.output)) {
      drift.push(`${item.relativePath} is missing`);
      continue;
    }

    const committed = fs.readFileSync(item.output);
    const metadata = await sharp(committed).metadata();
    if (metadata.width !== item.width || metadata.height !== item.height) {
      drift.push(
        `${item.relativePath} is ${metadata.width}x${metadata.height}; ` +
          `expected ${item.width}x${item.height}`,
      );
    }

    const recorded = manifest.outputs?.[item.relativePath];
    if (!recorded || recorded.sha256 !== digest(committed)) {
      drift.push(`${item.relativePath} differs from the generated asset manifest`);
    }
  }

  if (drift.length > 0) {
    for (const message of drift) console.error(`brand drift: ${message}`);
    console.error('Run `npm run brand:generate` and commit the regenerated PNGs.');
    process.exitCode = 1;
    return;
  }

  console.log(`brand assets match ${targets.length} generated targets`);
}

async function generate() {
  const outputs = {};

  for (const item of targets) {
    const buffer = await item.render();
    const metadata = await sharp(buffer).metadata();
    if (metadata.width !== item.width || metadata.height !== item.height) {
      throw new Error(
        `${item.relativePath} rendered at ${metadata.width}x${metadata.height}; ` +
          `expected ${item.width}x${item.height}`,
      );
    }

    fs.mkdirSync(path.dirname(item.output), { recursive: true });
    fs.writeFileSync(item.output, buffer);
    outputs[item.relativePath] = {
      width: item.width,
      height: item.height,
      sha256: digest(buffer),
    };
    console.log(`wrote ${item.relativePath} (${item.width}x${item.height})`);
  }

  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        version: 1,
        generator: `sharp@${generatorVersion}`,
        sources: ['brand/logo-mark.svg', 'brand/logo-mark-transparent.svg'],
        sourceSha256: sourceDigest(),
        outputs,
      },
      null,
      2,
    )}\n`,
  );
  console.log('wrote brand/generated-assets.json');
}

async function main() {
  if (checkOnly) {
    await checkManifest();
    return;
  }
  await generate();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
