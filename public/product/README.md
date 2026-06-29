# Landing Product Images

The landing page renders product screenshots through `ThemedPicture`, which
serves AVIF first, WebP second, and PNG as the fallback. Keep all three formats
committed for every landing screenshot used by `src/app/landing/content.ts`.

When replacing or adding screenshots:

1. Export the dark and light PNG files into `public/product/`.
2. Run `pnpm landing:images` to regenerate matching `.webp` and `.avif` files.
3. Run `pnpm landing:images -- --check` to verify that every referenced PNG has
   both optimized variants.

The script reads the actual landing content for both locales, so it only
optimizes images that the page currently references. It requires the local
`cwebp` and `avifenc` command-line tools:

```bash
brew install webp libavif
pnpm landing:images
```

PNG files remain the fallback source and should not be deleted.
