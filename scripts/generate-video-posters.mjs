#!/usr/bin/env node
/**
 * Extracts a first-frame still from each background video and writes it as a
 * .webp poster.
 *
 * Every <video> on the public site is a decorative background loop with
 * preload="none". Without a poster the hero renders blank until the video
 * downloads, and Google Search Console reports the video as unindexable with
 * "No thumbnail URL provided" (WNC-20237597) because it has no thumbnail
 * source to fall back on.
 *
 * Most posters already live in public/assets/publicAssets/images/home/heroFrames/.
 * This script generates the ones that were still missing.
 *
 * Usage: npm run generate:posters
 *
 * Requires ffmpeg. If it isn't on PATH the script falls back to `npx
 * ffmpeg-static`, which downloads a prebuilt binary on first run.
 */

import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Videos whose first frame is not already checked in as a still.
// `at` is the timestamp to grab — 0 is usually fine, but a video that fades in
// from black needs a later offset to produce a usable thumbnail.
const TARGETS = [
  {
    video: "public/assets/video/Contactusbg.webm",
    poster: "public/assets/video/posters/Contactusbg.webp",
    at: "00:00:00.5",
  },
  {
    video: "public/assets/video/hero8.mp4",
    poster: "public/assets/video/posters/hero8.webp",
    at: "00:00:00.5",
  },
];

function resolveFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;

  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return "ffmpeg";
  } catch {
    console.error(
      "ffmpeg not found.\n" +
        "  Install it (brew install ffmpeg), or point FFMPEG at a binary:\n" +
        "  npm i -g ffmpeg-static && FFMPEG=$(node -p \"require('ffmpeg-static')\") npm run generate:posters",
    );
    process.exit(1);
  }
}

const ffmpeg = resolveFfmpeg();

let generated = 0;
let skipped = 0;

for (const { video, poster, at } of TARGETS) {
  const videoPath = resolve(ROOT, video);
  const posterPath = resolve(ROOT, poster);

  if (!existsSync(videoPath)) {
    console.warn(`! missing source video, skipping: ${video}`);
    skipped += 1;
    continue;
  }

  if (existsSync(posterPath)) {
    console.log(`= already exists, skipping: ${poster}`);
    skipped += 1;
    continue;
  }

  mkdirSync(dirname(posterPath), { recursive: true });

  execFileSync(
    ffmpeg,
    [
      "-loglevel", "error",
      "-ss", at,
      "-i", videoPath,
      "-frames:v", "1",
      // Cap the long edge at 1280px — a poster only needs to cover the hero,
      // and Google's thumbnail requirements top out well below this.
      "-vf", "scale='min(1280,iw)':-2",
      "-c:v", "libwebp",
      "-quality", "80",
      posterPath,
    ],
    { stdio: "inherit" },
  );

  console.log(`+ ${poster}`);
  generated += 1;
}

console.log(`\nDone — ${generated} generated, ${skipped} skipped.`);
