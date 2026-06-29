import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";

import {
  getLandingContent,
  imageSrcForTheme,
  type LandingTheme,
  type ProductImageSource,
  type SurfaceGalleryImage,
} from "../src/app/landing/content";
import type { Locale } from "../src/lib/i18n";

const ROOT = process.cwd();
const LOCALES: Locale[] = ["en", "zh"];
const THEMES: LandingTheme[] = ["dark", "light"];

function collectLandingPngs() {
  const srcs = new Set<string>();

  for (const locale of LOCALES) {
    const content = getLandingContent(locale);
    const images: Array<ProductImageSource | SurfaceGalleryImage> = [content.showcaseImage];

    for (const card of content.surfaceCards) {
      if (card.image) images.push(card.image);
      if (card.gallery) images.push(...card.gallery);
    }

    for (const image of images) {
      for (const theme of THEMES) {
        srcs.add(imageSrcForTheme(image, theme));
      }
    }
  }

  return [...srcs].sort().map((src) => resolve(ROOT, `public${src}`));
}

function derivedPath(pngPath: string, extension: "avif" | "webp") {
  return pngPath.replace(/\.png$/, `.${extension}`);
}

function display(path: string) {
  return relative(ROOT, path);
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    throw new Error(
      `${command} is required to optimize landing images. On macOS, install it with: brew install webp libavif`,
    );
  }
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

function checkTool(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "ignore" });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} is required to optimize landing images. On macOS, install it with: brew install webp libavif`,
    );
  }
}

function checkOnly(pngs: string[]) {
  const missing: string[] = [];
  for (const pngPath of pngs) {
    if (!existsSync(pngPath)) missing.push(display(pngPath));
    for (const extension of ["webp", "avif"] as const) {
      const outputPath = derivedPath(pngPath, extension);
      if (!existsSync(outputPath)) missing.push(display(outputPath));
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing landing image variants:\n${missing.map((path) => `- ${path}`).join("\n")}`);
  }

  console.log(`Landing image variants are complete for ${pngs.length} PNG sources.`);
}

function optimize(pngs: string[]) {
  checkTool("cwebp", ["-version"]);
  checkTool("avifenc", ["--version"]);

  for (const pngPath of pngs) {
    if (!existsSync(pngPath)) {
      throw new Error(`Missing source PNG: ${display(pngPath)}`);
    }

    const webpPath = derivedPath(pngPath, "webp");
    const avifPath = derivedPath(pngPath, "avif");
    console.log(`Optimizing ${display(pngPath)}`);
    run("cwebp", ["-quiet", "-q", "82", "-m", "6", pngPath, "-o", webpPath]);
    run("avifenc", ["-q", "62", "--speed", "6", pngPath, avifPath]);
  }

  console.log(`Optimized ${pngs.length} landing PNG sources.`);
}

const pngs = collectLandingPngs();
if (process.argv.includes("--check")) {
  checkOnly(pngs);
} else {
  optimize(pngs);
}
