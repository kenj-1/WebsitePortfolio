# Kenji Balili — Portfolio

A responsive, accessible personal portfolio built with React 19, Vite 6, and Tailwind CSS v4. Designed for software/IT internship applications and personal branding with a semantic blue/blush/neutral color system, genuine skeleton loading, and a hero-scoped WebGL2 fluid gradient background.

## Getting started

1. Install Node.js (current LTS release) and run `npm install`.
2. Run `npm run dev` and open the local URL shown in the terminal.
3. Run `npm run build` to produce the static production build in `dist/`.

## Where to edit content, tokens, and effect settings

### 1. Portfolio content (`src/content.js`)
- **Profile & Contact (`profile`, `socialLinks`):** Update your introduction, degree/graduation note, email, phone number, Telegram username link, and confirmed public social profiles.
- **Hero Portrait Stack (`heroPhotos`):** Put portrait images in `public/photos/` and update `src`, `alt`, and optional `objectPosition` in `heroPhotos`. Empty `src` entries intentionally render the built-in `KB` monogram silhouette placeholder. When a real photo URL is provided, only that card shows a skeleton while loading/decoding and falls back to the `KB` placeholder on error.
- **Projects (`projects`):** Add or edit project objects with a stable `id`, `name`, `type`, `status`, `summary`, `description`, `tags`, `highlights`, and optional `role`, `context`, `image`, `imageSrcSet`, `imageSizes`, `imageWidth`, `imageHeight`, and `imageAlt`.
  - Keep roles and outcomes factual; omit `role` when undocumented.
  - When `image` is provided, the card and dialog render the responsive screenshot with genuine skeleton loading and retry-on-error. When omitted, `visual` (`'music' | 'document' | 'game'`) renders the built-in concept preview.
- **Technical Journey (`techJourney`):** One flat array grouped automatically by the year learning began (**2024:** C; **2025:** Java, HTML, CSS, JavaScript, Tailwind CSS, Figma; **2026:** Python, React, SQL, Supabase, Spring Boot). Each card is keyboard/click/tap accessible and opens a details dialog with optional `learningPoints`, `applications`, and `relatedProjectIds`.
- **Experience & Recognition (`experiences`, `recognition`):** Add or update student leadership, internship/work experience, and academic honors.

### 2. Design tokens & styling (`src/styles/tokens.css`, `src/style.css`)
- **Primitives & Semantic Tokens (`src/styles/tokens.css`):**
  - Anchors: `#F0F0F0` (light background / dark foreground), `#105BFF` (`primary`), and `#FFC1CC` (`accent` surface paired with dark `#562633` `accent-foreground`).
  - Both light (`:root`, `:root[data-theme='light']`) and dark (`:root[data-theme='dark']`) semantic tokens (`--background`, `--surface`, `--surface-raised`, `--foreground`, `--muted-foreground`, `--border-subtle`, `--border-control`, `--primary`, `--primary-hover`, `--primary-foreground`, `--link`, `--accent`, `--accent-foreground`, `--focus-ring`, `--skeleton-base`, `--skeleton-highlight`, `--success`, `--warning`, `--danger`) are bridged to Tailwind v4 via `@theme inline`.
  - Spacing, border radii, shadows, short transition durations (`140ms–240ms`), skeleton timing (`150ms` delay, 2 shimmer cycles settling within 4s), and glass settings are centralized in `:root`.
- **Component & Layout Rules (`src/style.css`):** Consumes only the semantic tokens and responsive layout rules without count-dependent `:nth-child` selectors.

### 3. Decorative effects & motion controls
- **Global Decorative Effects Toggle (`src/AmbientEffectsToggle.jsx`):** Stored in `localStorage` under `kenji-portfolio-ambient` (`'on' | 'off'`). Turning decorative effects off (or enabling OS/browser `prefers-reduced-motion: reduce`) stops hero fluid simulation, hero card stack cycling, project card 3D hover tilt, and skeleton shimmer while keeping all functional focus/hover feedback active.
- **Dramatic Aurora Mesh Gradient Background (`src/AmbientBackground.jsx`, `src/style.css`):**
  - Mounted at the root of `App` as `.aurora-mesh-bg.page-backdrop` with `position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; overflow: hidden; background-color: #02030a;`.
  - Autonomous, fluid, GPU-accelerated overlapping color nodes (`.aurora-node--cyan`, `--violet`, `--magenta`, `--teal`, `--indigo`) that slowly drift, scale, and warp across a non-linear grid using `will-change: transform` and `translate3d`/`scale3d`/`skewX` keyframes (`auroraDrift1` through `auroraDrift5` over 20s–28s cycles).
  - Persists smoothly across all scrolling sections without clipping or contained modals; all section divider lines are completely removed for natural flow.
  - Pauses cleanly without animation overhead when `prefers-reduced-motion: reduce` or the ambient effects toggle (`[data-effects='off']`) is set.
- **Dynamic Local Asset Scanner & Hackathons Section (`vite.config.js`, `src/assetScanner.js`, `src/main.jsx`):**
  - `vite-plugin-portfolio-asset-scanner` dynamically scans `assets/hackathons`, `assets/achievements`, and `assets/projects` in the root directory, bundling discovered images and extracting JSON/Markdown metadata into `virtual:portfolio-assets`.
  - Generates the dedicated **Hackathons & Competitions** (`#hackathons`) section with category filtering (`All Entries`, `Hackathons`, `Achievements`), 3D `TiltCard` parallax/glare cards, and an interactive multi-artifact gallery inside `ProjectDialog`.
- **3D Tilt + Glare Panels (`src/TiltCard.jsx`, `src/useProjectCardMotion.js`):** Reusable wrapper (used by every project card) that adds CSS `perspective` (`--tilt-perspective: 1000px`), `transform-style: preserve-3d`, parallax depth on children marked `tilt-depth` / `tilt-depth tilt-depth--near`, a frosted-glass layer (`--tilt-glass-blur: 16px`) and a specular glare that sits opposite the cursor. Pointer maths run inside one `requestAnimationFrame` per card (no React state), the rect is cached and invalidated on resize/scroll/`ResizeObserver`, and an `IntersectionObserver` attaches pointer/scroll/resize listeners only while the card is near the viewport. Tilt is capped at 3°, pauses on keyboard focus, and is off for reduced motion, coarse pointers, hidden tabs and the global effects-off toggle. To wrap another panel: `<TiltCard as="section" className="my-panel" surfaceClassName="my-panel__surface">…</TiltCard>`; the glare/glass layers are `pointer-events: none`, so inputs and links inside stay interactive.
- **Project Card Hover Motion (`src/useProjectCardMotion.js`):** Coalesces pointer and scroll updates into a single `requestAnimationFrame` loop per active card, separating DOM layout reads from CSS variable writes, capped at `1.8°–2.5°` tilt and `2–3px` lift.

## Source references & attributions

- **Infinite Diagonal Gradient Stream (`src/AmbientBackground.jsx`, `src/style.css`):** Hardware-accelerated oversized flowing gradient stream with GPU-promoted translation, subtle noise overlay, and reduced-motion fallback.
- **Project Card Glow (`src/style.css`):** Adapted from Uiverse.io by Tiagoadag (`docs/references/uiverse-project-glow.md`).
- **Technical Journey Card Layout (`src/TechCard.jsx`, `src/style.css`):** Adapted from Uiverse.io by dylanharriscameron (MIT).
- **Social Link Tooltips (`src/SocialLinks.jsx`, `src/style.css`):** Adapted from Uiverse.io by david-mohseni (MIT).
