import { useEffect, useState } from 'react';

/**
 * Dramatic Aurora Borealis Mesh Gradient Background.
 * - Full-viewport fixed container (`position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden;`).
 * - Autonomous, GPU-accelerated overlapping color nodes (deep space blacks, electric cyans,
 *   rich violets, and neon magentas) that drift, scale, and warp across a non-linear grid.
 * - Honors `data-effects="off"`, tab visibility, and `prefers-reduced-motion: reduce`.
 */
export default function AmbientBackground({
  enabled = true,
  theme = 'dark',
}) {
  const [tabActive, setTabActive] = useState(() => !document.hidden);

  useEffect(() => {
    const handleVisibility = () => {
      setTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const isPaused = !enabled || !tabActive;

  return (
    <div
      className="aurora-mesh-bg page-backdrop"
      aria-hidden="true"
      data-effects={enabled ? 'on' : 'off'}
      data-paused={isPaused ? 'true' : 'false'}
      data-theme={theme}
    >
      <div className="aurora-mesh__abyss" />
      <div className="aurora-mesh__grid">
        <div className="aurora-node aurora-node--cyan" />
        <div className="aurora-node aurora-node--violet" />
        <div className="aurora-node aurora-node--magenta" />
        <div className="aurora-node aurora-node--teal" />
        <div className="aurora-node aurora-node--indigo" />
      </div>
      <div className="aurora-mesh__veil" />
      <div className="page-backdrop__scrim" />
    </div>
  );
}
