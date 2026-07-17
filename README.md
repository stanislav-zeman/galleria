# Galleria

A photo gallery built with SvelteKit, prerendered to static HTML and deployed to GitHub Pages.

## Developing

Install dependencies, then start a dev server:

```sh
pnpm install
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

```sh
pnpm build
```

This prerenders the site to `build/` via `@sveltejs/adapter-static`. Preview the production build with `pnpm preview`.

Other useful scripts:

```sh
pnpm check   # svelte-check
pnpm lint    # prettier --check + eslint
pnpm format  # prettier --write
```

## Image hosting

Photo metadata (title, tags, camera specs, etc.) lives in `src/lib/photos.ts`. The actual image files are hosted externally in a cloud storage bucket and referenced by each photo's `key` field; `imageUrl()` builds the full URL from the `PUBLIC_IMAGE_BASE_URL` env var plus that key.

- **Locally:** copy `.env.example` to `.env` and set `PUBLIC_IMAGE_BASE_URL` to the bucket's public base URL.
- **In CI:** set `PUBLIC_IMAGE_BASE_URL` as a repository variable (Settings → Secrets and variables → Actions → Variables) — both `ci.yml` and `deploy.yml` read it from there.

If an image fails to load, the tile/lightbox falls back to a generated gradient placeholder instead of showing a broken image.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages at `https://<owner>.github.io/galleria/`. The `/galleria` base path is only applied to production builds (see `vite.config.ts`), so `pnpm dev` still runs at the domain root.
