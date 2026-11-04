# React Bits — Liquid Ether reference & license

Adapted from [React Bits — Liquid Ether](https://reactbits.dev/backgrounds/liquid-ether) (`src/tailwind/Backgrounds/LiquidEther/LiquidEther.jsx` in `DavidHDev/react-bits`, inspected on 1 November 2026). The upstream implementation uses native WebGL2 without Three.js or OGL.

## Portfolio adaptations

- Mounted once as a fixed, full-viewport layer behind the whole page (`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none`) over a static theme-matched CSS gradient (`--page-gradient`) with a uniform readability scrim (`--page-scrim`).
- Palette resolved live from CSS custom properties (`--fluid-low`, `--fluid-mid`, `--fluid-high`, `--background`) on `document.documentElement` so light/dark theme switches update the 1D palette texture in-place without recreating the WebGL2 context.
- Click bursts (`clickBurst = false`), rainbow palettes, and intense highlight flashes are disabled; flow uses broad, slow blue motion (`#105BFF` / `#8EB1FF` / `#32435F`) with restrained blush highlights (`#FFC1CC`) and a gentle cursor wake that dissipates.
- Resource budgets: 30 fps decorative frame target, device-pixel-ratio cap of `1.25`, base simulation resolution `0.25`, pixel budget cap, bounded pressure iterations, cached container geometry (no per-event `getBoundingClientRect`), adaptive quality step-down with cooldowns, and full WebGL resource cleanup on partial init failure or unmount.

## Upstream License

```text
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software as part of an
application, website, or product, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

Commons Clause Restriction:
You may use this Software, including for any commercial purpose, so long as you
do not sell, sublicense, or redistribute the components themselves—whether
alone, in a bundle, or as a ported version.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

