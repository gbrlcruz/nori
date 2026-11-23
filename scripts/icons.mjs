// Renders the PNG icons the PWA manifest and iOS need from public/icon.svg.
// Usage: npm run icons
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const svg = await readFile(new URL('../public/icon.svg', import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname;
const washi = { r: 0xf4, g: 0xec, b: 0xdd, alpha: 1 };

const render = (size) => sharp(svg, { density: 384 }).resize(size, size).png();

await render(192).toFile(out('icon-192.png'));
await render(512).toFile(out('icon-512.png'));
await render(180).toFile(out('apple-touch-icon.png'));
await render(32).toFile(out('favicon-32.png'));

// Maskable: keep the onigiri inside the central safe zone (80% circle) by shrinking it onto washi.
const inner = await render(352).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: washi } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(out('icon-maskable-512.png'));

console.log('Icons written to public/');
