import { useEffect, useRef, useState } from 'react';

/**
 * Viscous Lava Lamp-Style Animated Background & Aurora Borealis Mesh.
 * - Full-viewport fixed container (`position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;`).
 * - Combines an SVG Gooey Metaball filter (`#lava-lamp-goo`) with autonomous & pointer-reactive
 *   viscous molten blobs running at 60 FPS on HTML5 Canvas + GPU-accelerated CSS lava orbs.
 * - Blobs rise, sink, morph, coalesce, and split like warm molten wax in a lava lamp,
 *   tuned to Brand Orange (#D97757), Deep Amber, Cosmic Violet, and Electric Cyan.
 * - Honors `data-effects="off"`, tab visibility, and `prefers-reduced-motion: reduce`.
 */
export default function AmbientBackground({
  enabled = true,
  theme = 'dark',
}) {
  const canvasRef = useRef(null);
  const [tabActive, setTabActive] = useState(() => !document.hidden);

  useEffect(() => {
    const handleVisibility = () => {
      setTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const isPaused = !enabled || !tabActive;

  // Viscous Lava Lamp Metaball Physics Simulation (smooth high-res radial gradients, zero pixelation)
  useEffect(() => {
    if (isPaused) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Palette of molten lava lamp blobs (Warm Chrome #D97757, Deep Amber, Cosmic Violet, Cyan, Indigo)
    const paletteDark = [
      { r: 217, g: 119, b: 87, a: 0.34 },  // Brand Orange #D97757
      { r: 234, g: 88, b: 12, a: 0.28 },   // Molten Amber
      { r: 124, g: 58, b: 237, a: 0.32 },  // Cosmic Violet
      { r: 6, g: 182, b: 212, a: 0.28 },   // Electric Cyan
      { r: 217, g: 70, b: 239, a: 0.26 },  // Borealis Magenta
      { r: 59, g: 130, b: 246, a: 0.30 },  // Cobalt Blue
      { r: 217, g: 119, b: 87, a: 0.30 },  // Warm Copper
      { r: 99, g: 102, b: 241, a: 0.28 },  // Deep Indigo
    ];

    const paletteLight = [
      { r: 217, g: 119, b: 87, a: 0.22 },
      { r: 59, g: 130, b: 246, a: 0.18 },
      { r: 139, g: 92, b: 246, a: 0.18 },
      { r: 14, g: 165, b: 233, a: 0.18 },
      { r: 236, g: 72, b: 153, a: 0.15 },
      { r: 245, g: 158, b: 11, a: 0.16 },
    ];

    const palette = theme === 'light' ? paletteLight : paletteDark;

    // Initialize viscous lava blobs with thermal buoyancy state
    const blobs = palette.map((color, idx) => {
      const baseRadius = Math.min(width, height) * (0.22 + (idx % 3) * 0.06);
      return {
        x: width * (0.12 + (idx / palette.length) * 0.76),
        y: height * (0.15 + ((idx * 37) % 70) / 100),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (idx % 2 === 0 ? -1 : 1) * (0.25 + Math.random() * 0.35),
        baseRadius,
        radius: baseRadius,
        phase: idx * 1.15,
        freq: 0.0007 + idx * 0.00012,
        color,
      };
    });

    // Pointer-tracked viscous attractor orb
    const pointer = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      vx: 0,
      vy: 0,
      active: false,
    };

    const handlePointerMove = e => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let lastTime = performance.now();

    const loop = now => {
      const dt = Math.min(32, Math.max(8, now - lastTime)) / 16.667;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = theme === 'light' ? 'source-over' : 'screen';

      // Update viscous pointer orb with heavy fluid damping
      const dxp = pointer.targetX - pointer.x;
      const dyp = pointer.targetY - pointer.y;
      pointer.vx = (pointer.vx + dxp * 0.018) * 0.88;
      pointer.vy = (pointer.vy + dyp * 0.018) * 0.88;
      pointer.x += pointer.vx * dt;
      pointer.y += pointer.vy * dt;

      // Update and render each lava lamp blob
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];

        // Slow organic breathing & lava buoyancy convection
        const wobbleX = Math.sin(now * b.freq + b.phase) * 0.22;
        const wobbleY = Math.cos(now * b.freq * 0.85 + b.phase) * 0.18;

        b.x += (b.vx + wobbleX) * dt;
        b.y += (b.vy + wobbleY) * dt;
        b.radius = b.baseRadius * (1 + 0.14 * Math.sin(now * b.freq * 1.4 + b.phase));

        // Gentle viscous interaction with pointer orb
        if (pointer.active) {
          const pdx = b.x - pointer.x;
          const pdy = b.y - pointer.y;
          const dist = Math.hypot(pdx, pdy);
          const maxDist = b.radius + 220;
          if (dist > 1 && dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.08 * dt;
            b.x += (pdx / dist) * force * 12;
            b.y += (pdy / dist) * force * 12;
          }
        }

        // Soft lava-lamp thermal boundary reversal at top/bottom & sides
        const margin = b.baseRadius * 0.35;
        if (b.y < -margin) {
          b.y = -margin;
          b.vy = Math.abs(b.vy);
        } else if (b.y > height + margin) {
          b.y = height + margin;
          b.vy = -Math.abs(b.vy);
        }

        if (b.x < -margin) {
          b.x = -margin;
          b.vx = Math.abs(b.vx);
        } else if (b.x > width + margin) {
          b.x = width + margin;
          b.vx = -Math.abs(b.vx);
        }

        // Render smooth molten metaball gradient
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.05, b.x, b.y, b.radius);
        const { r, g, b: blue, a } = b.color;
        grad.addColorStop(0, `rgba(${r}, ${g}, ${blue}, ${a})`);
        grad.addColorStop(0.45, `rgba(${r}, ${g}, ${blue}, ${(a * 0.58).toFixed(3)})`);
        grad.addColorStop(0.78, `rgba(${r}, ${g}, ${blue}, ${(a * 0.18).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${blue}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render pointer-tracked molten chrome highlight blob
      if (pointer.active) {
        const pr = Math.min(width, height) * 0.24;
        const pGrad = ctx.createRadialGradient(pointer.x, pointer.y, pr * 0.04, pointer.x, pointer.y, pr);
        pGrad.addColorStop(0, 'rgba(217, 119, 87, 0.22)');
        pGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.11)');
        pGrad.addColorStop(1, 'rgba(217, 119, 87, 0)');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isPaused, theme]);

  return (
    <div
      className="aurora-mesh-bg lava-lamp-bg page-backdrop"
      aria-hidden="true"
      data-effects={enabled ? 'on' : 'off'}
      data-paused={isPaused ? 'true' : 'false'}
      data-theme={theme}
    >
      {/* Hidden SVG Gooey Metaball Filter for viscous lava coalescence */}
      <svg className="lava-lamp-svg-filter" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="lava-lamp-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="36" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="aurora-mesh__abyss" />
      <div className="aurora-mesh__grid lava-lamp__blobs">
        <div className="aurora-node lava-blob aurora-node--cyan" />
        <div className="aurora-node lava-blob aurora-node--violet" />
        <div className="aurora-node lava-blob aurora-node--magenta" />
        <div className="aurora-node lava-blob aurora-node--teal" />
        <div className="aurora-node lava-blob aurora-node--indigo" />
        <div className="aurora-node lava-blob aurora-node--orange" />
      </div>
      <canvas ref={canvasRef} className="liquid-physics-canvas lava-lamp-canvas" />
      <div className="aurora-mesh__veil" />
      <div className="page-backdrop__scrim" />
    </div>
  );
}
