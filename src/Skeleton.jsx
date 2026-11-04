import { useEffect, useState } from 'react';

/**
 * Genuine, accessible skeleton placeholder for pending media, lazy chunks or fetched details.
 * - Hidden from assistive technology (`aria-hidden="true"`) and non-focusable.
 * - Optional ~150 ms appearance delay prevents sub-frame flicker on cached/fast loads without delaying content.
 * - Static by default when reduced-motion is preferred or decorative effects are disabled;
 *   when shimmer is enabled, CSS runs 2 cycles (150 ms + 2 × 1.6 s = 3.35 s < 4 s) and settles to static
 *   while the truthful loading state (`aria-busy` on the parent region) continues until completion or error.
 */
export default function Skeleton({
  active = true,
  delayMs = 150,
  shimmer = true,
  effectsEnabled = true,
  className = '',
  style,
}) {
  const [visible, setVisible] = useState(() => delayMs <= 0 && active);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return undefined;
    }
    if (delayMs <= 0) {
      setVisible(true);
      return undefined;
    }
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  if (!active || !visible) return null;

  return (
    <div
      className={`skeleton ${shimmer && effectsEnabled ? 'skeleton--shimmer' : ''} ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-shimmer={shimmer && effectsEnabled ? 'true' : 'false'}
    />
  );
}

