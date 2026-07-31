'use strict';

// Reads the canonical palette and measures it. The privacy promise used to be
// the least readable text on the screen; this fails the build if any token
// that carries words drifts back below WCAG AA.
// Run: npm run test:contrast

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-contrast-test-'));
execFileSync(
  process.execPath,
  [
    require.resolve('typescript/bin/tsc'),
    path.join(root, 'src', 'design', 'colors.ts'),
    '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--noResolve',
  ],
  { stdio: 'pipe', cwd: OUT },
);
const { brand, daylight } = require(path.join(OUT, 'colors.js'));

// --- WCAG 2.1 relative luminance and contrast, with alpha composited first ---
const parse = (value) => {
  if (value.startsWith('#')) {
    const h = value.slice(1);
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), alpha: 1 };
  }
  const parts = value.match(/rgba?\(([^)]+)\)/)[1].split(',').map((n) => parseFloat(n.trim()));
  return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
};
const composite = (fg, bg) => {
  const f = parse(fg);
  const b = parse(bg);
  return f.rgb.map((v, i) => v * f.alpha + b.rgb[i] * (1 - f.alpha));
};
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fg, bg) => {
  const a = luminance(composite(fg, bg));
  const b = luminance(parse(bg).rgb);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;
// Every ground that text is actually drawn on.
const GROUNDS = { void: brand.void, card: brand.card, sky: brand.sky };

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('the contrast maths agrees with the WCAG reference cases', () => {
  assert.strictEqual(Math.round(contrast('#FFFFFF', '#000000')), 21);
  assert.strictEqual(Math.round(contrast('#000000', '#000000')), 1);
  // A known mid-grey: #767676 on white is the canonical 4.54:1 AA boundary.
  assert.ok(Math.abs(contrast('#767676', '#FFFFFF') - 4.54) < 0.05);
});

test('every ink token that carries words meets AA on every ground', () => {
  for (const token of ['ink', 'inkMid', 'inkLow']) {
    for (const [name, ground] of Object.entries(GROUNDS)) {
      const ratio = contrast(brand[token], ground);
      assert.ok(
        ratio >= AA_NORMAL,
        `brand.${token} on ${name} is ${ratio.toFixed(2)}:1, below ${AA_NORMAL}`,
      );
    }
  }
});

test('the privacy line is no longer the least readable text on the screen', () => {
  // "Only you can see this before the scheduled reveal." is inkLow on card.
  const privacy = contrast(brand.inkLow, brand.card);
  assert.ok(privacy >= AA_NORMAL, `privacy text is ${privacy.toFixed(2)}:1`);
  // It was 3.25:1 before this change; hold the improvement.
  assert.ok(privacy > 4.9, `expected a real margin, got ${privacy.toFixed(2)}:1`);
});

test('the ramp still reads as a ramp', () => {
  const ink = contrast(brand.ink, brand.void);
  const mid = contrast(brand.inkMid, brand.void);
  const low = contrast(brand.inkLow, brand.void);
  assert.ok(ink > mid && mid > low, 'each step must be quieter than the one above');
  assert.ok(
    low < mid - 0.5,
    'inkLow must stay visibly quieter than inkMid, not collapse into it',
  );
});

test('destructive text and fills meet AA', () => {
  for (const [name, ground] of Object.entries(GROUNDS)) {
    const ratio = contrast(brand.danger, ground);
    assert.ok(ratio >= AA_NORMAL, `danger on ${name} is ${ratio.toFixed(2)}:1`);
  }
  const label = contrast(daylight.onDanger, brand.danger);
  assert.ok(label >= AA_NORMAL, `danger button label is ${label.toFixed(2)}:1`);
});

test('structural tokens clear the 3:1 needed to be seen at all', () => {
  for (const [name, ground] of Object.entries(GROUNDS)) {
    const ratio = contrast(brand.inkFaint, ground);
    assert.ok(
      ratio >= AA_LARGE,
      `brand.inkFaint on ${name} is ${ratio.toFixed(2)}:1, below ${AA_LARGE}`,
    );
  }
});

test('brand accents used for large display type clear 3:1', () => {
  for (const token of ['rose', 'gold', 'purple']) {
    for (const [name, ground] of Object.entries(GROUNDS)) {
      const ratio = contrast(brand[token], ground);
      assert.ok(
        ratio >= AA_LARGE,
        `brand.${token} on ${name} is ${ratio.toFixed(2)}:1`,
      );
    }
  }
});

test('the daylight aliases inherit the same guarantees', () => {
  assert.strictEqual(daylight.inkLow, brand.inkLow);
  assert.strictEqual(daylight.danger, brand.danger);
  assert.ok(contrast(daylight.inkLow, daylight.surface) >= AA_NORMAL);
});

test('no screen re-declares the danger colour by hand', () => {
  const screens = [
    ...fs.readdirSync(path.join(root, 'app')).map((f) => path.join('app', f)),
  ].filter((f) => f.endsWith('.tsx'));
  for (const file of screens) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(
      source,
      /#A1445A/i,
      `${file} still hard-codes the old low-contrast danger colour`,
    );
  }
});

(async () => {
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('ok   -', name);
      passed++;
    } catch (err) {
      console.error('FAIL -', name);
      console.error('      ', err.message);
      process.exitCode = 1;
    }
  }
  fs.rmSync(OUT, { recursive: true, force: true });
  console.log(`\n${passed}/${tests.length} contrast tests passed.`);
})();
