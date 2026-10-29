#!/bin/sh
# Films mini Chanlito from chanlito.dev into the polaroid:
# assets/polaroid-light.webp and assets/polaroid-dark.webp.
# Needs Playwright's Chromium (bunx playwright install chromium) and Pillow.
set -e
cd "$(dirname "$0")"
rm -rf out/frames
bun layers.ts
for t in light dark; do
  node rasterize.cjs 2 out/base-$t.svg out/base-$t.png out/over-$t.svg out/over-$t.png
done
# 5.2 seconds at 25 fps; a tap on frame 55 makes him do the sampeah after the wave.
node capture.cjs 5.2 out/frames https://chanlito.dev/ 55
for t in light dark; do
  python3 film.py out/frames out/base-$t.png out/over-$t.png ../../../assets/polaroid-$t.webp 1 75
done
